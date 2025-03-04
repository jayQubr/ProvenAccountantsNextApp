'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, IdentificationIcon } from '@heroicons/react/24/outline'
import { Toaster, toast } from 'sonner'
import CustomInput from '@/components/ui/CustomInput'
import CustomCheckbox from '@/components/ui/CustomCheckbox'
import SubmitButton from '@/components/features/SubmitButton'
import { checkExistingPaymentPlan, submitPaymentPlan } from '@/lib/paymentPlanService'
import LoadingSpinner from '@/components/features/LoadingSpinner'
import useStore from '@/utils/useStore'
import RegistrationStatusBanner from '@/components/features/RegistrationStatusBanner';
import { RegistrationStatus } from '@/lib/registrationService';

interface PaymentPlanData {
  planType: string;
  amount: number;
  details: string;
  agreeToDeclaration: boolean;
  userId?: any;
  userEmail?: string;
  userName?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'rejected';
  createdAt?: number;
  updatedAt?: number;
  notes?: string;
}

const PaymentPlan = () => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [existingPaymentPlan, setExistingPaymentPlan] = useState<(PaymentPlanData & { id: string }) | null>(null)
  const router = useRouter()
  const { user } = useStore()
  
  const [paymentData, setPaymentData] = useState({
    planType: '',
    amount: '',
    details: '',
    agreeToDeclaration: false,
  })

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
        const result = await checkExistingPaymentPlan(userId);
        if (result.exists && result.data) {
          setExistingPaymentPlan(result.data);
          setPaymentData({
            planType: result.data.planType || '',
            amount: result.data.amount || '',
            details: result.data.details || '',
            agreeToDeclaration: result.data.agreeToDeclaration || false,
          });

          if (result.data.status === 'completed') {
            toast.success('Payment Plan processed successfully!', { style: { background: '#10B981', color: 'white' } });
          } else if (result.data.status === 'in-progress') {
            toast.info('Payment Plan is being processed', { style: { background: '#3B82F6', color: 'white' } });
          } else if (result.data.status === 'rejected') {
            toast.error('Payment Plan was rejected', { style: { background: '#EF4444', color: 'white' } });
          }
        }
      } catch (error) {
        console.error('Failed to check payment plan:', error);
        toast.error('Failed to check registration', { style: { background: '#EF4444', color: 'white' } });
      } finally {
        setLoading(false);
      }
    };

    checkRegistration();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setPaymentData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

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
    if (!paymentData.planType.trim()) newErrors.planType = 'Payment Plan is required'
    if (!paymentData.amount) newErrors.amount = 'Amount is required'
    if (!paymentData.agreeToDeclaration) newErrors.agreeToDeclaration = 'You must agree to the declaration'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;
    setSubmitting(true);

    try {
      const userId = user.uid || user.id;
      if (!userId) {
        throw new Error('User ID is undefined');
      }

      const submissionData = {
        ...paymentData,
        amount: Number(paymentData.amount),
        userId: userId,
        userEmail: user.email || '',
        userName: user.name || '',
        status: 'pending' as const
      };

      const result = await submitPaymentPlan(submissionData);

      if (result.success) {
        toast.success('Payment Plan submitted successfully!', { style: { background: '#10B981', color: 'white' } });
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

      <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => router.back()} className="flex items-center text-sky-600 hover:text-sky-700 mb-4">
          <ArrowLeftIcon className="w-4 h-4 mr-2" /><span>Back to Services</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-500">
            <IdentificationIcon className="w-5 h-5" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Payment Plan</h1>
        </div>
        <p className="text-gray-600 text-sm">Complete the form below to register your payment plan.</p>
      </motion.div>

      {existingPaymentPlan && (
        <RegistrationStatusBanner
          status={existingPaymentPlan.status as RegistrationStatus}
          title="Payment Plan"
          createdAt={existingPaymentPlan.createdAt}
          notes={existingPaymentPlan.notes as string}
          type="Payment Plan"
        />
      )}

      <motion.form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-6 space-y-6">
          <CustomInput
            label="Payment Plan *"
            type="text"
            name="planType"
            value={paymentData.planType}
            onChange={handleChange}
            errors={errors.planType}
            placeholder="Enter payment plan type"
          />
          <CustomInput
            label="Amount *"
            type="number"
            name="amount"
            value={paymentData.amount}
            onChange={handleChange}
            errors={errors.amount}
            placeholder="Enter amount"
          />
          <CustomInput
            label="Details"
            type="textarea"
            name="details"
            value={paymentData.details}
            onChange={handleChange}
            errors={errors.details}
            placeholder="Enter details"
          />

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs md:text-sm text-gray-600 mb-3">
              I understand that this agreement may be terminated if I do not meet my responsibilities. If this agreement is terminated the ATO may take further action to collect the debt. I hereby authorize Proven Accountant to submit a payment plan with ATO.
            </p>
            <CustomCheckbox 
              label="Authorisation Approval Provided *" 
              name="agreeToDeclaration" 
              checked={paymentData.agreeToDeclaration} 
              onChange={handleChange}
              errors={errors.agreeToDeclaration}
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">
            Cancel
          </button>

          <SubmitButton
            isSubmitting={submitting}
            defaultText="Submit Payment Plan"
            pendingText="Submitting..."
            rejectedText="Resubmit Payment Plan"
            status={existingPaymentPlan?.status as RegistrationStatus}
            disabled={existingPaymentPlan?.status === 'completed'}
          />
        </div>
      </motion.form>
    </div>
  )
}

export default PaymentPlan