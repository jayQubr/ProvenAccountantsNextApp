'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, IdentificationIcon } from '@heroicons/react/24/outline'
import { Toaster, toast } from 'sonner'
import CustomInput from '@/components/ui/CustomInput'
import SubmitButton from '@/components/features/SubmitButton'
import { BaseRegistrationData } from '@/lib/registrationService'
import { submitNoticeAssessment, checkExistingNoticeAssessment } from '@/lib/noticeAssementService'
import LoadingSpinner from '@/components/features/LoadingSpinner'
import useStore from '@/utils/useStore'
import RegistrationStatusBanner from '@/components/features/RegistrationStatusBanner';

interface NoticeAssessmentData extends BaseRegistrationData {
  year: string;
  details: string;
  agreeToDeclaration?: boolean;
}

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
        console.log('User not available yet', user);
        setLoading(false);
        return;
      }

      // Use consistent user ID (prefer uid if available)
      const userId = user.uid || user.id;

      if (!userId) {
        console.log('No user ID available', user);
        setLoading(false);
        return;
      }

      console.log('Checking registration for user:', userId);

      try {
        const result = await checkExistingNoticeAssessment(userId);
        console.log('Registration check result:', result);

        if (result.exists && result.data) {
          console.log('Existing registration found:', result.data);
          setExistingRegistration(result.data);
          setNoticeData({
            year: result.data.year || '',
            details: result.data.details || '',
            agreeToDeclaration: result.data.agreeToDeclaration || false
          });

          // Show toast based on status
          if (result.data.status === 'completed') {
            toast.success('Assessment processed successfully', { style: { background: '#10B981', color: 'white' } });
          } else if (result.data.status === 'in-progress') {
            toast.info('Assessment is being processed', { style: { background: '#3B82F6', color: 'white' } });
          } else if (result.data.status === 'rejected') {
            toast.error('Assessment was rejected', { style: { background: '#EF4444', color: 'white' } });
          }
        } else {
          console.log('No existing registration found');
        }
      } catch (error) {
        console.error('Failed to check registration:', error);
        toast.error('Failed to check registration', { style: { background: '#EF4444', color: 'white' } });
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
    if (!noticeData.details.trim()) newErrors.details = 'Details are required'
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

      const submissionData = {
        ...noticeData,
        userId: userId,
        userEmail: user.email || '',
        userName: user.name || '',
        status: 'pending' as const
      };

      const result = await submitNoticeAssessment(submissionData);

      if (result.success) {
        toast.success('Assessment submitted successfully!', { style: { background: '#10B981', color: 'white' } });
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

  if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>

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
          status={existingRegistration.status}
          title="Notice of Assessment"
          createdAt={existingRegistration.createdAt}
          notes={existingRegistration.notes}
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
              label="Specify the year *"
              type="number"
              name="year"
              value={noticeData.year}
              onChange={handleChange}
              errors={errors.year}
              placeholder="Enter assessment year"
              disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
            />
            <CustomInput
              label="Details *"
              type="textarea"
              name="details"
              value={noticeData.details}
              onChange={handleChange}
              errors={errors.details}
              placeholder="Enter assessment details"
              disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
            />
          </div>

          {/* Declaration */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              I authorize Proven Associated Services to process this notice of assessment on my behalf.
            </p>
            <div className="flex items-start mt-4">
              <input
                id="agreeToDeclaration"
                name="agreeToDeclaration"
                type="checkbox"
                checked={noticeData.agreeToDeclaration}
                onChange={handleChange}
                className="focus:ring-sky-500 h-4 w-4 text-sky-600 border-gray-300 rounded mt-1"
                disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
              />
              <label htmlFor="agreeToDeclaration" className="ml-3 text-sm font-medium text-gray-700">
                I agree to the declaration *
                {errors.agreeToDeclaration && <p className="mt-1 text-sm text-red-600">{errors.agreeToDeclaration}</p>}
              </label>
            </div>
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
              defaultText="Submit Assessment"
              pendingText="Submitting..."
              rejectedText="Resubmit Assessment"
              status={existingRegistration?.status}
            />
          )}
        </div>
      </motion.form>
    </div>
  )
}

export default NoticeAssessment