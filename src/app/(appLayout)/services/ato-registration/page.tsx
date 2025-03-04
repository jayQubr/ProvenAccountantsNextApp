'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { IdentificationIcon } from '@heroicons/react/24/outline';
import { Toaster, toast } from 'sonner';
import CustomCheckbox from '@/components/ui/CustomCheckbox';
import CustomInput from '@/components/ui/CustomInput';
import LoadingSpinner from '@/components/features/LoadingSpinner';
import SubmitButton from '@/components/features/SubmitButton';
import PersonalInformation from '@/components/features/PersonaInformation';
import RegistrationStatusBanner from '@/components/features/RegistrationStatusBanner';
import useStore from '@/utils/useStore';
import { 
  checkExistingATORegistration, 
  submitATORegistration, 
  ATORegistrationStatus,
  ATORegistrationData
} from '@/lib/atoRegistrationService';

const ATORegistrationPage = () => {
  const router = useRouter();
  const { user: userStore } = useStore();
  const [existingRegistration, setExistingRegistration] = useState<(ATORegistrationData & { id: string }) | null>(null);
  const [formData, setFormData] = useState({
    postalAddress: '',
    postalCode: '',
    abn: false,
    gst: false,
    fuelTaxCredit: false,
    agreeToDeclaration: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRegistration = async () => {
      if (!userStore?.uid) return;
      
      setIsLoading(true);
      try {
        const result = await checkExistingATORegistration(userStore.uid);
        if (result.exists && result.data) {
          setExistingRegistration(result.data);
          
          // Pre-fill form with existing data
          setFormData({
            postalAddress: result.data.postalAddress || '',
            postalCode: result.data.postalCode || '',
            abn: result.data.abn || false,
            gst: result.data.gst || false,
            fuelTaxCredit: result.data.fuelTaxCredit || false,
            agreeToDeclaration: true
          });
        }
      } catch (error) {
        console.error("Error checking registration:", error);
        toast.error("Failed to check existing registration");
      } finally {
        setIsLoading(false);
      }
    };

    checkRegistration();
  }, [userStore?.uid]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when field is edited
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

    if (!formData.postalAddress.trim()) {
      newErrors.postalAddress = 'Postal address is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{4}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Postal code must be 4 digits';
    }

    if (!formData.agreeToDeclaration) {
      newErrors.agreeToDeclaration = 'You must agree to the declaration';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !userStore?.uid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const registrationData = {
        userId: userStore.uid,
        userEmail: userStore.email || '',
        userName: userStore.displayName || '',
        postalAddress: formData.postalAddress,
        postalCode: formData.postalCode,
        abn: formData.abn,
        gst: formData.gst,
        fuelTaxCredit: formData.fuelTaxCredit,
        status: 'pending' as ATORegistrationStatus
      };

      const result = await submitATORegistration(registrationData);

      if (result.success) {
        toast.success('ATO Registration request submitted successfully!');
        
        // Fetch the updated registration
        const updatedResult = await checkExistingATORegistration(userStore.uid);
        if (updatedResult.exists && updatedResult.data) {
          setExistingRegistration(updatedResult.data);
        }
        
        // Wait for toast to be visible before redirecting
        setTimeout(() => {
          router.push('/services');
        }, 2000);
      } else {
        toast.error('Failed to submit registration. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-4 md:px-4 md:py-8 w-full md:max-w-3xl">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center text-sky-600 hover:text-sky-700 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          <span>Back to Services</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-500">
            <IdentificationIcon className="w-5 h-5" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">ATO Registration</h1>
        </div>

        <p className="text-gray-600 text-sm">
          Complete the form below to request ATO registration services. All fields marked with * are required.
        </p>
      </motion.div>

      {/* Existing Registration Status */}
      {existingRegistration && (
        <RegistrationStatusBanner
          status={existingRegistration.status}
          title="ATO Registration"
          createdAt={existingRegistration.createdAt}
          notes={existingRegistration.notes}
          type="ATO"
        />
      )}

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="p-6 space-y-6">
          <PersonalInformation/>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h2>
            <div className="space-y-4">
              <CustomInput 
                label="Postal Address" 
                name="postalAddress" 
                value={formData.postalAddress} 
                onChange={handleChange} 
                errors={errors.postalAddress} 
                placeholder="Enter your postal address" 
                disabled={existingRegistration?.status === 'in-progress' || existingRegistration?.status === 'completed'}
              />
              <CustomInput 
                label="Postal Code" 
                type="text" 
                name="postalCode" 
                value={formData.postalCode} 
                onChange={handleChange} 
                errors={errors.postalCode} 
                placeholder="Enter your postal code" 
                maxLength={4} 
                disabled={existingRegistration?.status === 'in-progress' || existingRegistration?.status === 'completed'}
              />
            </div>
          </div>

          {/* Registration Options */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Registration Options</h2>
            <div className="space-y-3">
              <CustomCheckbox 
                label="ABN Registration Required" 
                name="abn" 
                checked={formData.abn} 
                onChange={handleChange} 
                disabled={existingRegistration?.status === 'in-progress' || existingRegistration?.status === 'completed'}
              />
              <CustomCheckbox 
                label="GST Registration Required" 
                name="gst" 
                checked={formData.gst} 
                onChange={handleChange} 
                disabled={existingRegistration?.status === 'in-progress' || existingRegistration?.status === 'completed'}
              />
              <CustomCheckbox 
                label="Fuel Tax Credit" 
                name="fuelTaxCredit" 
                checked={formData.fuelTaxCredit} 
                onChange={handleChange} 
                disabled={existingRegistration?.status === 'in-progress' || existingRegistration?.status === 'completed'}
              />
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs md:text-sm text-gray-600 mb-3">
              Declaration: We hereby authorise Proven Associated Services Pty Ltd & Mr Aman Nagpal T/A Proven Accountants, Tax agents to add us in their tax portal, represent us before various organisations and to provide Accounting & tax services including lodgement of Business Activity Statements(if any), tax returns and other documents required by tax office & other departments (based on information provided by us) from time to time.
            </p>
            <CustomCheckbox 
              label="Authorisation Approval Provided" 
              name="agreeToDeclaration" 
              checked={formData.agreeToDeclaration} 
              onChange={handleChange} 
              errors={errors.agreeToDeclaration}
              disabled={existingRegistration?.status === 'in-progress' || existingRegistration?.status === 'completed'}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <SubmitButton 
            isSubmitting={isSubmitting}
            status={existingRegistration?.status}
            defaultText="Submit Registration"
            pendingText="Update Registration"
            rejectedText="Resubmit Registration"
            completedText="Already Submitted"
          />
        </div>
      </motion.form>
    </div>
  );
};

export default ATORegistrationPage;