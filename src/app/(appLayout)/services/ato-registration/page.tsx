'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { IdentificationIcon } from '@heroicons/react/24/outline'
import PhoneInput from 'react-phone-number-input/input'
import 'react-phone-number-input/style.css'

const ATORegistrationPage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    phone: '+61',
    postalAddress: '',
    postalCode: '',
    abn: false,
    gst: false,
    fuelTaxCredit: false,
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
    
    if (!formData.agreeToDeclaration) {
      newErrors.agreeToDeclaration = 'You must agree to the declaration'
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
      alert('ATO Registration request submitted successfully!')
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">ATO Registration</h1>
        </div>
        
        <p className="text-gray-600 text-sm">
          Complete the form below to request ATO registration services. All fields marked with * are required.
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
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name of Applicant/Authorised Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth of Applicant/Authorised Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors`}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                )}
              </div>
              
              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telephone/Mobile <span className="text-red-500">*</span>
                </label>
                <div className={`flex items-center px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-colors`}>
                  <div className="flex items-center mr-2">
                    <img 
                      src="https://flagcdn.com/w20/au.png" 
                      alt="Australia" 
                      className="w-5 h-auto mr-1" 
                    />
                  </div>
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
          
          {/* Address Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h2>
            <div className="space-y-4">
              {/* Postal Address */}
              <div>
                <label htmlFor="postalAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postalAddress"
                  name="postalAddress"
                  value={formData.postalAddress}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.postalAddress ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors`}
                  placeholder="Enter your postal address"
                />
                {errors.postalAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.postalAddress}</p>
                )}
              </div>
              
              {/* Postal Code */}
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.postalCode ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors`}
                  placeholder="Enter postal code"
                  maxLength={4}
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Registration Options */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Registration Options</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="abn"
                    name="abn"
                    type="checkbox"
                    checked={formData.abn}
                    onChange={handleChange}
                    className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="abn" className="text-sm font-medium text-gray-700">
                    ABN Registration Required
                  </label>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="gst"
                    name="gst"
                    type="checkbox"
                    checked={formData.gst}
                    onChange={handleChange}
                    className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="gst" className="text-sm font-medium text-gray-700">
                    GST Registration Required
                  </label>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="fuelTaxCredit"
                    name="fuelTaxCredit"
                    type="checkbox"
                    checked={formData.fuelTaxCredit}
                    onChange={handleChange}
                    className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="fuelTaxCredit" className="text-sm font-medium text-gray-700">
                    FUEL TAX CREDIT
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Declaration */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs md:text-sm text-gray-600 mb-3">
              Declaration: We hereby authorise Proven Associated Services Pty Ltd & Mr Aman Nagpal T/A Proven Accountants, Tax agents to add us in their tax portal, represent us before various organisations and to provide Accounting & tax services including lodgement of Business Activity Statements(if any), tax returns and other documents required by tax office & other departments (based on information provided by us) from time to time.
            </p>
            
            <div className="flex gap-2 items-center">
              <div className="flex items-center h-5">
                <input
                  id="agreeToDeclaration"
                  name="agreeToDeclaration"
                  type="checkbox"
                  checked={formData.agreeToDeclaration}
                  onChange={handleChange}
                  className={`w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500 ${errors.agreeToDeclaration ? 'border-red-300' : ''}`}
                />
              </div>
              <div className="">
                <label htmlFor="agreeToDeclaration" className="text-sm font-medium text-gray-700">
                  Authorisation Approval Provided <span className="text-red-500">*</span>
                </label>
                {errors.agreeToDeclaration && (
                  <p className="mt-1 text-sm text-red-600">{errors.agreeToDeclaration}</p>
                )}
              </div>
            </div>
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

export default ATORegistrationPage