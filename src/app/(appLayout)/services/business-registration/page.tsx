'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { IdentificationIcon } from '@heroicons/react/24/outline'
import PhoneInput from 'react-phone-number-input/input'
import 'react-phone-number-input/style.css'
import CustomInput from '@/components/ui/CustomInput'
import CustomCheckbox from '@/components/ui/CustomCheckbox'

const BusinessRegistrationPage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    phone: '+61',
    postalAddress: '',
    postalCode: '',
    abn: '',
    businessName: '',
    businessAddress: '',
    agreeToDeclaration: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handlePhoneChange = (value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      phone: value || ''
    }))
    
    // Clear error when field is edited
    if (errors.phone) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.phone
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }
    
    if (!formData.phone || formData.phone === '+61') {
      newErrors.phone = 'Phone number is required'
    }
    
    if (!formData.postalAddress.trim()) {
      newErrors.postalAddress = 'Postal address is required'
    }
    
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required'
    } else if (!/^\d{4}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Postal code must be 4 digits'
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required'
    }

    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = 'Business address is required'
    }

    if (!formData.agreeToDeclaration) {
      newErrors.agreeToDeclaration = 'You must agree to the declaration'
    }
    if(!formData.abn.trim()) {
      newErrors.abn = 'ABN is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Here you would typically send the data to your backend
      console.log('Form submitted:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success message or redirect
      alert('Business Registration request submitted successfully!')
      router.push('/services')
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('There was an error submitting your request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Business Registration</h1>
        </div>
        
        <p className="text-gray-600 text-sm">
          Complete the form below to register your business. All fields marked with * are required.
        </p>
      </motion.div>
      
      {/* Form */}
      <motion.form 
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="p-6 space-y-6">
          {/* Personal Information Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
            <div className="space-y-4">
              <CustomInput label="Full Name of Applicant/Authorized Person" name="fullName" value={formData.fullName} onChange={handleChange} errors={errors.fullName} placeholder="Enter your full name" />
              <CustomInput label="Email" type="email" name="email" value={formData.email} onChange={handleChange} errors={errors.email} placeholder="Enter your email address" />
              <CustomInput label="Date of Birth of Applicant/Authorized Person" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} errors={errors.dateOfBirth} placeholder="Enter your date of birth" />
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telephone/Mobile <span className="text-red-500">*</span>
                </label>
                <div className={`flex items-center px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-colors`}>
                  <PhoneInput
                    country="AU"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full bg-transparent outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Address Information Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h2>
            <div className="space-y-4">
              {/* Postal Address */}
              <CustomInput label="Postal Address" type="text" name="postalAddress" value={formData.postalAddress} onChange={handleChange} errors={errors.postalAddress} placeholder="Enter your postal address" />
              <CustomInput label="Postal Code" type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} errors={errors.postalCode} placeholder="Enter your postal code" />
            </div>
          </div>

          {/* Business Registration Options Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Business Registration Details</h2>
            <div className="space-y-4">
              <CustomInput label="ABN" type="text" name="abn" value={formData.abn} onChange={handleChange} errors={errors.abn} placeholder="Enter ABN" />
              <CustomInput label="Business Name" type="text" name="businessName" value={formData.businessName} onChange={handleChange} errors={errors.businessName} placeholder="Enter your business name" />
              <CustomInput label="Business Address" type="text" name="businessAddress" value={formData.businessAddress} onChange={handleChange} errors={errors.businessAddress} placeholder="Enter your business address" />
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
            <CustomCheckbox label="I agree to the declaration" name="agreeToDeclaration" checked={formData.agreeToDeclaration} onChange={handleChange} />
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
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Submit Registration'
            )}
          </button>
        </div>
      </motion.form>
    </div>
  )
}

export default BusinessRegistrationPage
