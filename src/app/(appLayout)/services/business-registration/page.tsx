'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { IdentificationIcon } from '@heroicons/react/24/outline';
import { Toaster, toast } from 'sonner';
import CustomInput from '@/components/ui/CustomInput';
import CustomCheckbox from '@/components/ui/CustomCheckbox';
import LoadingSpinner from '@/components/features/LoadingSpinner';
import SubmitButton from '@/components/features/SubmitButton';
import PersonalInformation from '@/components/features/PersonaInformation';
import RegistrationStatusBanner from '@/components/features/RegistrationStatusBanner';
import useStore from '@/utils/useStore';
import { 
  checkExistingBusinessRegistration, 
  submitBusinessRegistration, 
  BusinessRegistrationStatus,
  BusinessRegistrationData
} from '@/lib/businessRegistrationService';

const BusinessRegistrationPage = () => {
  const router = useRouter();
  const { user: userStore } = useStore();
  const [existingRegistration, setExistingRegistration] = useState<(BusinessRegistrationData & { id: string }) | null>(null);
  const [formData, setFormData] = useState({
    postalAddress: '',
    postalCode: '',
    abn: '',
    businessName: '',
    businessAddress: '',
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
        const result = await checkExistingBusinessRegistration(userStore.uid);
        if (result.exists && result.data) {
          setExistingRegistration(result.data);
          
          // Pre-fill form with existing data
          setFormData({
            postalAddress: result.data.postalAddress || '',
            postalCode: result.data.postalCode || '',
            abn: result.data.abn || '',
            businessName: result.data.businessName || '',
            businessAddress: result.data.businessAddress || '',
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

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = 'Business address is required';
    }

    if (!formData.agreeToDeclaration) {
      newErrors.agreeToDeclaration = 'You must agree to the declaration';
    }
    
    if(!formData.abn.trim()) {
      newErrors.abn = 'ABN is required';
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
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        status: 'pending' as BusinessRegistrationStatus
      };

      const result = await submitBusinessRegistration(registrationData);

      if (result.success) {
        toast.success('Business Registration request submitted successfully!');
        
        // Fetch the updated registration
        const updatedResult = await checkExistingBusinessRegistration(userStore.uid);
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Business Registration</h1>
        </div>
        
        <p className="text-gray-600 text-sm">
          Complete the form below to register your business. All fields marked with * are required.
        </p>
      </motion.div>
      
      {/* Existing Registration Status */}
      {existingRegistration && (
        <RegistrationStatusBanner
          status={existingRegistration.status}
          title="Business Registration"
          createdAt={existingRegistration.createdAt}
          notes={existingRegistration.notes}
          type="business"
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
          {/* Address Information Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h2>
            <div className="space-y-4">
              {/* Postal Address */}
              <CustomInput 
                label="Postal Address" 
                type="text" 
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
                disabled={existingRegistration?.status === 'in-progress' || existingRegistration?.status === 'completed'}
              />
            </div>
          </div>

          {/* Business Registration Options Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Business Registration Details</h2>
            <div className="space-y-4">
              <CustomInput 
                label="ABN" 
                type="text" 
                name="abn" 
                value={formData.abn} 
                onChange={handleChange} 
                errors={errors.abn} 
                placeholder="Enter ABN" 
                disabled={existingRegistration?.status === 'in-progress' || existingRegistration?.status === 'completed'}
              />
              <CustomInput 
                label="Business Name" 
                type="text" 
                name="businessName" 
                value={formData.businessName} 
                onChange={handleChange} 
                errors={errors.businessName} 
                placeholder="Enter your business name" 
                disabled={existingRegistration?.status === 'in-progress' || existingRegistration?.status === 'completed'}
              />
              <CustomInput 
                label="Business Address" 
                type="text" 
                name="businessAddress" 
                value={formData.businessAddress} 
                onChange={handleChange} 
                errors={errors.businessAddress} 
                placeholder="Enter your business address" 
                disabled={existingRegistration?.status === 'in-progress' || existingRegistration?.status === 'completed'}
              />
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs md:text-sm text-gray-600 mb-3">
              I/We hereby authorize Mr. AMAN NAGPAL C/O Proven Associated Services Pty Ltd or Proven Accountants to update/add all details with ASIC on my behalf & represent me before various organizations and lodge various documents with the tax office, including updating ABN based on information provided by me from time to time. 
            </p>
            <p className="text-xs md:text-sm text-gray-600 mb-3">
              I/We further declare that:
            </p>
            <ul className="list-disc list-inside text-xs md:text-sm text-gray-600 mb-3">
              <li>None of the mentioned applicant(s) is/are disqualified from managing corporations under Section 206B(1) of the Corporations Act 2001.</li>
              <li>Within the last 5 years, none of the above-mentioned applicants has been convicted or released from prison after being convicted, or serving a term of imprisonment for any of the criminal offenses referred to in Section 32(1)(c) or (d) of the Business Names Registration Act 2011.</li>
              <li>This application is submitted under and compliant with the terms and conditions of the ASIC Electronic Lodgement Protocol details.</li>
              <li>The information supplied is accurate and complete to the best of my knowledge, and any false information provided may lead to penalties under applicable acts, rules, and regulations.</li>
              <li>All the persons mentioned in the application have consented to act for the respective roles.</li>
            </ul>
            <CustomCheckbox 
              label="I agree to the declaration" 
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

export default BusinessRegistrationPage;