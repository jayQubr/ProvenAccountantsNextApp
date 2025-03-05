'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import CustomInput from '@/components/ui/CustomInput';
import SubmitButton from '@/components/features/SubmitButton';
import { checkExistingBASLodgement } from '@/lib/basLodgementCopy';
import useStore from '@/utils/useStore';
import RegistrationStatusBanner from '@/components/features/RegistrationStatusBanner';
import CustomCheckbox from '@/components/ui/CustomCheckbox';
import { RegistrationStatus } from '@/lib/registrationService';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

interface BASLodgementData {
  quarter: string;
  details: string;
  agreeToDeclaration?: boolean;
  userId?: string;
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
    agreeToDeclaration: false
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
            agreeToDeclaration: result.data.agreeToDeclaration || false
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
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setBasData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
    if (!basData.agreeToDeclaration) newErrors.agreeToDeclaration = 'You must agree to the declaration';
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
      const basLodgementData = {
        quarter: basData.quarter,
        details: basData.details,
        agreeToDeclaration: basData.agreeToDeclaration,
        userId: userId
      };

      const response = await fetch('/api/bas-lodgement-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ basLodgementData }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('BAS Lodgement Copy submitted successfully!');
        
        const updatedResult = await checkExistingBASLodgement(userId);
        if (updatedResult.exists && updatedResult.data) {
          setExistingBAS(updatedResult.data);
        }
        
        setTimeout(() => {
          router.push('/services');
        }, 2000);
      } else {
        toast.error(result.message || 'Failed to submit BAS lodgement. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Error submitting request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmSubmit = () => {
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(syntheticEvent);
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">BAS Lodgement Copy</h1>
        </div>
        <p className="text-gray-600 text-sm">Complete the form below to request a copy of your BAS lodgement.</p>
      </motion.div>

      {existingBAS && (
        <RegistrationStatusBanner
          status={existingBAS.status as RegistrationStatus}
          title="BAS Lodgement Copy"
          createdAt={existingBAS.createdAt}
          updatedAt={existingBAS.updatedAt}
          notes={existingBAS.details}
          type="BAS Lodgement Copy"
        />
      )}

      <motion.form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-6 space-y-6">
          <div className="space-y-4 mt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">BAS Lodgement Copy</h2>
            <CustomInput
              label="Specify the Quarter"
              type="number"
              name="quarter"
              required={true}
              value={basData.quarter}
              onChange={handleChange}
              errors={errors.quarter}
              placeholder="Enter the BAS quarter"
              disabled={existingBAS?.status === 'completed' || existingBAS?.status === 'in-progress'}
            />
            <CustomInput
              label="Details"
              type="textarea"
              name="details"
              required={false}
              value={basData.details}
              onChange={handleChange}
              errors={errors.details}
              placeholder="Enter lodgement details"
              disabled={existingBAS?.status === 'completed' || existingBAS?.status === 'in-progress'}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs md:text-sm text-gray-600 mb-3">
              I authorize Proven Associated Services to process this BAS lodgement copy request on my behalf.
            </p>
            <CustomCheckbox 
              label="I agree to the declaration" 
              name="agreeToDeclaration" 
              checked={basData.agreeToDeclaration} 
              onChange={handleChange} 
              errors={errors.agreeToDeclaration}
              disabled={existingBAS?.status === 'completed' || existingBAS?.status === 'in-progress'}
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">
            Cancel
          </button>

          {existingBAS?.status !== 'completed' && existingBAS?.status !== 'in-progress' && (
            <SubmitButton
              isSubmitting={submitting}
              defaultText="Submit"
              pendingText="Update Request"
              rejectedText="Resubmit Request"
              completedText="Already Submitted"
              status={existingBAS?.status}
              validateForm={validateForm}
              onConfirm={handleConfirmSubmit}
            />
          )}
        </div>
      </motion.form>
    </div>
  );
};

export default BASLodgementCopy;
