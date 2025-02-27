'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { IdentificationIcon } from '@heroicons/react/24/outline'
import PhoneInput from 'react-phone-number-input/input'
import 'react-phone-number-input/style.css'
import { Disclosure } from '@headlessui/react'

const CompanyRegistration = () => {
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
    // Implement the form validation here
    return true
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
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name of Applicant/Authorized Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={companyData.fullName}
                  onChange={(e) => handleChange(e, 0)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={companyData.email}
                  onChange={(e) => handleChange(e, 0)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={companyData.dateOfBirth}
                  onChange={(e) => handleChange(e, 0)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telephone/Mobile <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  country="AU"
                  value={companyData.phone}
                  onChange={(value) => handlePhoneChange(value, 0)}
                  className="w-full bg-transparent outline-none"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label htmlFor="postalAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postalAddress"
                  name="postalAddress"
                  value={companyData.postalAddress}
                  onChange={(e) => handleChange(e, 0)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  placeholder="Enter postal address"
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={companyData.postalCode}
                  onChange={(e) => handleChange(e, 0)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  placeholder="Enter postal code"
                />
              </div>

              <div>
                <label htmlFor="abn" className="block text-sm font-medium text-gray-700 mb-1">
                  ABN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="abn"
                  name="abn"
                  value={companyData.abn}
                  onChange={(e) => handleChange(e, 0)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  placeholder="Enter ABN"
                />
              </div>

              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={companyData.businessName}
                  onChange={(e) => handleChange(e, 0)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  placeholder="Enter business name"
                />
              </div>

              <div>
                <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="businessAddress"
                  name="businessAddress"
                  value={companyData.businessAddress}
                  onChange={(e) => handleChange(e, 0)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  placeholder="Enter business address"
                />
              </div>

              <div>
                <label htmlFor="businessPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="businessPostalCode"
                  name="businessPostalCode"
                  value={companyData.businessPostalCode}
                  onChange={(e) => handleChange(e, 0)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  placeholder="Enter business postal code"
                />
              </div>

              <div>
                <label htmlFor="otherDetails" className="block text-sm font-medium text-gray-700 mb-1">
                  Other Details (if any)
                </label>
                <textarea
                  id="otherDetails"
                  name="otherDetails"
                  value={companyData.otherDetails}
                  onChange={(e) => handleChange(e, 0)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  placeholder="Enter other details"
                />
              </div>
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
                      {/* Full Name */}
                      <div>
                        <label htmlFor={`fullName${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id={`fullName${index}`}
                          name="fullName"
                          value={person.fullName}
                          onChange={(e) => handleChange(e, index)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                          placeholder="Enter full name"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor={`email${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id={`email${index}`}
                          name="email"
                          value={person.email}
                          onChange={(e) => handleChange(e, index)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                          placeholder="Enter email"
                        />
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label htmlFor={`dateOfBirth${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id={`dateOfBirth${index}`}
                          name="dateOfBirth"
                          value={person.dateOfBirth}
                          onChange={(e) => handleChange(e, index)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label htmlFor={`phone${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <PhoneInput
                          country="AU"
                          value={person.phone}
                          onChange={(value) => handlePhoneChange(value, index)}
                          className="w-full bg-transparent outline-none"
                          placeholder="Enter phone number"
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <label htmlFor={`address${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id={`address${index}`}
                          name="address"
                          value={person.address}
                          onChange={(e) => handleChange(e, index)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                          placeholder="Enter address"
                        />
                      </div>

                      {/* Postal Code */}
                      <div>
                        <label htmlFor={`postalCode${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id={`postalCode${index}`}
                          name="postalCode"
                          value={person.postalCode}
                          onChange={(e) => handleChange(e, index)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                          placeholder="Enter postal code"
                        />
                      </div>

                      {/* Tax File Number */}
                      <div>
                        <label htmlFor={`taxFileNumber${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Tax File Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id={`taxFileNumber${index}`}
                          name="taxFileNumber"
                          value={person.taxFileNumber}
                          onChange={(e) => handleChange(e, index)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                          placeholder="Enter tax file number"
                        />
                      </div>

                      {/* Position */}
                      <div>
                        <label htmlFor={`position${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Position in Company <span className="text-red-500">*</span>
                        </label>
                        <select
                          id={`position${index}`}
                          name="position"
                          value={person.position}
                          onChange={(e:any) => handleChange(e, index)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                        >
                          <option value="Director">Director</option>
                          <option value="Shareholder">Shareholder</option>
                        </select>
                      </div>

                      {/* Remove Button */}
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
            
            <div className="flex items-center gap-2">
              <div className="flex items-center h-5">
                <input
                  id="agreeToDeclaration"
                  name="agreeToDeclaration"
                  type="checkbox"
                  // checked={companyData.agreeToDeclaration}
                  onChange={(e) => handleChange(e, 0)}
                  className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                />
              </div>
              <div className="">
                <label htmlFor="agreeToDeclaration" className="text-sm font-medium text-gray-700">
                  Authorisation Approval Provided <span className="text-red-500">*</span>
                </label>
              </div>
            </div>
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
