'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, PlusIcon, MinusIcon, UserPlusIcon, ChevronDownIcon, UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline'
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
  checkExistingTrustRegistration,
  TrustAuthorizedPerson,
  TrustRegistrationData
} from '@/lib/trustRegistrationService'
import SkeletonLoader from '@/components/ui/SkeletonLoader';

interface TrustFormData {
  address: string;
  postalCode: string;
  taxFileNumber: string;
  authorizedPersons: TrustAuthorizedPerson[];
  agreeToDeclaration: boolean;
  trustName: string;
  trustAddress: string;
}

const TrustRegistration = () => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [existingRegistration, setExistingRegistration] = useState<(TrustRegistrationData & { id: string }) | null>(null)
  const router = useRouter()
  const { user } = useStore()

  const [trustData, setTrustData] = useState<TrustFormData>({
    address: '',
    postalCode: '',
    taxFileNumber: '',
    authorizedPersons: [],
    agreeToDeclaration: false,
    trustName: '',
    trustAddress: '',
  })

  useEffect(() => {
    const checkRegistration = async () => {
      if (!user?.uid) return

      setLoading(true)
      try {
        const result = await checkExistingTrustRegistration(user.uid)
        if (result.exists && result.data) {
          setExistingRegistration(result.data)

          // Pre-fill form with existing data
          setTrustData({
            address: result.data.address || '',
            postalCode: result.data.postalCode || '',
            taxFileNumber: result.data.taxFileNumber || '',
            authorizedPersons: result.data.authorizedPersons || [],
            agreeToDeclaration: result.data.agreeToDeclaration || false,
            trustName: result.data.trustName || '',
            trustAddress: result.data.trustAddress || ''
          })
        }
      } catch (error) {
        console.error('Error checking registration:', error)
        toast.error('Failed to check existing registration', {
          style: { backgroundColor: '#f87171', color: 'white' }
        })
      } finally {
        setLoading(false)
      }
    }

    checkRegistration()
  }, [user])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setTrustData(prev => ({
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

    setTrustData(prev => ({
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
    setTrustData(prev => ({
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
    const updatedAuthorizedPersons = trustData.authorizedPersons.filter((_, i) => i !== index)
    setTrustData(prev => ({
      ...prev,
      authorizedPersons: updatedAuthorizedPersons
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!trustData.trustName.trim()) {
      newErrors.trustName = 'Trust name is required'
    }

    if (!trustData.trustAddress.trim()) {
      newErrors.trustAddress = 'Trust address is required'
    }

    if (!trustData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!trustData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required'
    } else if (!/^\d{4}$/.test(trustData.postalCode)) {
      newErrors.postalCode = 'Postal code must be 4 digits'
    }

    if (!trustData.taxFileNumber.trim()) {
      newErrors.taxFileNumber = 'Tax file number is required'
    }

    if (!trustData.agreeToDeclaration) {
      newErrors.agreeToDeclaration = 'You must agree to the declaration'
    }

    // Validate authorized persons if any exist
    if (trustData.authorizedPersons && trustData.authorizedPersons.length > 0) {
      trustData.authorizedPersons.forEach((person, index) => {
        if (!person.fullName.trim()) {
          newErrors[`authorizedPersons.${index}.fullName`] = 'Full name is required'
        }

        if (!person.email.trim()) {
          newErrors[`authorizedPersons.${index}.email`] = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(person.email)) {
          newErrors[`authorizedPersons.${index}.email`] = 'Email is invalid'
        }
      })
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return
    if (!user?.uid) {
      toast.error('You must be logged in to submit a registration', {
        style: { backgroundColor: '#f87171', color: 'white' }
      })
      return
    }

    setSubmitting(true)
    try {
      const userId = user.uid || user.id;
      
      // Include user information in the request
      const trustRegistrationData = {
        ...trustData,
        userId: userId,
        userName: user.displayName || user.firstName || user.name || 'Client',
        userEmail: user.email,
        status: existingRegistration?.status || 'pending',
        user: {
          phone: user.phone || '',
          address: user.address || '',
          ...user
        }
      };

      const response = await fetch('/api/trust-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trustRegistrationData }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Trust registration submitted successfully!', {
          style: { backgroundColor: '#10b981', color: 'white' }
        })

        // Refresh the registration data
        const updatedResult = await checkExistingTrustRegistration(user.uid)
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
        toast.error(result.message || 'Failed to submit registration. Please try again.', {
          style: { backgroundColor: '#f87171', color: 'white' }
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('There was an error submitting your request. Please try again.', {
        style: { backgroundColor: '#f87171', color: 'white' }
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmSubmit = () => {
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(syntheticEvent);
  };

  if (loading) {
    return (
      <SkeletonLoader />
    )
  }

  return (
    <div className="container mx-auto px-2 py-4 md:px-4 md:py-8 w-full md:max-w-3xl">
      <Toaster position="top-right" richColors />

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
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Trust Registration</h1>
        </div>

        <p className="text-gray-600 text-sm">
          Complete the form below to register your trust. All fields marked with * are required.
        </p>
      </motion.div>

      {/* Registration Status Banner */}
      {existingRegistration && (
        <RegistrationStatusBanner
          title="Trust Registration"
          status={existingRegistration.status}
          notes={existingRegistration.notes}
          createdAt={existingRegistration.createdAt}
          updatedAt={existingRegistration.updatedAt}
          type="trust"
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
          {/* Trust Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Trust Information</h2>
            <div className="space-y-4">
              <CustomInput
                label="Trust Name"
                type="text"
                name="trustName"
                value={trustData.trustName}
                onChange={handleChange}
                errors={errors.trustName}
                placeholder="Enter trust name"
                disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
              />
              <CustomInput
                label="Trust Address"
                type="text"
                name="trustAddress"
                value={trustData.trustAddress}
                onChange={handleChange}
                errors={errors.trustAddress}
                placeholder="Enter trust address"
                disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
              />
            </div>
          </div>

          {/* Main Form Fields */}
          <div>
            <PersonalInformation title="Authorised Trustee Person Details" />
            <div className="space-y-4 mt-4">
              <CustomInput
                label="Address"
                type="text"
                name="address"
                value={trustData.address}
                onChange={handleChange}
                errors={errors.address}
                placeholder="Enter your postal address"
                disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
              />
              <CustomInput
                label="Postal Code"
                type="text"
                name="postalCode"
                value={trustData.postalCode}
                onChange={handleChange}
                errors={errors.postalCode}
                placeholder="Enter your postal code"
                disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
              />
              <CustomInput
                label="Tax File Number"
                type="text"
                name="taxFileNumber"
                value={trustData.taxFileNumber}
                onChange={handleChange}
                errors={errors.taxFileNumber}
                placeholder="Enter your tax file number"
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
              Add details of all individuals who are authorized to act on behalf of the trust.
            </p>

            {trustData.authorizedPersons && trustData.authorizedPersons.length > 0 ? (
              <div className="space-y-4 mb-4">
                {trustData.authorizedPersons.map((person, index) => (
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
                          </div>

                          {existingRegistration?.status !== 'completed' && existingRegistration?.status !== 'in-progress' && (
                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                              <button
                                type="button"
                                onClick={() => removeAuthorizedPerson(index)}
                                className="px-4 py-2 flex items-center text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <XMarkIcon className="w-4 h-4 mr-1" />
                                Remove
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
                  Add details of individuals who will be authorized to act on behalf of the trust.
                </p>
                <button
                  type="button"
                  onClick={addAuthorizedPerson}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors inline-flex items-center"
                  disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Authorized Person
                </button>
              </div>
            )}

            {trustData.authorizedPersons && trustData.authorizedPersons.length > 0 && existingRegistration?.status !== 'completed' && existingRegistration?.status !== 'in-progress' && (
              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex items-center justify-end"
              >
                <button
                type="button"
                onClick={addAuthorizedPerson}
                className="w-2/4 flex items-center justify-center px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Authorized Person
              </button>
              </motion.div>
            )}
          </div>

          {/* Declaration */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              I/We hereby authorize Mr. AMAN NAGPAL C/O Proven Associated Services Pty Ltd or Proven Accountants to update/add all details with ASIC on my behalf & represent me before various organizations and lodge various documents with the tax office, including updating ABN based on information provided by me from time to time.
            </p>
            <p className="text-sm text-gray-600 mb-3">
              All persons who are part of the Trust hereby consent to act for their prescribed positions and authorize the application for various Tax Registrations.
            </p>
            <ol className="list-decimal list-inside text-sm text-gray-600 mb-3">
              <li>The information supplied is accurate and complete to the best of my knowledge.</li>
              <li>I understand that providing false or misleading information may lead to penalties under applicable laws.</li>
              <li>All the persons mentioned in the application have consented to act for the respective roles.</li>
            </ol>
            <CustomCheckbox
              label="Authorisation Approval Provided"
              name="agreeToDeclaration"
              checked={trustData.agreeToDeclaration}
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
              pendingText="Update Registration"
              rejectedText="Resubmit Registration"
              status={existingRegistration?.status}
              validateForm={validateForm}
              onConfirm={handleConfirmSubmit}
              completedText="Already Submitted"

            />
          )}
        </div>
      </motion.form>
    </div>
  )
}

export default TrustRegistration