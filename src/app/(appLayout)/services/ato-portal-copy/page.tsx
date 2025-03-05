'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { Toaster, toast } from 'sonner';
import CustomInput from '@/components/ui/CustomInput';
import SubmitButton from '@/components/features/SubmitButton';
import { checkExistingATOPortal } from '@/lib/atoPortalService';
import useStore from '@/utils/useStore';
import RegistrationStatusBanner from '@/components/features/RegistrationStatusBanner';
import { RegistrationStatus } from '@/lib/registrationService';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

interface ATOPortalData {
  period: string;
  details: string;
  userId?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'rejected';
  createdAt?: number;
  updatedAt?: number;
  notes?: string;
}

const ATOPortalCopy = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingATO, setExistingATO] = useState<(ATOPortalData & { id: string }) | null>(null);
  const router = useRouter();
  const { user } = useStore();
  const [atoData, setAtoData] = useState({
    period: '',
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
        const result = await checkExistingATOPortal(userId);
        if (result.exists && result.data) {
          setExistingATO(result.data);
          setAtoData({
            period: result.data.period || '',
            details: result.data.details || '',
          });

          if (result.data.status === 'completed') {
            toast.success('ATO Portal Copy processed successfully!', { style: { background: '#10B981', color: 'white' } });
          } else if (result.data.status === 'in-progress') {
            toast.info('ATO Portal Copy is being processed', { style: { background: '#3B82F6', color: 'white' } });
          } else if (result.data.status === 'rejected') {
            toast.error('ATO Portal Copy was rejected', { style: { background: '#EF4444', color: 'white' } });
          }
        }
      } catch (error) {
        console.error('Failed to check ATO portal copy:', error);
        toast.error('Failed to check registration', { style: { background: '#EF4444', color: 'white' } });
      } finally {
        setLoading(false);
      }
    };

    checkRegistration();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAtoData(prev => ({
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
    if (!atoData.period.trim()) newErrors.period = 'Period is required';
    if (!atoData.details.trim()) newErrors.details = 'Details are required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;
    setSubmitting(true);

    try {
      const userId = user.uid || user.id;
      if (!userId) {
        throw new Error('User ID is undefined');
      }

      // Only send essential data to the API
      const atoPortalData = {
        period: atoData.period,
        details: atoData.details,
        userId: userId
      };

      const response = await fetch('/api/ato-portal-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ atoPortalData }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('ATO Portal Copy submitted successfully!', { style: { background: '#10B981', color: 'white' } });
        
        const updatedResult = await checkExistingATOPortal(userId);
        if (updatedResult.exists && updatedResult.data) {
          setExistingATO(updatedResult.data);
        }
        
        setTimeout(() => router.push('/services'), 2000);
      } else {
        toast.error(result.message || 'Failed to submit ATO Portal Copy. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Error submitting request', { style: { background: '#EF4444', color: 'white' } });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SkeletonLoader />;

  return (
    <div className="container mx-auto px-2 py-4 md:px-4 md:py-8 w-full md:max-w-3xl">
      <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => router.back()} className="flex items-center text-sky-600 hover:text-sky-700 mb-4">
          <ArrowLeftIcon className="w-4 h-4 mr-2" /><span>Back to Services</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-500">
            <IdentificationIcon className="w-5 h-5" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">ATO Portal Copy</h1>
        </div>
        <p className="text-gray-600 text-sm">Complete the form below to register your ATO portal copy.</p>
      </motion.div>

      {existingATO && (
        <RegistrationStatusBanner
          status={existingATO.status as RegistrationStatus}
          title="ATO Portal Copy"
          createdAt={existingATO.createdAt}
          updatedAt={existingATO.updatedAt}
          notes={existingATO.notes as string}
          type="ATO Portal Copy"
        />
      )}

      <motion.form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-6 space-y-6">
          <CustomInput
            label="Specify the Period *"
            type="text"
            name="period"
            value={atoData.period}
            onChange={handleChange}
            errors={errors.period}
            placeholder="Enter the period"
            disabled={existingATO?.status === 'completed' || existingATO?.status === 'in-progress'}
          />
          <CustomInput
            label="Details *"
            type="textarea"
            name="details"
            value={atoData.details}
            onChange={handleChange}
            errors={errors.details}
            placeholder="Enter details"
            disabled={existingATO?.status === 'completed' || existingATO?.status === 'in-progress'}
          />
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">
            Cancel
          </button>

          {existingATO?.status !== 'completed' && existingATO?.status !== 'in-progress' && (
            <SubmitButton
              isSubmitting={submitting}
              defaultText="Submit ATO Portal Copy"
              pendingText="Update Request"
              rejectedText="Resubmit Request"
              completedText="Already Submitted"
              status={existingATO?.status}
            />
          )}
        </div>
      </motion.form>
    </div>
  );
};

export default ATOPortalCopy;