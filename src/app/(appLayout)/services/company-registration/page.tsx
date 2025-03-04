'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, PlusIcon, MinusIcon, UserPlusIcon, ChevronDownIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { IdentificationIcon } from '@heroicons/react/24/outline'
import { Disclosure } from '@headlessui/react'
import { toast, Toaster } from 'sonner'
import useStore from '@/utils/useStore'
import CustomInput from '@/components/ui/CustomInput'
import CustomCheckbox from '@/components/ui/CustomCheckbox'
import PersonalInformation from '@/components/features/PersonaInformation'
import LoadingSpinner from '@/components/features/LoadingSpinner'
import SubmitButton from '@/components/features/SubmitButton'
import RegistrationStatusBanner from '@/components/features/RegistrationStatusBanner'
import { 
  submitCompanyRegistration, 
  checkExistingCompanyRegistration,
  AuthorizedPerson,
  CompanyRegistrationData
} from '@/lib/companyRegistratinoService'

interface CompanyFormData {
  address: string;
  postalCode: string;
  taxFileNumber: string;
  authorizedPersons: AuthorizedPerson[];
  agreeToDeclaration: boolean;
  position: string;
}

const CompanyRegistration = () => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [existingRegistration, setExistingRegistration] = useState<(CompanyRegistrationData & { id: string }) | null>(null)
  const router = useRouter()
  const { user } = useStore()

  const [companyData, setCompanyData] = useState<CompanyFormData>({
    address: '',
    postalCode: '',
    taxFileNumber: '',
    authorizedPersons: [],
    agreeToDeclaration: false,
    position: ''
  })

  useEffect(() => {
    const checkRegistration = async () => {
      if (!user?.uid) return
      
      setLoading(true)
      try {
        const result = await checkExistingCompanyRegistration(user.uid)
        if (result.exists && result.data) {
          setExistingRegistration(result.data)
          
          // Pre-fill form with existing data
          setCompanyData({
            address: result.data.address || '',
            postalCode: result.data.postalCode || '',
            taxFileNumber: result.data.taxFileNumber || '',
            authorizedPersons: result.data.authorizedPersons || [],
            agreeToDeclaration: result.data.agreeToDeclaration || false,
            position: result.data.position || ''
          })
        } else {
          // Initialize with one empty authorized person
          setCompanyData(prev => ({
            ...prev,
            authorizedPersons: [
              {
                fullName: '',
                email: '',
                dateOfBirth: '',
                phone: '',
                address: '',
                postalCode: '',
                taxFileNumber: '',
                position: ''
              }
            ]
          }))
        }
      } catch (error) {
        console.error('Error checking registration:', error)
        toast.error('Failed to check existing registration')
      } finally {
        setLoading(false)
      }
    }

    checkRegistration()
  }, [user])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setCompanyData(prev => ({
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

  const handlePersonChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => {
    const { name, value } = e.target
    
    setCompanyData(prev => ({
      ...prev,
      authorizedPersons: prev.authorizedPersons.map((person, i) => {
        if (i === index) {
          return { ...person, [name]: value }
        }
        return person
      })
    }))
    
    // Clear error when field is edited
    if (errors[`authorizedPersons.${index}.${name}`]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`authorizedPersons.${index}.${name}`]
        return newErrors
      })
    }
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
          phone: '',
          address: '',
          postalCode: '',
          taxFileNumber: '',
          position: ''
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

    if (!companyData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!companyData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required'
    } else if (!/^\d{4}$/.test(companyData.postalCode)) {
      newErrors.postalCode = 'Postal code must be 4 digits'
    }

    if (!companyData.taxFileNumber.trim()) {
      newErrors.taxFileNumber = 'Tax file number is required'
    }

    if (!companyData.agreeToDeclaration) {
      newErrors.agreeToDeclaration = 'You must agree to the declaration'
    }

    // Validate authorized persons
    companyData.authorizedPersons.forEach((person, index) => {
      if (!person.fullName.trim()) {
        newErrors[`authorizedPersons.${index}.fullName`] = 'Full name is required'
      }
      
      if (!person.email.trim()) {
        newErrors[`authorizedPersons.${index}.email`] = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(person.email)) {
        newErrors[`authorizedPersons.${index}.email`] = 'Email is invalid'
      }
      
      if (!person.position) {
        newErrors[`authorizedPersons.${index}.position`] = 'Position is required'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return
    if (!user?.uid) {
      toast.error('You must be logged in to submit a registration')
      return
    }

    setSubmitting(true)
    try {
      const registrationData = {
        ...companyData,
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || '',
        status: existingRegistration?.status || 'pending'
      };
      
      const result = await submitCompanyRegistration(registrationData)
      
      if (result.success) {
        toast.success('Company registration submitted successfully!')
        
        // Refresh the registration data
        const updatedResult = await checkExistingCompanyRegistration(user.uid)
        if (updatedResult.exists && updatedResult.data) {
          setExistingRegistration(updatedResult.data)
        }
        
        if (!existingRegistration) {
          // If this was a new submission, wait a moment then redirect
          setTimeout(() => {
            router.push('/services')
          }, 2000)
        }
      } else {
        toast.error('Failed to submit registration. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('There was an error submitting your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
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
      
      {/* Registration Status Banner */}
      {existingRegistration && (
        <RegistrationStatusBanner 
          title="Company Registration"
          status={existingRegistration?.status} 
          notes={existingRegistration?.notes}
          createdAt={existingRegistration?.createdAt}
          updatedAt={existingRegistration?.updatedAt}
          type="company"
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
          {/* Main Form Fields */}
          <div>
            <PersonalInformation title="Authorised Person Details"/>
            <div className="space-y-4 mt-4">
              <CustomInput 
                label="Address" 
                type="text" 
                name="address" 
                value={companyData.address} 
                onChange={handleChange} 
                errors={errors.address} 
                placeholder="Enter your postal address" 
                disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
              />
              <CustomInput 
                label="Postal Code" 
                type="text" 
                name="postalCode" 
                value={companyData.postalCode} 
                onChange={handleChange} 
                errors={errors.postalCode} 
                placeholder="Enter your postal code" 
                disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
              />
              <CustomInput 
                label="Tax File Number" 
                type="text" 
                name="taxFileNumber" 
                value={companyData.taxFileNumber} 
                onChange={handleChange} 
                errors={errors.taxFileNumber} 
                placeholder="Enter your tax file number" 
                disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
              />
            </div>
          </div>

          {/* Position in Company */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Position in Company</h2>
            <div className="space-y-2">
              <CustomCheckbox 
                label="Director" 
                name="position" 
                checked={companyData.position === 'Director'} 
                onChange={() => setCompanyData(prev => ({ ...prev, position: 'Director' }))} 
                disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
              />
              <CustomCheckbox 
                label="Shareholder" 
                name="position" 
                checked={companyData.position === 'Shareholder'} 
                onChange={() => setCompanyData(prev => ({ ...prev, position: 'Shareholder' }))} 
                disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
              />
            </div>
          </div>

          {/* Authorized Persons Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center text-xs mr-2">
                <UserGroupIcon className="w-4 h-4" />
              </span>
              Authorized Persons
            </h2>
            
            <p className="text-sm text-gray-600 mb-4">
              Add details of all individuals who are authorized to act on behalf of the company.
            </p>
            
            {companyData.authorizedPersons && companyData.authorizedPersons.length > 0 ? (
              <div className="space-y-4 mb-4">
                {companyData.authorizedPersons.map((person, index) => (
                  <Disclosure key={index} defaultOpen={true}>
                    {({ open }) => (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <Disclosure.Button className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center">
                            <UserPlusIcon className="w-5 h-5 text-sky-500 mr-2" />
                            <span className="font-medium text-gray-800">
                              {person.fullName ? person.fullName : `Authorized Person ${index + 1}`}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">{open ? 'Hide Details' : 'Show Details'}</span>
                            <ChevronDownIcon 
                              className={`w-5 h-5 text-gray-500 transition-transform ${open ? 'transform rotate-180' : ''}`} 
                            />
                          </div>
                        </Disclosure.Button>
                        
                        <Disclosure.Panel className="bg-white p-4 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CustomInput 
                              label="Full Name" 
                              type="text" 
                              name="fullName" 
                              value={person.fullName} 
                              onChange={(e:any) => handlePersonChange(e, index)} 
                              errors={errors[`authorizedPersons.${index}.fullName`]} 
                              placeholder="Enter full name" 
                              disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                            />
                            
                            <CustomInput 
                              label="Email" 
                              type="email" 
                              name="email" 
                              value={person.email} 
                              onChange={(e:any) => handlePersonChange(e, index)} 
                              errors={errors[`authorizedPersons.${index}.email`]} 
                              placeholder="Enter email address" 
                              disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                            />
                            
                            <CustomInput 
                              label="Date of Birth" 
                              type="date" 
                              name="dateOfBirth" 
                              value={person.dateOfBirth} 
                              onChange={(e:any) => handlePersonChange(e, index)} 
                              errors={errors[`authorizedPersons.${index}.dateOfBirth`]} 
                              disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                            />
                            
                            <CustomInput 
                              label="Phone Number" 
                              type="tel" 
                              name="phone" 
                              value={person.phone} 
                              onChange={(e:any) => handlePersonChange(e, index)} 
                              errors={errors[`authorizedPersons.${index}.phone`]} 
                              placeholder="Enter phone number" 
                              disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                            />
                            
                            <div className="md:col-span-2">
                              <CustomInput 
                                label="Address" 
                                type="text" 
                                name="address" 
                                value={person.address} 
                                onChange={(e:any) => handlePersonChange(e, index)} 
                                errors={errors[`authorizedPersons.${index}.address`]} 
                                placeholder="Enter address" 
                                disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                              />
                            </div>
                            
                            <CustomInput 
                              label="Postal Code" 
                              type="text" 
                              name="postalCode" 
                              value={person.postalCode} 
                              onChange={(e:any) => handlePersonChange(e, index)} 
                              errors={errors[`authorizedPersons.${index}.postalCode`]} 
                              placeholder="Enter postal code" 
                              maxLength={4}
                              disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                            />
                            
                            <CustomInput 
                              label="Tax File Number" 
                              type="text" 
                              name="taxFileNumber" 
                              value={person.taxFileNumber} 
                              onChange={(e:any) => handlePersonChange(e, index)} 
                              errors={errors[`authorizedPersons.${index}.taxFileNumber`]} 
                              placeholder="Enter TFN" 
                              disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                            />
                            
                            <div className="md:col-span-2">
                              <label htmlFor={`position-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Position in Company
                              </label>
                              <select
                                id={`position-${index}`}
                                name="position"
                                value={person.position}
                                onChange={(e:any) => handlePersonChange(e, index)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                              >
                                <option value="">Select position</option>
                                <option value="Director">Director</option>
                                <option value="Secretary">Secretary</option>
                                <option value="Shareholder">Shareholder</option>
                                <option value="Public Officer">Public Officer</option>
                                <option value="CEO">CEO</option>
                                <option value="CFO">CFO</option>
                                <option value="Other">Other</option>
                              </select>
                              {errors[`authorizedPersons.${index}.position`] && (
                                <p className="mt-1 text-sm text-red-600">{errors[`authorizedPersons.${index}.position`]}</p>
                              )}
                            </div>
                          </div>
                          
                          {existingRegistration?.status !== 'completed' && existingRegistration?.status !== 'in-progress' && (
                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                              <button
                                type="button"
                                onClick={() => removeAuthorizedPerson(index)}
                                className="px-4 py-2 flex items-center text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <MinusIcon className="w-4 h-4 mr-1" />
                                Remove Person
                              </button>
                            </div>
                          )}
                        </Disclosure.Panel>
                      </div>
                    )}
                  </Disclosure>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center mb-4">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3 cursor-pointer" onClick={addAuthorizedPerson}>
                  <UserPlusIcon className="w-8 h-8 text-sky-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">No Authorized Persons Added</h3>
                <p className="text-gray-600 mb-4">
                  Add details of individuals who will be authorized to act on behalf of the company.
                </p>
              </div>
            )}
            
            {existingRegistration?.status !== 'completed' && existingRegistration?.status !== 'in-progress' && (
              <button
                type="button"
                onClick={addAuthorizedPerson}
                className="w-full flex items-center justify-center px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Authorized Person
              </button>
            )}
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
            <CustomCheckbox 
              label="Authorisation Approval Provided" 
              name="agreeToDeclaration" 
              checked={companyData.agreeToDeclaration} 
              onChange={handleChange} 
              errors={errors.agreeToDeclaration}
              disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
            />
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
          
          {existingRegistration?.status !== 'completed' && existingRegistration?.status !== 'in-progress' && (
            <SubmitButton
              isSubmitting={submitting}
              defaultText="Submit Registration"
              pendingText="Submitting..."
              rejectedText="Resubmit Registration"
            />
          )}
        </div>
      </motion.form>
    </div>
  )
}

export default CompanyRegistration