'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, PlusIcon, UserPlusIcon, ChevronDownIcon, UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { IdentificationIcon } from '@heroicons/react/24/outline'
import { Disclosure } from '@headlessui/react'
import { toast } from 'sonner'
import useStore from '@/utils/useStore'
import CustomInput from '@/components/ui/CustomInput'
import CustomCheckbox from '@/components/ui/CustomCheckbox'
import PersonalInformation from '@/components/features/PersonaInformation'
import SubmitButton from '@/components/features/SubmitButton'
import RegistrationStatusBanner from '@/components/features/RegistrationStatusBanner'
import { checkExistingCompanyRegistration } from '@/lib/companyService';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { RegistrationStatus } from '@/lib/registrationService';

// Define proper types for the company data
interface AuthorizedPerson {
  fullName: string;
  email: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  postalCode: string;
  taxFileNumber: string;
  position: string;
  isDirector: boolean;
  isShareholder: boolean;
  shareholderPercentage: string;
}

interface CompanyData {
  companyName: string;
  companyType: string;
  companyAddress: string;
  address: string;
  postalCode: string;
  taxFileNumber: string;
  authorizedPersons: AuthorizedPerson[];
  agreeToDeclaration: boolean;
  position: string;
  isDirector: boolean;
  isShareholder: boolean;
  shareholderPercentage: string;
}

interface ExistingRegistration {
  companyName?: string;
  status?: RegistrationStatus;
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
  companyType?: string;
  companyAddress?: string;
  address?: string;
  postalCode?: string;
  taxFileNumber?: string;
  authorizedPersons?: AuthorizedPerson[];
  agreeToDeclaration?: boolean;
  position?: string;
  isDirector?: boolean;
  isShareholder?: boolean;
  shareholderPercentage?: string;
}

