'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, IdentificationIcon } from '@heroicons/react/24/outline'
import { Toaster, toast } from 'sonner'
import CustomInput from '@/components/ui/CustomInput'
import SubmitButton from '@/components/features/SubmitButton'
import useStore from '@/utils/useStore'
import RegistrationStatusBanner from '@/components/features/RegistrationStatusBanner';
import CustomCheckbox from '@/components/ui/CustomCheckbox';
import { checkExistingNoticeAssessment, NoticeAssessmentData } from '@/lib/noticeAssesmentService';
import { RegistrationStatus } from '@/lib/registrationService';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

const NoticeAssessment = () => {
  // State definitions
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [existingRegistration, setExistingRegistration] = useState<(NoticeAssessmentData & { id: string }) | null>(null)
  const router = useRouter()
  const { user } = useStore()
  const [noticeData, setNoticeData] = useState({
    year: '',
    details: '',
    agreeToDeclaration: false
  })

  // Check for existing registration
  useEffect(() => {
    const checkRegistration = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Use consistent user ID (prefer uid if available)
      const userId = user.uid || user.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const result = await checkExistingNoticeAssessment(userId);

        if (result.exists && result.data) {
          setExistingRegistration(result.data);
          setNoticeData({
            year: result.data.year || '',
            details: result.data.details || '',
            agreeToDeclaration: result.data.agreeToDeclaration || false
          });
        }
      } catch (error) {
        console.error('Failed to check registration:', error);
        toast.error('Failed to check registration');
      } finally {
        setLoading(false);
      }
    };

    checkRegistration();
  }, [user]);

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setNoticeData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!noticeData.year.trim()) newErrors.year = 'Year is required'
    if (!noticeData.agreeToDeclaration) newErrors.agreeToDeclaration = 'You must agree to the declaration'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;
    setSubmitting(true);

    try {
      // Use consistent user ID (prefer uid if available)
      const userId = user.uid || user.id;

      if (!userId) {
        throw new Error('User ID is undefined');
      }

      const assessmentData = {
        ...noticeData,
        userId: userId,
        userEmail: user.email || '',
        userName: user.displayName || user.firstName || '',
        status: 'pending' as const,
        user: {
          phone: user.phone || '',
          address: user.address || '',
          ...user
        }
      };

      // Send data to API endpoint
      const response = await fetch('/api/notice-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assessmentData }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Assessment submitted successfully!');
        
        // Fetch the updated registration
        const updatedResult = await checkExistingNoticeAssessment(userId);
        if (updatedResult.exists && updatedResult.data) {
          setExistingRegistration(updatedResult.data);
        }
        
        // Wait for toast to be visible before redirecting
        setTimeout(() => {
          router.push('/services');
        }, 2000);
      } else {
        toast.error(result.message || 'Failed to submit assessment. Please try again.');
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

  if (loading) return <SkeletonLoader/>

  return (
    <div className="container mx-auto px-2 py-4 md:px-4 md:py-8 w-full md:max-w-3xl">
      <Toaster richColors position="top-right" />

      {/* Header */}
      <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => router.back()} className="flex items-center text-sky-600 hover:text-sky-700 mb-4">
          <ArrowLeftIcon className="w-4 h-4 mr-2" /><span>Back to Services</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-500">
            <IdentificationIcon className="w-5 h-5" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Notice of Assessment</h1>
        </div>
        <p className="text-gray-600 text-sm">Complete the form below to register your notice of assessment.</p>
      </motion.div>

      {existingRegistration && (
        <RegistrationStatusBanner
          status={existingRegistration.status as RegistrationStatus}
          title="Notice of Assessment"
          createdAt={existingRegistration.createdAt}
          updatedAt={existingRegistration.updatedAt}
          notes={existingRegistration.details}
          type="Notice of Assessment"
        />
      )}

      {/* Form */}
      <motion.form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-6 space-y-6">
          {/* Form Fields */}
          <div className="space-y-4 mt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Notice of Assessment</h2>
            <CustomInput
              label="Specify the year"
              type="number"
              name="year"
              required={true}
              value={noticeData.year}
              onChange={handleChange}
              errors={errors.year}
              placeholder="Enter assessment year"
              disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
            />
            <CustomInput
              label="Details"
              type="textarea"
              name="details"
              value={noticeData.details}
              onChange={handleChange}
              required={false}
              errors={errors.details}
              placeholder="Enter assessment details"
              disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
            />
          </div>

          {/* Declaration */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs md:text-sm text-gray-600 mb-3">
              I authorize Proven Associated Services to process this notice of assessment on my behalf.
            </p>
            <CustomCheckbox 
              label="I agree to the declaration" 
              name="agreeToDeclaration" 
              checked={noticeData.agreeToDeclaration} 
              onChange={handleChange} 
              errors={errors.agreeToDeclaration}
              disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">
            Cancel
          </button>

          {existingRegistration?.status !== 'completed' && existingRegistration?.status !== 'in-progress' && (
            <SubmitButton
              isSubmitting={submitting}
              status={existingRegistration?.status}
              defaultText="Submit Assessment"
              pendingText="Update Assessment"
              rejectedText="Resubmit Assessment"
              completedText="Already Submitted"
              validateForm={validateForm} 
              onConfirm={handleConfirmSubmit}
            />
          )}
        </div>
      </motion.form>
    </div>
  )
}

export default NoticeAssessment