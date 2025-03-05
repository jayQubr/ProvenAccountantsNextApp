'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { IdentificationIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import CustomCheckbox from '@/components/ui/CustomCheckbox';
import CustomInput from '@/components/ui/CustomInput';
import SubmitButton from '@/components/features/SubmitButton';
import PersonalInformation from '@/components/features/PersonaInformation';
import RegistrationStatusBanner from '@/components/features/RegistrationStatusBanner';
import useStore from '@/utils/useStore';
import { checkExistingATORegistration, ATORegistrationStatus, ATORegistrationData } from '@/lib/atoRegistrationService';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

const ATORegistrationPage = () => {
  const router = useRouter();
  const { user: userStore } = useStore();
  const [existingRegistration, setExistingRegistration] = useState<(ATORegistrationData & { id: string }) | null>(null);
  const [formData, setFormData] = useState({
    postalAddress: '',
    postalCode: '',
    abn: {
      selected: false,
      businessActivity: '',
      registrationDate: '',
      businessAddress: ''
    },
    gst: {
      selected: false,
      annualIncome: '',
      registrationDate: '',
      accountingMethod: 'cash'
    },
    fuelTaxCredit: {
      selected: false,
      hasTrucks: false,
      hasMachinery: false,
      hasAgriculture: false
    },
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
            abn: {
              selected: result.data.abn?.selected || false,
              businessActivity: result.data.abn?.businessActivity || '',
              registrationDate: result.data.abn?.registrationDate || '',
              businessAddress: result.data.abn?.businessAddress || ''
            },
            gst: {
              selected: result.data.gst?.selected || false,
              annualIncome: result.data.gst?.annualIncome || '',
              registrationDate: result.data.gst?.registrationDate || '',
              accountingMethod: result.data.gst?.accountingMethod || 'cash'
            },
            fuelTaxCredit: {
              selected: result.data.fuelTaxCredit?.selected || false,
              hasTrucks: result.data.fuelTaxCredit?.hasTrucks || false,
              hasMachinery: result.data.fuelTaxCredit?.hasMachinery || false,
              hasAgriculture: result.data.fuelTaxCredit?.hasAgriculture || false
            },
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

    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev:any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

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

    if (formData.abn.selected) {
      if (!formData.abn.businessActivity?.trim()) {
        newErrors['abn.businessActivity'] = 'Nature of business activity is required';
      }
      if (!formData.abn.registrationDate?.trim()) {
        newErrors['abn.registrationDate'] = 'Registration date is required';
      }
      if (!formData.abn.businessAddress?.trim()) {
        newErrors['abn.businessAddress'] = 'Business address is required';
      }
    }

    if (formData.gst.selected) {
      if (!formData.gst.annualIncome?.trim()) {
        newErrors['gst.annualIncome'] = 'Approximate annual income is required';
      }
      if (!formData.gst.registrationDate?.trim()) {
        newErrors['gst.registrationDate'] = 'Registration date is required';
      }
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
        abn: {
          selected: formData.abn.selected,
          businessActivity: formData.abn.businessActivity,
          registrationDate: formData.abn.registrationDate,
          businessAddress: formData.abn.businessAddress
        },
        gst: {
          selected: formData.gst.selected,
          annualIncome: formData.gst.annualIncome,
          registrationDate: formData.gst.registrationDate,
          accountingMethod: formData.gst.accountingMethod
        },
        fuelTaxCredit: {
          selected: formData.fuelTaxCredit.selected,
          hasTrucks: formData.fuelTaxCredit.hasTrucks,
          hasMachinery: formData.fuelTaxCredit.hasMachinery,
          hasAgriculture: formData.fuelTaxCredit.hasAgriculture
        },
        status: 'pending' as ATORegistrationStatus, 
        // user: userStore
      };

      // Send data to API endpoint
      const response = await fetch('/api/service-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registrationData }),
      });

      const result = await response.json();

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
        toast.error(result.message || 'Failed to submit registration. Please try again.');
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
      <SkeletonLoader />
    );
  }

  return (
    <div className="container mx-auto px-2 py-4 md:px-4 md:py-8 w-full md:max-w-3xl">
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
          updatedAt={existingRegistration.updatedAt}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* ABN Registration Card */}
              <div 
                className={`relative rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
                  formData.abn.selected 
                    ? 'border-sky-500 bg-sky-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (existingRegistration?.status !== 'in-progress' && existingRegistration?.status !== 'completed') {
                    setFormData(prev => ({ 
                      ...prev, 
                      abn: { ...prev.abn, selected: !prev.abn.selected } 
                    }));
                  }
                }}
              >
                <div className="absolute top-3 right-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    formData.abn.selected ? 'bg-sky-500' : 'border border-gray-300'
                  }`}>
                    {formData.abn.selected && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">ABN Registration</h3>
                  <p className="text-sm text-gray-500">Australian Business Number registration for your business</p>
                </div>
              </div>

              {/* GST Registration Card */}
              <div 
                className={`relative rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
                  formData.gst.selected 
                    ? 'border-sky-500 bg-sky-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (existingRegistration?.status !== 'in-progress' && existingRegistration?.status !== 'completed') {
                    setFormData(prev => ({ 
                      ...prev, 
                      gst: { ...prev.gst, selected: !prev.gst.selected } 
                    }));
                  }
                }}
              >
                <div className="absolute top-3 right-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    formData.gst.selected ? 'bg-sky-500' : 'border border-gray-300'
                  }`}>
                    {formData.gst.selected && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">GST Registration</h3>
                  <p className="text-sm text-gray-500">Goods and Services Tax registration for your business</p>
                </div>
              </div>

              {/* Fuel Tax Credit Card */}
              <div 
                className={`relative rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
                  formData.fuelTaxCredit.selected 
                    ? 'border-sky-500 bg-sky-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (existingRegistration?.status !== 'in-progress' && existingRegistration?.status !== 'completed') {
                    setFormData(prev => ({ 
                      ...prev, 
                      fuelTaxCredit: { ...prev.fuelTaxCredit, selected: !prev.fuelTaxCredit.selected } 
                    }));
                  }
                }}
              >
                <div className="absolute top-3 right-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    formData.fuelTaxCredit.selected ? 'bg-sky-500' : 'border border-gray-300'
                  }`}>
                    {formData.fuelTaxCredit.selected && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Fuel Tax Credit</h3>
                  <p className="text-sm text-gray-500">Claim credits for fuel used in eligible business activities</p>
                </div>
              </div>
            </div>
            
            {/* Conditional ABN fields */}
            {formData.abn.selected && (
              <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    ABN Registration Details
                  </h3>
                  
                  {/* Remove button */}
                  {existingRegistration?.status !== 'in-progress' && existingRegistration?.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, abn: { ...prev.abn, selected: false } }))}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <CustomInput 
                    label="Nature of Business Activity" 
                    name="abn.businessActivity" 
                    value={formData.abn.businessActivity} 
                    onChange={handleChange} 
                    errors={errors['abn.businessActivity']} 
                    placeholder="Describe your business activity" 
                    disabled={existingRegistration?.status === 'in-progress' || existingRegistration?.status === 'completed'}
                  />
                  <CustomInput 
                    label="Registration Date" 
                    type="date" 
                    name="abn.registrationDate" 
                    value={formData.abn.registrationDate} 
                    onChange={handleChange} 
                    errors={errors['abn.registrationDate']} 
                    disabled={existingRegistration?.status === 'in-progress' || existingRegistration?.status === 'completed'}
                  />
                  <CustomInput 
                    label="Business Address" 
                    name="abn.businessAddress" 
                    value={formData.abn.businessAddress} 
                    onChange={handleChange} 
                    errors={errors['abn.businessAddress']} 
                    placeholder="Enter your business address" 
                    disabled={existingRegistration?.status === 'in-progress' || existingRegistration?.status === 'completed'}
                  />
                </div>
              </div>
            )}
            
            {/* Conditional GST fields */}
            {formData.gst.selected && (
              <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    GST Registration Details
                  </h3>
                  
                  {/* Remove button */}
                  {existingRegistration?.status !== 'in-progress' && existingRegistration?.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gst: { ...prev.gst, selected: false } }))}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <CustomInput 
                    label="Approximate Annual Income/Sales (AUD)" 
                    name="gst.annualIncome" 
                    value={formData.gst.annualIncome} 
                    onChange={handleChange} 
                    errors={errors['gst.annualIncome']} 
                    placeholder="Enter approximate annual income" 
                    disabled={existingRegistration?.status === 'in-progress' || existingRegistration?.status === 'completed'}
                  />
                  <CustomInput 
                    label="Registration Date" 
                    type="date" 
                    name="gst.registrationDate" 
                    value={formData.gst.registrationDate} 
                    onChange={handleChange} 
                    errors={errors['gst.registrationDate']} 
                    disabled={existingRegistration?.status === 'in-progress' || existingRegistration?.status === 'completed'}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Method of Accounting
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.gst.accountingMethod === 'cash' 
                            ? 'border-sky-500 bg-sky-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (existingRegistration?.status !== 'in-progress' && existingRegistration?.status !== 'completed') {
                            setFormData(prev => ({ 
                              ...prev, 
                              gst: { ...prev.gst, accountingMethod: 'cash' } 
                            }));
                          }
                        }}
                      >
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                            formData.gst.accountingMethod === 'cash' ? 'bg-sky-500' : 'border border-gray-300'
                          }`}>
                            {formData.gst.accountingMethod === 'cash' && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className="text-gray-700 font-medium">Cash</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-6">Record income when received and expenses when paid</p>
                      </div>
                      
                      <div 
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.gst.accountingMethod === 'accrual' 
                            ? 'border-sky-500 bg-sky-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (existingRegistration?.status !== 'in-progress' && existingRegistration?.status !== 'completed') {
                            setFormData(prev => ({ 
                              ...prev, 
                              gst: { ...prev.gst, accountingMethod: 'accrual' } 
                            }));
                          }
                        }}
                      >
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                            formData.gst.accountingMethod === 'accrual' ? 'bg-sky-500' : 'border border-gray-300'
                          }`}>
                            {formData.gst.accountingMethod === 'accrual' && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className="text-gray-700 font-medium">Accrual</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-6">Record income when earned and expenses when incurred</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Conditional Fuel Tax Credit fields */}
            {formData.fuelTaxCredit.selected && (
              <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Fuel Tax Credit Details
                  </h3>
                  
                  {/* Remove button */}
                  {existingRegistration?.status !== 'in-progress' && existingRegistration?.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, fuelTaxCredit: { ...prev.fuelTaxCredit, selected: false } }))}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Remove
                    </button>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-4">Select all that apply to your business:</p>
                
                <div className="space-y-3">
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.fuelTaxCredit.hasTrucks 
                        ? 'border-sky-500 bg-sky-50 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      if (existingRegistration?.status !== 'in-progress' && existingRegistration?.status !== 'completed') {
                        setFormData(prev => ({ 
                          ...prev, 
                          fuelTaxCredit: { ...prev.fuelTaxCredit, hasTrucks: !prev.fuelTaxCredit.hasTrucks } 
                        }));
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${
                        formData.fuelTaxCredit.hasTrucks ? 'bg-sky-500' : 'border border-gray-300'
                      }`}>
                        {formData.fuelTaxCredit.hasTrucks && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">Motor vehicles over 4.5 tonnes</span>
                        <p className="text-xs text-gray-500 mt-1">Trucks, buses, or other heavy vehicles</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.fuelTaxCredit.hasMachinery 
                        ? 'border-sky-500 bg-sky-50 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      if (existingRegistration?.status !== 'in-progress' && existingRegistration?.status !== 'completed') {
                        setFormData(prev => ({ 
                          ...prev, 
                          fuelTaxCredit: { ...prev.fuelTaxCredit, hasMachinery: !prev.fuelTaxCredit.hasMachinery } 
                        }));
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${
                        formData.fuelTaxCredit.hasMachinery ? 'bg-sky-500' : 'border border-gray-300'
                      }`}>
                        {formData.fuelTaxCredit.hasMachinery && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">Machinery using fuel</span>
                        <p className="text-xs text-gray-500 mt-1">Industrial equipment, generators, or other machinery</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.fuelTaxCredit.hasAgriculture 
                        ? 'border-sky-500 bg-sky-50 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      if (existingRegistration?.status !== 'in-progress' && existingRegistration?.status !== 'completed') {
                        setFormData(prev => ({ 
                          ...prev, 
                          fuelTaxCredit: { ...prev.fuelTaxCredit, hasAgriculture: !prev.fuelTaxCredit.hasAgriculture } 
                        }));
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${
                        formData.fuelTaxCredit.hasAgriculture ? 'bg-sky-500' : 'border border-gray-300'
                      }`}>
                        {formData.fuelTaxCredit.hasAgriculture && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">Agricultural, poultry, or fishery work</span>
                        <p className="text-xs text-gray-500 mt-1">Farming, livestock, aquaculture, or related activities</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add unselected options section */}
          {(formData.abn.selected || formData.gst.selected || formData.fuelTaxCredit.selected) && 
            existingRegistration?.status !== 'in-progress' && existingRegistration?.status !== 'completed' && (
            <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-md font-medium text-gray-800 mb-4">Add More Registration Options</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Show ABN option if not selected */}
                {!formData.abn.selected && (
                  <div 
                    className="rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-sky-500 hover:bg-sky-50 transition-all duration-200"
                    onClick={() => setFormData(prev => ({ ...prev, abn: { ...prev.abn, selected: true } }))}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">ABN Registration</h4>
                        <p className="text-xs text-gray-500">Add Australian Business Number registration</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Show GST option if not selected */}
                {!formData.gst.selected && (
                  <div 
                    className="rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-sky-500 hover:bg-sky-50 transition-all duration-200"
                    onClick={() => setFormData(prev => ({ ...prev, gst: { ...prev.gst, selected: true } }))}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">GST Registration</h4>
                        <p className="text-xs text-gray-500">Add Goods and Services Tax registration</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Show Fuel Tax Credit option if not selected */}
                {!formData.fuelTaxCredit.selected && (
                  <div 
                    className="rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-sky-500 hover:bg-sky-50 transition-all duration-200"
                    onClick={() => setFormData(prev => ({ ...prev, fuelTaxCredit: { ...prev.fuelTaxCredit, selected: true } }))}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Fuel Tax Credit</h4>
                        <p className="text-xs text-gray-500">Add Fuel Tax Credit registration</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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