const CompanyRegistration = () => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [existingRegistration, setExistingRegistration] = useState<ExistingRegistration | null>(null)
  const router = useRouter()
  const { user } = useStore()

  const [companyData, setCompanyData] = useState<CompanyData>({
    companyName: '',
    companyType: 'Proprietary Limited Company',
    companyAddress: '',
    address: '',
    postalCode: '',
    taxFileNumber: '',
    authorizedPersons: [],
    agreeToDeclaration: false,
    position: '',
    isDirector: false,
    isShareholder: false,
    shareholderPercentage: '',
  })

  useEffect(() => {
    const checkRegistration = async () => {
      if (!user?.uid) return

      setLoading(true)
      try {
        const result: any = await checkExistingCompanyRegistration(user.uid)
        if (result.exists && result.data) {
          setExistingRegistration(result.data)

          // Pre-fill form with existing data
          setCompanyData({
            companyName: result.data.companyName || '',
            companyType: result.data.companyType || 'Proprietary Limited Company',
            companyAddress: result.data.companyAddress || '',
            address: result.data.address || '',
            postalCode: result.data.postalCode || '',
            taxFileNumber: result.data.taxFileNumber || '',
            authorizedPersons: result.data.authorizedPersons || [],
            agreeToDeclaration: result.data.agreeToDeclaration || false,
            position: result.data.position || '',
            isDirector: !!result.data.isDirector,
            isShareholder: !!result.data.isShareholder,
            shareholderPercentage: result.data.isShareholder ? (result.data.shareholderPercentage || '') : '',
          })
          
          // Add debugging to verify the data
          console.log('Loaded data:', {
            isDirector: result.data.isDirector,
            isShareholder: result.data.isShareholder,
            shareholderPercentage: result.data.shareholderPercentage
          })
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setCompanyData((prev) => ({
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

    setCompanyData((prev) => ({
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
    setCompanyData((prev) => ({
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
          position: '',
          isDirector: false,
          isShareholder: false,
          shareholderPercentage: ''
        }
      ]
    }))
  }

  const removeAuthorizedPerson = (index: number) => {
    const updatedAuthorizedPersons = companyData.authorizedPersons.filter((_, i) => i !== index)
    setCompanyData((prev) => ({
      ...prev,
      authorizedPersons: updatedAuthorizedPersons
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!companyData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    if (!companyData.companyAddress.trim()) {
      newErrors.companyAddress = 'Company address is required'
    }

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

    if (companyData.isShareholder) {
      if (!companyData.shareholderPercentage) {
        newErrors.shareholderPercentage = 'Shareholder percentage is required'
      } else if (
        isNaN(Number(companyData.shareholderPercentage)) ||
        Number(companyData.shareholderPercentage) < 0 ||
        Number(companyData.shareholderPercentage) > 100
      ) {
        newErrors.shareholderPercentage = 'Percentage must be a number between 0 and 100'
      }
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

      if (!person.taxFileNumber.trim()) {
        newErrors[`authorizedPersons.${index}.taxFileNumber`] = 'Tax file number is required'
      }
      if (!person.isDirector && !person.isShareholder) {
        newErrors[`authorizedPersons.${index}.position`] = 'At least one position must be selected'
      }

      if (!person.dateOfBirth) {
        newErrors[`authorizedPersons.${index}.dateOfBirth`] = 'Date of birth is required'
      }

      if (!person.phone.trim()) {
        newErrors[`authorizedPersons.${index}.phone`] = 'Phone number is required'
      } else if (!/^\d{10}$/.test(person.phone)) {
        newErrors[`authorizedPersons.${index}.phone`] = 'Phone number must be 10 digits'
      }

      if (!person.address.trim()) {
        newErrors[`authorizedPersons.${index}.address`] = 'Address is required'
      }

      if (!person.postalCode.trim()) {
        newErrors[`authorizedPersons.${index}.postalCode`] = 'Postal code is required'
      } else if (!/^\d{4}$/.test(person.postalCode)) {
        newErrors[`authorizedPersons.${index}.postalCode`] = 'Postal code must be 4 digits'
      }

      // Validate shareholder percentage if person is a shareholder
      if (person.isShareholder) {
        if (!person.shareholderPercentage) {
          newErrors[`authorizedPersons.${index}.shareholderPercentage`] = 'Shareholder percentage is required'
        } else if (
          isNaN(Number(person.shareholderPercentage)) ||
          Number(person.shareholderPercentage) < 0 ||
          Number(person.shareholderPercentage) > 100
        ) {
          newErrors[`authorizedPersons.${index}.shareholderPercentage`] = 'Percentage must be a number between 0 and 100'
        }
      }
    })

    console.log(newErrors)

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

    const registrationData = {
      ...companyData,
      userId: user.uid,
      userEmail: user.email || '',
      userName: user.displayName || '',
      status: existingRegistration?.status || 'pending',
      isDirector: companyData.isDirector,
      isShareholder: companyData.isShareholder,
      shareholderPercentage: companyData.isShareholder ? companyData.shareholderPercentage : '',
    };

    const response = await fetch('/api/company-registration-service', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ companyRegistrationData: registrationData }),
    });

    const result = await response.json();

    if (result.success) {
      toast.success('Company registration submitted successfully!')

      const updatedResult = await checkExistingCompanyRegistration(user.uid)
      if (updatedResult.exists && updatedResult.data) {
        setExistingRegistration(updatedResult.data)
      }

      setTimeout(() => {
        router.push('/services')
      }, 2000)
    } else {
      setSubmitting(false)
      toast.error(result.message || 'Failed to submit registration. Please try again.')
    }
  }

  const handleConfirmSubmit = () => {
    // syntheticEvent
    const syntheticEvent = {
      preventDefault: () => { }
    } as React.FormEvent;
    handleSubmit(syntheticEvent);
  };

  if (loading) {
    return (<SkeletonLoader />)
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            {companyData.companyName ? `${companyData.companyName} Registration` : 'Company Name Registration'}
          </h1>
        </div>

        <p className="text-gray-600 text-sm">
          Complete the form below to register your company. All fields marked with * are required.
        </p>
      </motion.div>

      {/* Registration Status Banner */}
      {existingRegistration && (
        <RegistrationStatusBanner
          title={existingRegistration.companyName ? `${existingRegistration.companyName} Registration` : "Company Registration"}
          status={existingRegistration?.status || 'pending'}
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
          {/* Company Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Company Details</h2>
            <div className="space-y-4 mt-4">
              <CustomInput
                label="Company Name"
                type="text"
                name="companyName"
                value={companyData.companyName}
                onChange={handleChange}
                errors={errors.companyName}
                placeholder="Enter your company name"
                disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
              />

              <CustomInput
                label="Company Registered Address"
                type="text"
                name="companyAddress"
                value={companyData.companyAddress}
                onChange={handleChange}
                errors={errors.companyAddress}
                placeholder="Enter your company registered address"
                disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
              />

            </div>
          </div>

          {/* Authorised Person Details */}
          <div>
            <PersonalInformation title="Authorised Person Details" />
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
                name="isDirector"
                checked={companyData.isDirector}
                onChange={(e) => {
                  const checked = (e.target as HTMLInputElement).checked;
                  setCompanyData((prev) => ({ ...prev, isDirector: checked }));
                }}
                disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
              />
              <CustomCheckbox
                label="Shareholder"
                name="isShareholder"
                checked={companyData.isShareholder}
                onChange={(e) => {
                  const checked = (e.target as HTMLInputElement).checked;
                  setCompanyData((prev) => ({ ...prev, isShareholder: checked }));
                }}
                disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
              />

              {companyData.isShareholder && (
                <div className="mt-3 pl-6">
                  <CustomInput
                    label="Shareholder Percentage (%)"
                    name="shareholderPercentage"
                    type="number"
                    value={companyData.shareholderPercentage || ''}
                    onChange={(e) => {
                      setCompanyData((prev) => ({
                        ...prev,
                        shareholderPercentage: e.target.value
                      }));
                    }}
                    placeholder="Enter your share percentage"
                    errors={errors.shareholderPercentage}
                    disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                    maxLength={3}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Authorized Persons Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center text-xs mr-2">
                <UserGroupIcon className="w-4 h-4" />
              </span>
              Authorised Company Person Details
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              Add details of individuals who are authorized to act on behalf of the company.
            </p>

            {companyData.authorizedPersons && companyData.authorizedPersons.length > 0 ? (
              <div className="space-y-4 mb-4">
                {companyData.authorizedPersons.map((person: any, index: any) => (
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
                              onChange={(e: any) => handlePersonChange(e, index)}
                              errors={errors[`authorizedPersons.${index}.fullName`]}
                              placeholder="Enter full name"
                              disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                            />

                            <CustomInput
                              label="Email"
                              type="email"
                              name="email"
                              value={person.email}
                              onChange={(e: any) => handlePersonChange(e, index)}
                              errors={errors[`authorizedPersons.${index}.email`]}
                              placeholder="Enter email address"
                              disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                            />

                            <CustomInput
                              label="Date of Birth"
                              type="date"
                              name="dateOfBirth"
                              value={person.dateOfBirth}
                              onChange={(e: any) => handlePersonChange(e, index)}
                              errors={errors[`authorizedPersons.${index}.dateOfBirth`]}
                              disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                            />

                            <CustomInput
                              label="Phone Number"
                              type="tel"
                              name="phone"
                              value={person.phone}
                              onChange={(e: any) => handlePersonChange(e, index)}
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
                                onChange={(e: any) => handlePersonChange(e, index)}
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
                              onChange={(e: any) => handlePersonChange(e, index)}
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
                              onChange={(e: any) => handlePersonChange(e, index)}
                              errors={errors[`authorizedPersons.${index}.taxFileNumber`]}
                              placeholder="Enter TFN"
                              disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                            />

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Position in Company
                              </label>
                              <div className="space-y-2">
                                <CustomCheckbox
                                  label="Director"
                                  name={`authorizedPersons.${index}.isDirector`}
                                  checked={person.isDirector}
                                  onChange={() => {
                                    const updatedPersons = [...companyData.authorizedPersons];
                                    updatedPersons[index] = {
                                      ...updatedPersons[index],
                                      isDirector: !updatedPersons[index].isDirector
                                    };
                                    setCompanyData((prev) => ({
                                      ...prev,
                                      authorizedPersons: updatedPersons
                                    }));
                                    
                                    // Clear error if it exists
                                    if (errors[`authorizedPersons.${index}.position`]) {
                                      setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors[`authorizedPersons.${index}.position`];
                                        return newErrors;
                                      });
                                    }
                                  }}
                                  disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                                />
                                <CustomCheckbox
                                  label="Shareholder"
                                  name={`authorizedPersons.${index}.isShareholder`}
                                  checked={person.isShareholder}
                                  onChange={() => {
                                    const updatedPersons = [...companyData.authorizedPersons];
                                    updatedPersons[index] = {
                                      ...updatedPersons[index],
                                      isShareholder: !updatedPersons[index].isShareholder
                                    };
                                    setCompanyData((prev) => ({
                                      ...prev,
                                      authorizedPersons: updatedPersons
                                    }));
                                    
                                    // Clear error if it exists
                                    if (errors[`authorizedPersons.${index}.position`]) {
                                      setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors[`authorizedPersons.${index}.position`];
                                        return newErrors;
                                      });
                                    }
                                  }}
                                  disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                                />

                                {person.isShareholder && (
                                  <div className="mt-3 pl-6">
                                    <CustomInput
                                      label="Shareholder Percentage (%)"
                                      name={`authorizedPersons.${index}.shareholderPercentage`}
                                      type="number"
                                      value={person.shareholderPercentage || ''}
                                      onChange={(e) => {
                                        const updatedPersons = [...companyData.authorizedPersons];
                                        updatedPersons[index] = {
                                          ...updatedPersons[index],
                                          shareholderPercentage: e.target.value
                                        };
                                        setCompanyData((prev) => ({
                                          ...prev,
                                          authorizedPersons: updatedPersons
                                        }));
                                      }}
                                      placeholder="Enter share percentage"
                                      errors={errors[`authorizedPersons.${index}.shareholderPercentage`]}
                                      disabled={existingRegistration?.status === 'completed' || existingRegistration?.status === 'in-progress'}
                                      maxLength={3}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
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

            {companyData.authorizedPersons && companyData.authorizedPersons.length > 0 && existingRegistration?.status !== 'completed' && existingRegistration?.status !== 'in-progress' && (
              <div className="flex justify-end">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  type="button"
                  onClick={addAuthorizedPerson}
                  className="w-1/3 flex items-center justify-center px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Authorized Person
                </motion.button>
              </div>
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
              status={existingRegistration?.status}
              defaultText="Submit Registration"
              pendingText="Update Registration"
              processingText="Submitting..."
              rejectedText="Resubmit Registration"
              completedText="Already Submitted"
              validateForm={validateForm}
              onConfirm={handleConfirmSubmit}
            />
          )}
        </div>
      </motion.form>
    </div>
  )
}

export default CompanyRegistration