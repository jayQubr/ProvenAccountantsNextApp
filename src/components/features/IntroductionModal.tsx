'use client'

import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import CustomInput from '../ui/CustomInput'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { UserIcon, UploadIcon, Mail, Calendar, MapPin, Hash } from 'lucide-react'
import { BuildingOffice2Icon } from '@heroicons/react/24/solid'
import CustomCheckbox from '../ui/CustomCheckbox'

type FormData = {
    firstName: string
    lastName: string
    email: string
    taxFileNumber: string
    mobileNumber: string
    companyMobileNumber: string
    dateOfBirth: string
    postalAddress: string
    postalCode: string
    otherDetails: string
    ABN: string
    declaration: boolean
    idDocuments: File[] | null
    otherDocuments: File[] | null
    accountantLocation: string
    companyName: string
    acn: string
    registeredAddress: string
    city: string
    previousAccountantName: string
    previousAccountantEmail: string
    previousAccountantPhone: string
    companyEmail: string
    companyDateOfBirth: string
    accountType: 'individual' | 'organization'
}

interface IntroductionModalProps {
    isOpen?: boolean;
    setIsOpen?: (isOpen: boolean) => void;
    userData?: any;
    setIsIntroductionModalOpen?: any;
}

const IntroductionModal = ({ isOpen = false, setIsOpen, userData, setIsIntroductionModalOpen }: IntroductionModalProps) => {
    const [activeTab, setActiveTab] = useState('individual');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<FormData>({
        firstName: userData?.displayName?.split(' ')[0] || '',
        lastName: userData?.displayName?.split(' ').slice(1).join(' ') || '',
        email: userData?.email || '',
        taxFileNumber: '',
        mobileNumber: userData?.phone || '',
        companyMobileNumber: '',
        dateOfBirth: '',
        postalAddress: userData?.address || '',
        postalCode: userData?.postalCode || '',
        ABN: '',
        otherDetails: '',
        declaration: false,
        idDocuments: null,
        otherDocuments: null,
        accountantLocation: 'runcorn',
        companyName: '',
        companyEmail: '',
        acn: '',
        registeredAddress: '',
        city: '',
        companyDateOfBirth: '',
        previousAccountantName: '',
        previousAccountantEmail: '',
        previousAccountantPhone: '',
        accountType: 'individual'
    })
    // const [open, setOpen] = useState(isOpen)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        // Pre-fill form with user data if available
        if (userData) {
            setFormData(prev => ({
                ...prev,
                firstName: userData.displayName?.split(' ')[0] || prev.firstName,
                lastName: userData.displayName?.split(' ').slice(1).join(' ') || prev.lastName,
                email: userData.email || prev.email,
                mobileNumber: userData.phone || prev.mobileNumber,
                postalAddress: userData.address || prev.postalAddress,
                postalCode: userData.postalCode || prev.postalCode
            }))
        }
    }, [userData])

    useEffect(() => {
        setFormData((prev: any) => ({
            ...prev,
            accountType: activeTab
        }));
    }, [activeTab]);

    const handleOpenChange = (newOpen: boolean) => {
        // setOpen(newOpen);
        if (setIsOpen) {
            setIsOpen(newOpen);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target

        if (type === 'checkbox') {
            const target = e.target as HTMLInputElement
            setFormData({
                ...formData,
                [name]: target.checked
            })
        } else {
            setFormData({
                ...formData,
                [name]: value
            })
        }

        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    const handlePhoneChange = (value: string | undefined, fieldName: string = 'mobileNumber') => {
        setFormData(prev => ({ ...prev, [fieldName]: value || '' }))

        // Clear error when field is edited
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[fieldName]
                return newErrors
            })
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const files = e.target.files
        if (files && files.length > 0) {
            // Check file sizes
            const maxSize = 5 * 1024 * 1024; // 5MB limit per file
            const oversizedFiles = Array.from(files).filter(file => file.size > maxSize);
            
            if (oversizedFiles.length > 0) {
                setErrors(prev => ({
                    ...prev,
                    [fieldName]: 'One or more files exceed the 5MB size limit'
                }));
                return;
            }

            // Convert FileList to array
            const fileArray = Array.from(files);

            setFormData({
                ...formData,
                [fieldName]: fileArray
            })

            // Clear error when file is uploaded
            if (errors[fieldName]) {
                setErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors[fieldName]
                    return newErrors
                })
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validationForm()) return;
        setIsSubmitting(true);

        try {
            const formDataObj = new FormData();

            // Check total file size before submitting
            let totalFileSize = 0;
            if (formData.idDocuments) {
                formData.idDocuments.forEach((file: File) => {
                    totalFileSize += file.size;
                });
            }
            if (formData.otherDocuments) {
                formData.otherDocuments.forEach((file: File) => {
                    totalFileSize += file.size;
                });
            }

            // 20MB total file size limit
            if (totalFileSize > 20 * 1024 * 1024) {
                toast.error('Total file size exceeds 20MB limit');
                setErrors(prev => ({
                    ...prev,
                    form: 'Total file size exceeds 20MB limit'
                }));
                setIsSubmitting(false);
                return;
            }

            // Common fields for both forms
            const commonFields = {
                uid: userData?.uid || '', // Ensure uid is not undefined
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                mobileNumber: formData.mobileNumber,
                dateOfBirth: formData.dateOfBirth,
                postalAddress: formData.postalAddress,
                postalCode: formData.postalCode,
                accountantLocation: formData.accountantLocation,
                declaration: formData.declaration,
                accountType: activeTab
            };
            
            // Add form type specific fields
            const userInfo = activeTab === 'individual' 
                ? {
                    ...commonFields,
                    taxFileNumber: formData.taxFileNumber,
                    otherDetails: formData.otherDetails || ''
                }
                : {
                    ...commonFields,
                    companyName: formData.companyName,
                    companyEmail: formData.companyEmail,
                    companyMobileNumber: formData.companyMobileNumber,
                    companyDateOfBirth: formData.companyDateOfBirth,
                    ABN: formData.ABN,
                    acn: formData.acn,
                    registeredAddress: formData.registeredAddress,
                    city: formData.city,
                    previousAccountantName: formData.previousAccountantName || '',
                    previousAccountantEmail: formData.previousAccountantEmail || '',
                    previousAccountantPhone: formData.previousAccountantPhone || ''
                };
            formDataObj.append('userData', JSON.stringify(userInfo));

            // Add documents with size validation
            const addFilesToFormData = (files: File[], fieldName: string) => {
                files.forEach(file => {
                    if (file.size > 5 * 1024 * 1024) {
                        throw new Error(`File ${file.name} exceeds 5MB size limit`);
                    }
                    formDataObj.append(fieldName, file);
                });
            };

            try {
                if (formData.idDocuments) {
                    addFilesToFormData(formData.idDocuments, 'idDocuments');
                }
                if (formData.otherDocuments) {
                    addFilesToFormData(formData.otherDocuments, 'otherDocuments');
                }
            } catch (error: any) {
                toast.error(error.message);
                setErrors(prev => ({
                    ...prev,
                    form: error.message
                }));
                setIsSubmitting(false);
                return;
            }

            // Submit the form
            const response = await fetch('/api/user-info', {
                method: 'POST',
                body: formDataObj,
            });

            if (!response.ok) {
                const errorData = await response.text();
                let errorMessage = 'Registration failed';
                try {
                    const jsonError = JSON.parse(errorData);
                    errorMessage = jsonError.message || errorMessage;
                } catch {
                    // If the error isn't JSON, use the text directly
                    errorMessage = errorData.includes('<!DOCTYPE') 
                        ? 'File size limit exceeded. Please ensure each file is under 5MB and total size is under 20MB.'
                        : errorData;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();

            if (result.success) {
                toast.success('Registration successful!');
                handleOpenChange(false);
                setIsIntroductionModalOpen(false);
                setFormData({
                    ...formData,
                    firstName: '',
                    lastName: '',
                    email: '',
                    mobileNumber: '',
                    dateOfBirth: '',
                    postalAddress: '',
                    postalCode: '',
                    taxFileNumber: '',
                    otherDetails: '',
                    declaration: false,
                    idDocuments: null,
                    otherDocuments: null,
                    accountantLocation: 'runcorn',
                    companyName: '',
                    companyEmail: '',
                });
            } else {
                throw new Error(result.message || 'Registration failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred. Please try again.');
            console.error('Error submitting form:', error);
            setErrors(prev => ({
                ...prev,
                form: error.message || 'An error occurred. Please try again.'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const validationForm = () => {
        const newErrors: Record<string, string> = {};

        // Common validations for both forms
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First Name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Invalid email address';
            }
        }

        if (!formData.mobileNumber) {
            newErrors.mobileNumber = 'Mobile Number is required';
        } else if (!isValidPhoneNumber(formData.mobileNumber)) {
            newErrors.mobileNumber = 'Please enter a valid Australian phone number';
        }

        if (!formData.dateOfBirth.trim()) {
            newErrors.dateOfBirth = 'Date of Birth is required';
        }

        if (!formData.postalAddress.trim()) {
            newErrors.postalAddress = 'Postal Address is required';
        }

        if (!formData.postalCode.trim()) {
            newErrors.postalCode = 'Postal Code is required';
        } else if (!/^\d{4}$/.test(formData.postalCode)) {
            newErrors.postalCode = 'Postal Code must be 4 digits';
        }

        if (!formData.declaration) {
            newErrors.declaration = 'You must agree to the declaration';
        }

        // Individual form specific validations
        if (activeTab === 'individual') {
            if (!formData.taxFileNumber.trim()) {
                newErrors.taxFileNumber = 'Tax File Number is required';
            } else if (!/^\d{9}$/.test(formData.taxFileNumber)) {
                newErrors.taxFileNumber = 'Tax File Number must be 9 digits';
            }

            if (!formData.idDocuments) {
                newErrors.idDocuments = 'ID document is required';
            }
        }

        // Organization form specific validations
        if (activeTab === 'organization') {
            if (!formData.companyName.trim()) {
                newErrors.companyName = 'Company name is required';
            }
            if (!formData.companyEmail.trim()) {
                newErrors.companyEmail = 'Company email is required';
            } else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.companyEmail)) {
                    newErrors.companyEmail = 'Invalid company email address';
                }
            }
            if (!formData.ABN.trim()) {
                newErrors.ABN = 'Australian Business Number is required';
            } else if (!/^\d{11}$/.test(formData.ABN.replace(/\s/g, ''))) {
                newErrors.ABN = 'ABN must be 11 digits';
            }
            if (!formData.acn.trim()) {
                newErrors.acn = 'ACN is required';
            } else if (!/^\d{9}$/.test(formData.acn.replace(/\s/g, ''))) {
                newErrors.acn = 'ACN must be 9 digits';
            }
            if (!formData.registeredAddress.trim()) {
                newErrors.registeredAddress = 'Registered address is required';
            }
            if (!formData.companyMobileNumber.trim()) {
                newErrors.companyMobileNumber = 'Company mobile number is required';
            } else if (!isValidPhoneNumber(formData.companyMobileNumber)) {
                newErrors.companyMobileNumber = 'Please enter a valid Australian phone number';
            }
            if (!formData.companyDateOfBirth.trim()) {
                newErrors.companyDateOfBirth = 'Company establishment date is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    return (
        <Modal open={isOpen} handleOpenChange={handleOpenChange}>
            <div className="flex flex-col space-y-6 mt-6">
                {/* Account Type Selection - Modern Tabs */}
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Select Account Type</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, accountType: 'individual' })}
                            className={`flex-1 relative overflow-hidden rounded-xl border-2 transition-all duration-200 p-4 ${
                                formData.accountType === 'individual'
                                    ? 'border-sky-500 bg-sky-50'
                                    : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                        >
                            <div className="flex flex-col items-center">
                                <div className={`rounded-full p-3 mb-3 ${
                                    formData.accountType === 'individual' 
                                        ? 'bg-sky-100' 
                                        : 'bg-gray-100'
                                }`}>
                                    <UserIcon className={`h-6 w-6 ${
                                        formData.accountType === 'individual' 
                                            ? 'text-sky-600' 
                                            : 'text-gray-500'
                                    }`} />
                                </div>
                                <span className={`font-medium ${
                                    formData.accountType === 'individual' 
                                        ? 'text-sky-700' 
                                        : 'text-gray-700'
                                }`}>Individual</span>
                                <p className="text-xs text-gray-500 mt-1">Personal tax & finances</p>
                            </div>
                            {formData.accountType === 'individual' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute top-2 right-2"
                                >
                                    <div className="bg-sky-500 text-white rounded-full p-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </motion.div>
                            )}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, accountType: 'organization' })}
                            className={`flex-1 relative overflow-hidden rounded-xl border-2 transition-all duration-200 p-4 ${
                                formData.accountType === 'organization'
                                    ? 'border-sky-500 bg-sky-50'
                                    : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                        >
                            <div className="flex flex-col items-center">
                                <div className={`rounded-full p-3 mb-3 ${
                                    formData.accountType === 'organization' 
                                        ? 'bg-sky-100' 
                                        : 'bg-gray-100'
                                }`}>
                                    <BuildingOffice2Icon className={`h-6 w-6 ${
                                        formData.accountType === 'organization' 
                                            ? 'text-sky-600' 
                                            : 'text-gray-500'
                                    }`} />
                                </div>
                                <span className={`font-medium ${
                                    formData.accountType === 'organization' 
                                        ? 'text-sky-700' 
                                        : 'text-gray-700'
                                }`}>Organization</span>
                                <p className="text-xs text-gray-500 mt-1">Business & company accounts</p>
                            </div>
                            {formData.accountType === 'organization' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute top-2 right-2"
                                >
                                    <div className="bg-sky-500 text-white rounded-full p-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </motion.div>
                            )}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Form Fields - Improved Layout with CustomInput */}
                    {formData.accountType === 'individual' && (
                        <div className="bg-white rounded-lg">
                            <div className="border-b border-gray-200 pb-3 mb-4">
                                <h3 className="text-lg font-medium text-gray-800">Personal Information</h3>
                                <p className="text-sm text-gray-500 mt-1">Please provide your personal details</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <CustomInput
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    errors={errors.firstName || ''}
                                    placeholder="Enter your first name"
                                    required={true}
                                />
                                
                                <CustomInput
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    errors={errors.lastName || ''}
                                    placeholder="Enter your last name"
                                    required={true}
                                />
                                
                                <CustomInput
                                    label="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    errors={errors.email || ''}
                                    placeholder="Enter your email"
                                    type="email"
                                    icon={<Mail className="h-5 w-5 text-gray-400" />}
                                    required={true}
                                />
                                
                                <div className="relative w-full">
                                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                        Mobile Number <span className="text-red-500">*</span>
                                    </label>
                                    <PhoneInput
                                        international
                                        defaultCountry="AU"
                                        id="mobileNumber"
                                        value={formData.mobileNumber}
                                        onChange={(value) => handlePhoneChange(value)}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.mobileNumber ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors`}
                                    />
                                    {errors.mobileNumber && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="mt-1 text-sm text-red-600"
                                        >
                                            {errors.mobileNumber}
                                        </motion.p>
                                    )}
                                </div>
                                
                                <CustomInput
                                    label="Date of Birth"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    errors={errors.dateOfBirth || ''}
                                    type="date"
                                    icon={<Calendar className="h-5 w-5 text-gray-400" />}
                                    required={true}
                                />
                                
                                <CustomInput
                                    label="Tax File Number"
                                    name="taxFileNumber"
                                    value={formData.taxFileNumber}
                                    onChange={handleChange}
                                    errors={errors.taxFileNumber || ''}
                                    placeholder="Enter your TFN"
                                    maxLength={9}
                                    icon={<Hash className="h-5 w-5 text-gray-400" />}
                                    required={true}
                                />
                                
                                <div className="md:col-span-2">
                                    <CustomInput
                                        label="Postal Address"
                                        name="postalAddress"
                                        value={formData.postalAddress}
                                        onChange={handleChange}
                                        errors={errors.postalAddress || ''}
                                        placeholder="Enter your postal address"
                                        icon={<MapPin className="h-5 w-5 text-gray-400" />}
                                        required={true}
                                    />
                                </div>
                                
                                <CustomInput
                                    label="Postal Code"
                                    name="postalCode"
                                    type="number"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    errors={errors.postalCode || ''}
                                    placeholder="Enter postal code"
                                    maxLength={4}
                                    required={true}
                                />
                                
                                <div className="md:col-span-2">
                                    <CustomInput
                                        label="Other Details"
                                        name="otherDetails"
                                        value={formData.otherDetails}
                                        onChange={handleChange}
                                        errors={errors.otherDetails || ''}
                                        placeholder="Any additional information"
                                        type="textarea"
                                        required={false}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Organization Form with CustomInput */}
                    {formData.accountType === 'organization' && (
                        <div className="bg-white rounded-lg">
                            <div className="border-b border-gray-200 pb-3 mb-4">
                                <h3 className="text-lg font-medium text-gray-800">Organization Information</h3>
                                <p className="text-sm text-gray-500 mt-1">Please provide your organization details</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="md:col-span-2">
                                    <CustomInput
                                        label="Company/Organization Name"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        errors={errors.companyName || ''}
                                        placeholder="Enter company name"
                                        icon={<BuildingOffice2Icon className="h-5 w-5 text-gray-400" />}
                                        required={true}
                                    />
                                </div>
                                
                                <CustomInput
                                    label="Company Email"
                                    name="companyEmail"
                                    value={formData.companyEmail}
                                    onChange={handleChange}
                                    errors={errors.companyEmail || ''}
                                    placeholder="Enter company email"
                                    type="email"
                                    icon={<Mail className="h-5 w-5 text-gray-400" />}
                                    required={true}
                                />
                                
                                <div className="relative w-full">
                                    <label htmlFor="companyMobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                        Company Phone <span className="text-red-500">*</span>
                                    </label>
                                    <PhoneInput
                                        international
                                        defaultCountry="AU"
                                        id="companyMobileNumber"
                                        value={formData.companyMobileNumber}
                                        onChange={(value) => handlePhoneChange(value, 'companyMobileNumber')}
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.companyMobileNumber ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors`}
                                    />
                                    {errors.companyMobileNumber && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="mt-1 text-sm text-red-600"
                                        >
                                            {errors.companyMobileNumber}
                                        </motion.p>
                                    )}
                                </div>
                                
                                <CustomInput
                                    label="Australian Business Number (ABN)"
                                    name="ABN"
                                    value={formData.ABN}
                                    onChange={handleChange}
                                    errors={errors.ABN || ''}
                                    placeholder="Enter ABN"
                                    maxLength={11}
                                    required={true}
                                />
                                
                                <CustomInput
                                    label="Australian Company Number (ACN)"
                                    name="acn"
                                    value={formData.acn}
                                    onChange={handleChange}
                                    errors={errors.acn || ''}
                                    placeholder="Enter ACN"
                                    maxLength={9}
                                    required={true}
                                />
                                
                                <CustomInput
                                    label="Establishment Date"
                                    name="companyDateOfBirth"
                                    value={formData.companyDateOfBirth}
                                    onChange={handleChange}
                                    errors={errors.companyDateOfBirth || ''}
                                    type="date"
                                    icon={<Calendar className="h-5 w-5 text-gray-400" />}
                                    required={true}
                                />
                                
                                <div className="md:col-span-2">
                                    <CustomInput
                                        label="Registered Address"
                                        name="registeredAddress"
                                        value={formData.registeredAddress}
                                        onChange={handleChange}
                                        errors={errors.registeredAddress || ''}
                                        placeholder="Enter registered address"
                                        icon={<MapPin className="h-5 w-5 text-gray-400" />}
                                        required={true}
                                    />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <CustomInput
                                        label="Postal Address"
                                        name="postalAddress"
                                        value={formData.postalAddress}
                                        onChange={handleChange}
                                        errors={errors.postalAddress || ''}
                                        placeholder="Enter postal address"
                                        icon={<MapPin className="h-5 w-5 text-gray-400" />}
                                        required={true}
                                    />
                                </div>
                                
                                <CustomInput
                                    label="Postal Code"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    errors={errors.postalCode || ''}
                                    placeholder="Enter postal code"
                                    maxLength={4}
                                    required={true}
                                />
                                
                                <CustomInput
                                    label="City"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    errors={errors.city || ''}
                                    placeholder="Enter city"
                                    required={true}
                                />
                            </div>
                            
                            {/* Previous Accountant Section */}
                            <div className="mt-6 border-t border-gray-200 pt-4">
                                <h4 className="text-md font-medium text-gray-800 mb-3">Previous Accountant (Optional)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    <CustomInput
                                        label="Name"
                                        name="previousAccountantName"
                                        value={formData.previousAccountantName}
                                        onChange={handleChange}
                                        errors={errors.previousAccountantName || ''}
                                        placeholder="Enter previous accountant's name"
                                        required={false}
                                    />
                                    <CustomInput
                                        label="Email"
                                        name="previousAccountantEmail"
                                        value={formData.previousAccountantEmail}
                                        onChange={handleChange}
                                        errors={errors.previousAccountantEmail || ''}
                                        placeholder="Enter previous accountant's email"
                                        type="email"
                                        required={false}
                                    />
                                    <div className="relative w-full">
                                        <label htmlFor="previousAccountantPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone
                                        </label>
                                        <PhoneInput
                                            international
                                            defaultCountry="AU"
                                            id="previousAccountantPhone"
                                            value={formData.previousAccountantPhone}
                                            onChange={(value) => handlePhoneChange(value, 'previousAccountantPhone')}
                                            className={`w-full px-4 py-3 rounded-lg border ${errors.previousAccountantPhone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors`}
                                        />
                                        {errors.previousAccountantPhone && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="mt-1 text-sm text-red-600"
                                            >
                                                {errors.previousAccountantPhone}
                                            </motion.p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* ID Documents Upload Section */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">ID Documents</h3>
                        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            errors.idDocuments 
                                ? 'border-red-300 bg-red-50' 
                                : formData.idDocuments && formData.idDocuments.length > 0
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-gray-300 hover:border-sky-500 hover:bg-sky-50'
                        }`}>
                            <input
                                type="file"
                                id="idDocuments"
                                name="idDocuments"
                                onChange={(e) => handleFileChange(e, 'idDocuments')}
                                className="hidden"
                                multiple
                            />
                            <label htmlFor="idDocuments" className="cursor-pointer">
                                <UploadIcon className={`h-8 w-8 mx-auto mb-2 ${
                                    errors.idDocuments 
                                        ? 'text-red-400' 
                                        : formData.idDocuments && formData.idDocuments.length > 0
                                            ? 'text-green-500'
                                            : 'text-gray-400'
                                }`} />
                                <p className="text-sm text-gray-600 font-medium">
                                    {formData.idDocuments && formData.idDocuments.length > 0
                                        ? `${formData.idDocuments.length} file(s) selected`
                                        : 'Upload ID Documents'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Drag & drop files or <span className="text-sky-500">browse</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Supported formats: PDF, JPG, PNG (Max: 5MB per file)
                                </p>
                            </label>
                            {formData.idDocuments && formData.idDocuments.length > 0 && (
                                <div className="mt-3 text-left">
                                    <ul className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                                        {Array.from(formData.idDocuments).map((file, index) => (
                                            <li key={index} className="truncate py-1 border-b border-gray-100 last:border-0">
                                                {file.name} <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {errors.idDocuments && (
                                <p className="mt-2 text-xs text-red-600">{errors.idDocuments}</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Other Documents Upload Section */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Other Documents (Optional)</h3>
                        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            errors.otherDocuments 
                                ? 'border-red-300 bg-red-50' 
                                : formData.otherDocuments && formData.otherDocuments.length > 0
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-gray-300 hover:border-sky-500 hover:bg-sky-50'
                        }`}>
                            <input
                                type="file"
                                id="otherDocuments"
                                name="otherDocuments"
                                onChange={(e) => handleFileChange(e, 'otherDocuments')}
                                className="hidden"
                                multiple
                            />
                            <label htmlFor="otherDocuments" className="cursor-pointer">
                                <UploadIcon className={`h-8 w-8 mx-auto mb-2 ${
                                    errors.otherDocuments 
                                        ? 'text-red-400' 
                                        : formData.otherDocuments && formData.otherDocuments.length > 0
                                            ? 'text-green-500'
                                            : 'text-gray-400'
                                }`} />
                                <p className="text-sm text-gray-600 font-medium">
                                    {formData.otherDocuments && formData.otherDocuments.length > 0
                                        ? `${formData.otherDocuments.length} file(s) selected`
                                        : 'Upload Other Documents'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Drag & drop files or <span className="text-sky-500">browse</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Supported formats: PDF, JPG, PNG (Max: 5MB per file)
                                </p>
                            </label>
                            {formData.otherDocuments && formData.otherDocuments.length > 0 && (
                                <div className="mt-3 text-left">
                                    <ul className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                                        {Array.from(formData.otherDocuments).map((file, index) => (
                                            <li key={index} className="truncate py-1 border-b border-gray-100 last:border-0">
                                                {file.name} <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {errors.otherDocuments && (
                                <p className="mt-2 text-xs text-red-600">{errors.otherDocuments}</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Declaration Section - Improved */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="">
                            <CustomCheckbox
                                label="Declaration"
                                name="declaration"
                                checked={formData.declaration}
                                onChange={(e) => {
                                    setErrors({...errors, declaration: ''})
                                    setFormData({...formData, declaration: e.target.checked})
                                }}
                            />
            
                            <div className="ml-3">
                                <p className="text-sm text-gray-500 mt-1">
                                    I confirm that all information provided is accurate and complete. I understand that providing false information may result in rejection of my application.
                                </p>
                                {errors.declaration && (
                                    <p className="mt-1 text-sm text-red-600">{errors.declaration}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Form Error Message */}
                    {errors.form && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <motion.p 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-sm"
                            >
                                {errors.form}
                            </motion.p>
                        </div>
                    )}
                    
                    {/* Submit Button */}
                    <div className="mt-6 flex justify-end">
                    <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            type="submit"
                            disabled={isSubmitting}
                            className={`inline-flex items-center rounded-md border border-transparent ${isSubmitting ? 'bg-sky-400' : 'bg-sky-600 hover:bg-sky-700'} px-4 py-2.5 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : 'Register'}
                        </motion.button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default IntroductionModal;