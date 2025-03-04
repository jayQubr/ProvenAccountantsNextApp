'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { Toaster, toast } from 'sonner';
import CustomInput from '@/components/ui/CustomInput';
import SubmitButton from '@/components/features/SubmitButton';
import { checkExistingBASLodgement, submitBASLodgement } from '@/lib/basLodgementCopy';
import LoadingSpinner from '@/components/features/LoadingSpinner';
import useStore from '@/utils/useStore';
import RegistrationStatusBanner from '@/components/features/RegistrationStatusBanner';
import { RegistrationStatus } from '@/lib/registrationService';

interface BASLodgementData {
  quarter: string;
  details: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'rejected';
  createdAt?: number;
  updatedAt?: number;
  notes?: string;
}

const BASLodgementCopy = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingBAS, setExistingBAS] = useState<(BASLodgementData & { id: string }) | null>(null);
  const router = useRouter();
  const { user } = useStore();
  const [basData, setBasData] = useState({
    quarter: '',
    details: '',
  });

  useEffect(() => {
    const checkRegistration = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const userId = user.uid || user.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const result = await checkExistingBASLodgement(userId);
        if (result.exists && result.data) {
          setExistingBAS(result.data);
          setBasData({
            quarter: result.data.quarter || '',
            details: result.data.details || '',
          });

          if (result.data.status === 'completed') {
            toast.success('BAS Lodgement Copy processed successfully!', { style: { background: '#10B981', color: 'white' } });
          } else if (result.data.status === 'in-progress') {
            toast.info('BAS Lodgement Copy is being processed', { style: { background: '#3B82F6', color: 'white' } });
          } else if (result.data.status === 'rejected') {
            toast.error('BAS Lodgement Copy was rejected', { style: { background: '#EF4444', color: 'white' } });
          }
        }
      } catch (error) {
        console.error('Failed to check BAS lodgement:', error);
        toast.error('Failed to check registration', { style: { background: '#EF4444', color: 'white' } });
      } finally {
        setLoading(false);
      }
    };

    checkRegistration();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBasData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!basData.quarter.trim()) newErrors.quarter = 'Quarter is required';
    if (!basData.details.trim()) newErrors.details = 'Details are required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;
    setSubmitting(true);

    try {
      const userId = user.uid;
      if (!userId) {
        throw new Error('User ID is undefined');
      }

      const submissionData = {
        ...basData,
        userId: user.uid || user.id,
        userEmail: user.email || '',
        userName: user.name || '',
        status: 'pending' as const,
      };

      const result = await submitBASLodgement(submissionData as any);

      if (result.success) {
        toast.success('BAS Lodgement Copy submitted successfully!', { style: { background: '#10B981', color: 'white' } });
        setTimeout(() => router.push('/services'), 2000);
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Error submitting request', { style: { background: '#EF4444', color: 'white' } });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="container mx-auto px-2 py-4 md:px-4 md:py-8 w-full md:max-w-3xl">
      <Toaster richColors position="top-right" />

      <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => router.back()} className="flex items-center text-sky-600 hover:text-sky-700 mb-4">
          <ArrowLeftIcon className="w-4 h-4 mr-2" /><span>Back to Services</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-500">
            <IdentificationIcon className="w-5 h-5" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">BAS Lodgement Copy</h1>
        </div>
        <p className="text-gray-600 text-sm">Complete the form below to register your BAS lodgement copy.</p>
      </motion.div>

      {existingBAS && (
        <RegistrationStatusBanner
          status={existingBAS.status as RegistrationStatus}
          title="BAS Lodgement Copy"
          createdAt={existingBAS.createdAt}
          notes={existingBAS.notes as string}
          type="BAS Lodgement Copy"
        />
      )}

      <motion.form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-6 space-y-6">
          <CustomInput
            label="Specify the Quarter *"
            type="text"
            name="quarter"
            value={basData.quarter}
            onChange={handleChange}
            errors={errors.quarter}
            placeholder="Enter the BAS quarter"
          />
          <CustomInput
            label="Details *"
            type="textarea"
            name="details"
            value={basData.details}
            onChange={handleChange}
            errors={errors.details}
            placeholder="Enter lodgement details"
          />
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">
            Cancel
          </button>

          <SubmitButton
            isSubmitting={submitting}
            defaultText="Submit BAS Lodgement"
            pendingText="Submitting..."
            rejectedText="Resubmit BAS Lodgement"
            status={existingBAS?.status as RegistrationStatus}
            disabled={existingBAS?.status === 'completed'}
          />
        </div>
      </motion.form>
    </div>
  );
};

export default BASLodgementCopy;
