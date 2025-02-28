'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { IdentificationIcon } from '@heroicons/react/24/outline'
import PhoneInput from 'react-phone-number-input/input'
import 'react-phone-number-input/style.css'
import { Disclosure } from '@headlessui/react'
import CustomInput from '@/components/ui/CustomInput';
import CustomCheckbox from '@/components/ui/CustomCheckbox';

const CompanyRegistration = () => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const [companyData, setCompanyData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    phone: '+61',
    postalAddress: '',
    postalCode: '',
    abn: '',
    businessName: '',
    businessAddress: '',
    businessPostalCode: '',
    otherDetails: '',
    authorizedPersons: [
      {
        fullName: '',
        email: '',
        dateOfBirth: '',
        phone: '+61',
        address: '',
        postalCode: '',
        taxFileNumber: '',
        position: 'Director'
      }
    ],
    agreeToDeclaration: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const { name, value, type } = e.target
    let updatedAuthorizedPersons:any = [...companyData.authorizedPersons]
    updatedAuthorizedPersons[index][name] = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setCompanyData(prev => ({
      ...prev,
      authorizedPersons: updatedAuthorizedPersons
    }))
  }

  const handlePhoneChange = (value: string | undefined, index: number) => {
    const updatedAuthorizedPersons = [...companyData.authorizedPersons]
    updatedAuthorizedPersons[index].phone = value || ''
    setCompanyData(prev => ({
      ...prev,
      authorizedPersons: updatedAuthorizedPersons
    }))
  }

  const addAuthorizedPerson = () => {
    setCompanyData(prev => ({
      ...prev,
      authorizedPersons: [
        ...prev.authorizedPersons,
        {
          fullName: '',
          email: '',
          dateOfBirth: '',
          phone: '+61',
          address: '',
          postalCode: '',
          taxFileNumber: '',
          position: 'Director'
        }
      ]
    }))
  }

  const removeAuthorizedPerson = (index: number) => {
    const updatedAuthorizedPersons = companyData.authorizedPersons.filter((_, i) => i !== index)
    setCompanyData(prev => ({
      ...prev,
      authorizedPersons: updatedAuthorizedPersons
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!companyData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!companyData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(companyData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!companyData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }

    if (!companyData.phone || companyData.phone === '+61') {
      newErrors.phone = 'Phone number is required'
    }

    if (!companyData.postalAddress.trim()) {
      newErrors.postalAddress = 'Postal address is required'
    }

    if (!companyData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required'
    } else if (!/^\d{4}$/.test(companyData.postalCode)) {
      newErrors.postalCode = 'Postal code must be 4 digits'
    }

    if (!companyData.abn.trim()) {
      newErrors.abn = 'ABN is required'
    }

    if (!companyData.businessName.trim()) {
      newErrors.businessName = 'Business name is required'
    }

    if (!companyData.businessAddress.trim()) {
      newErrors.businessAddress = 'Business address is required'
    }

    if (!companyData.businessPostalCode.trim()) {
      newErrors.businessPostalCode = 'Business postal code is required'
    } else if (!/^\d{4}$/.test(companyData.businessPostalCode)) {
      newErrors.businessPostalCode = 'Business postal code must be 4 digits'
    }

    if (!companyData.otherDetails.trim()) {
      newErrors.otherDetails = 'Other details are required'
    }

    if (!companyData.agreeToDeclaration) {
      newErrors.agreeToDeclaration = 'You must agree to the declaration'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      // Simulate API call
      alert('Company registration submitted successfully!')
      router.push('/services')
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('There was an error submitting your request. Please try again.')
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Company Name Registration</h1>
        </div>
        
        <p className="text-gray-600 text-sm">
          Complete the form below to register your company. All fields marked with * are required.
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
          {/* Main Form Fields */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h2>
            <div className="space-y-4">
              <CustomInput label="Full Name of Applicant/Authorized Person" name="fullName" value={companyData.fullName} onChange={(e) => handleChange(e, 0)} errors={errors.fullName} placeholder="Enter your full name" />
              <CustomInput label="Email" name="email" value={companyData.email} onChange={(e) => handleChange(e, 0)} errors={errors.email} placeholder="Enter your email address" />
              <CustomInput label="Date of Birth of Applicant/Authorized Person" type="date" name="dateOfBirth" value={companyData.dateOfBirth} onChange={(e) => handleChange(e, 0)} errors={errors.dateOfBirth} placeholder="Enter your date of birth" />
              <CustomInput label="Telephone/Mobile" name="phone" value={companyData.phone} onChange={(e) => handleChange(e, 0)} errors={errors.phone} placeholder="Enter your phone number" />
              <CustomInput label="Postal Address" type="text" name="postalAddress" value={companyData.postalAddress} onChange={(e) => handleChange(e, 0)} errors={errors.postalAddress} placeholder="Enter your postal address" />
              <CustomInput label="Postal Code" type="text" name="postalCode" value={companyData.postalCode} onChange={(e) => handleChange(e, 0)} errors={errors.postalCode} placeholder="Enter your postal code" />
              <CustomInput label="ABN" type="text" name="abn" value={companyData.abn} onChange={(e) => handleChange(e, 0)} errors={errors.abn} placeholder="Enter your ABN" />
              <CustomInput label="Business Name" type="text" name="businessName" value={companyData.businessName} onChange={(e) => handleChange(e, 0)} errors={errors.businessName} placeholder="Enter your business name" />
              <CustomInput label="Business Address" type="text" name="businessAddress" value={companyData.businessAddress} onChange={(e) => handleChange(e, 0)} errors={errors.businessAddress} placeholder="Enter your business address" />
              <CustomInput label="Business Postal Code" type="text" name="businessPostalCode" value={companyData.businessPostalCode} onChange={(e) => handleChange(e, 0)} errors={errors.businessPostalCode} placeholder="Enter your business postal code" />
              <CustomInput label="Other Details (if any)" type="text" name="otherDetails" value={companyData.otherDetails} onChange={(e) => handleChange(e, 0)} errors={errors.otherDetails} placeholder="Enter other details" />
            </div>
          </div>

          {/* Authorized Persons Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Authorized Persons</h2>
            {companyData.authorizedPersons.map((person, index) => (
              <Disclosure key={index}>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="w-full px-4 py-2 mb-2 bg-sky-200 text-gray-700 rounded-lg hover:bg-sky-300 transition-colors">
                      {open ? 'Close Authorized Person' : 'Add Authorized Person'}
                    </Disclosure.Button>
                    <Disclosure.Panel className="space-y-4 bg-gray-50 p-4 rounded-lg shadow-md">
                      <CustomInput label="Full Name" type="text" name="fullName" value={person.fullName} onChange={(e) => handleChange(e, index)} errors={errors.fullName} placeholder="Enter your full name" />
                      <CustomInput label="Email" name="email" value={person.email} onChange={(e) => handleChange(e, index)} errors={errors.email} placeholder="Enter your email address" />
                      <CustomInput label="Date of Birth" type="date" name="dateOfBirth" value={person.dateOfBirth} onChange={(e) => handleChange(e, index)} errors={errors.dateOfBirth} placeholder="Enter your date of birth" />
                      <CustomInput label="Phone Number" name="phone" value={person.phone} onChange={(e) => handleChange(e, index)} errors={errors.phone} placeholder="Enter your phone number" />
                      <CustomInput label="Address" type="text" name="address" value={person.address} onChange={(e) => handleChange(e, index)} errors={errors.address} placeholder="Enter your address" />
                      <CustomInput label="Postal Code" type="text" name="postalCode" value={person.postalCode} onChange={(e) => handleChange(e, index)} errors={errors.postalCode} placeholder="Enter your postal code" />
                      <CustomInput label="Tax File Number" type="text" name="taxFileNumber" value={person.taxFileNumber} onChange={(e) => handleChange(e, index)} errors={errors.taxFileNumber} placeholder="Enter your tax file number" />
                      <CustomInput label="Position in Company" type="text" name="position" value={person.position} onChange={(e) => handleChange(e, index)} errors={errors.position} placeholder="Enter your position in company" />
                      <button
                        type="button"
                        onClick={() => removeAuthorizedPerson(index)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg mt-2 hover:bg-red-600"
                      >
                        Remove Authorized Person
                      </button>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
            <button
              type="button"
              onClick={addAuthorizedPerson}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg mt-4 hover:bg-blue-600"
            >
              Add Authorized Person
            </button>
          </div>

          {/* Declaration */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              I/We hereby authorize Mr. AMAN NAGPAL C/O Proven Associated Services Pty Ltd or Proven Accountants to update/add all details with ASIC on my behalf & represent me before various organizations and lodge various documents with the tax office, including updating ABN based on information provided by me from time to time. 
            </p>
            <p className="text-sm text-gray-600 mb-3">
            I/We further declare that:
            </p>
            <ol className="list-decimal list-inside text-sm text-gray-600 mb-3">
              <li>None of the mentioned applicant(s) is/are disqualified from managing corporations under Section 206B(1) of the Corporations Act 2001.</li>
              <li>Within the last 5 years, none of the above-mentioned applicants has been convicted or released from prison after being convicted, or serving a term of imprisonment for any of the criminal offenses referred to in Section 32(1)(c) or (d) of the Business Names Registration Act 2011.</li>
              <li>This application is submitted under and compliant with the terms and conditions of the ASIC Electronic Lodgement Protocol details.</li>
              <li>The information supplied is accurate and complete to the best of my knowledge, and any false information provided may lead to penalties under applicable acts, rules, and regulations.</li>
              <li>All the persons mentioned in the application have consented to act for the respective roles.</li>
            </ol>
            <CustomCheckbox label="Authorisation Approval Provided" name="agreeToDeclaration" checked={companyData.agreeToDeclaration} onChange={(e) => handleChange(e, 0)} />
          </div>
        </div>

        {/* Submit Button */}
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
            className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Submit Registration
          </button>
        </div>
      </motion.form>
    </div>
  )
}

export default CompanyRegistration