'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import CustomInput from '@/components/ui/CustomInput';
import SubmitButton from '@/components/features/SubmitButton';
import { checkExistingUpdateAddress } from '@/lib/updateAddressService';
import useStore from '@/utils/useStore';
import RegistrationStatusBanner from '@/components/features/RegistrationStatusBanner';
import { RegistrationStatus } from '@/lib/registrationService';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

interface UpdateAddressData {
  oldAddress: string;
  newAddress: string;
  userId?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'rejected';
  createdAt?: number;
  updatedAt?: number;
  notes?: string;
}

const UpdateAddress = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingAddress, setExistingAddress] = useState<(UpdateAddressData & { id: string }) | null>(null);
  const router = useRouter();
  const { user } = useStore();
  const [addressData, setAddressData] = useState({
    oldAddress: '',
    newAddress: '',
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
        const result = await checkExistingUpdateAddress(userId);
        if (result.exists && result.data) {
          setExistingAddress(result.data);
          setAddressData({
            oldAddress: result.data.oldAddress || '',
            newAddress: result.data.newAddress || '',
          });

          if (result.data.status === 'completed') {
            toast.success('Address update processed successfully!', { style: { background: '#10B981', color: 'white' } });
          } else if (result.data.status === 'in-progress') {
            toast.info('Address update is being processed', { style: { background: '#3B82F6', color: 'white' } });
          } else if (result.data.status === 'rejected') {
            toast.error('Address update was rejected', { style: { background: '#EF4444', color: 'white' } });
          }
        }
      } catch (error) {
        console.error('Failed to check address update:', error);
        toast.error('Failed to check registration', { style: { background: '#EF4444', color: 'white' } });
      } finally {
        setLoading(false);
      }
    };

    checkRegistration();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddressData(prev => ({
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
    if (!addressData.oldAddress.trim()) newErrors.oldAddress = 'Current address is required';
    if (!addressData.newAddress.trim()) newErrors.newAddress = 'New address is required';
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
      const updateAddressData = {
        oldAddress: addressData.oldAddress,
        newAddress: addressData.newAddress,
        userId: userId,
        userEmail: user.email || '',
        userName: user.firstName + ' ' + user.lastName || user.displayName || '',
        status: 'pending' as const,
        user: {
          phone: user.phone || '',
          address: user.address || '',
          ...user
        }
      };

      const response = await fetch('/api/update-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updateAddressData }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Address update submitted successfully!', { style: { background: '#10B981', color: 'white' } });
        
        const updatedResult = await checkExistingUpdateAddress(userId);
        if (updatedResult.exists && updatedResult.data) {
          setExistingAddress(updatedResult.data);
        }
        
        setTimeout(() => router.push('/services'), 2000);
      } else {
        toast.error(result.message || 'Failed to submit address update. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Error submitting request', { style: { background: '#EF4444', color: 'white' } });
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Update Address</h1>
        </div>
        <p className="text-gray-600 text-sm">Complete the form below to update your address.</p>
      </motion.div>

      {existingAddress && (
        <RegistrationStatusBanner
          status={existingAddress.status as RegistrationStatus}
          title="Update Address"
          createdAt={existingAddress.createdAt}
          updatedAt={existingAddress.updatedAt}
          notes={existingAddress.notes as string}
          type="Update Address"
        />
      )}

      <motion.form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-6 space-y-6">
          <CustomInput 
            label="Current Address" 
            type="text" 
            name="oldAddress" 
            value={addressData.oldAddress} 
            onChange={handleChange} 
            errors={errors.oldAddress} 
            placeholder="Enter current address" 
            disabled={existingAddress?.status === 'completed' || existingAddress?.status === 'in-progress'}
          />
          <CustomInput 
            label="New Address" 
            type="text" 
            name="newAddress" 
            value={addressData.newAddress} 
            onChange={handleChange} 
            errors={errors.newAddress} 
            placeholder="Enter new address" 
            disabled={existingAddress?.status === 'completed' || existingAddress?.status === 'in-progress'}
          />
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">
            Cancel
          </button>

          {existingAddress?.status !== 'completed' && existingAddress?.status !== 'in-progress' && (
            <SubmitButton
              isSubmitting={submitting}
              defaultText="Submit"
              pendingText="Updating Address"
              rejectedText="Resubmit Request"
              completedText="Already Submitted"
              status={existingAddress?.status}
              validateForm={validateForm}
              onConfirm={handleConfirmSubmit}
            />
          )}
        </div>
      </motion.form>
    </div>
  );
};

export default UpdateAddress;
