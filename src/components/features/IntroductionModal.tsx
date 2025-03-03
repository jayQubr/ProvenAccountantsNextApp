'use client'

import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import * as Form from '@radix-ui/react-form'
import Modal from '../ui/Modal'
import CustomInput from '../ui/CustomInput'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { motion } from 'framer-motion'
import { toast, Toaster } from 'sonner'

type FormData = {
    firstName: string
    lastName: string
    email: string
    taxFileNumber: string
    mobileNumber: string
    dateOfBirth: string
    postalAddress: string
    postalCode: string
    otherDetails: string
    ABN: string
    declaration: boolean
    idDocuments: File[] | null
    otherDocuments: File[] | null
    accountantLocation: string
}

interface IntroductionModalProps {
    isOpen?: boolean;
    setIsOpen?: (isOpen: boolean) => void;
    userData?: any
}

const IntroductionModal = ({ isOpen = false, setIsOpen, userData }: IntroductionModalProps) => {
    const [activeTab, setActiveTab] = useState('individual');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<FormData>({
        firstName: userData?.displayName?.split(' ')[0] || '',
        lastName: userData?.displayName?.split(' ').slice(1).join(' ') || '',
        email: userData?.email || '',
        taxFileNumber: '',
        mobileNumber: userData?.phone || '',
        dateOfBirth: '',
        postalAddress: userData?.address || '',
        postalCode: userData?.postalCode || '',
        ABN: '',
        otherDetails: '',
        declaration: false,
        idDocuments: null,
        otherDocuments: null,
        accountantLocation: 'runcorn'
    })
    const [open, setOpen] = useState(isOpen)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen !== undefined) {
            setOpen(isOpen);
        }
    }, [isOpen]);

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

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
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

    const handlePhoneChange = (value: string | undefined) => {
        setFormData(prev => ({ ...prev, mobileNumber: value || '' }))
        
        // Clear error when field is edited
        if (errors.mobileNumber) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors.mobileNumber
                return newErrors
            })
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const files = e.target.files
        if (files && files.length > 0) {
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

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validationForm()) return;
        setIsSubmitting(true);
        
        try {
            // Create form data to handle file uploads
            const formDataObj = new FormData();
            
            // Add user data as JSON string with ALL required fields
            const userInfo = {
                uid: userData.uid, // Make sure this is coming from your auth context
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                mobileNumber: formData.mobileNumber,
                dateOfBirth: formData.dateOfBirth || '',
                postalAddress: formData.postalAddress || '',
                postalCode: formData.postalCode || '',
                taxFileNumber: formData.taxFileNumber || '',
                ABN: formData.ABN || '',
                otherDetails: formData.otherDetails || '',
                accountantLocation: formData.accountantLocation || 'runcorn',
                declaration: formData.declaration || false
            };
            
            formDataObj.append('userData', JSON.stringify(userInfo));
            
            // Add ID documents (can be multiple)
            if (formData.idDocuments) {
                if (Array.isArray(formData.idDocuments)) {
                    formData.idDocuments.forEach(file => {
                        formDataObj.append('idDocuments', file);
                    });
                } else {
                    formDataObj.append('idDocuments', formData.idDocuments);
                }
            }
            
            // Add other documents (can be multiple)
            if (formData.otherDocuments) {
                if (Array.isArray(formData.otherDocuments)) {
                    formData.otherDocuments.forEach(file => {
                        formDataObj.append('otherDocuments', file);
                    });
                } else {
                    formDataObj.append('otherDocuments', formData.otherDocuments);
                }
            }
            // Submit the form
            const response = await fetch('/api/user-info', {
                method: 'POST',
                body: formDataObj,
            });
            
            const result = await response.json();
            
            if (result.success) {
                toast.success('Registration successful!');
                handleOpenChange(false);
            } else {
                toast.error('Registration failed');
                console.error('Registration failed:', result.message);
                setErrors(prev => ({
                    ...prev,
                    form: `Registration failed: ${result.message}`
                }));
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
            console.error('Error submitting form:', error);
            setErrors(prev => ({
                ...prev,
                form: 'An error occurred. Please try again.'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const validationForm = () => {
        const newErrors: Record<string, string> = {};

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

        if (!formData.taxFileNumber.trim()) {
            newErrors.taxFileNumber = 'Tax File Number is required';
        } else if (!/^\d{9}$/.test(formData.taxFileNumber)) {
            newErrors.taxFileNumber = 'Tax File Number must be 9 digits';
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

        if (activeTab === 'organization' && !formData.ABN.trim()) {
            newErrors.ABN = 'Australian Business Number is required';
        }
        
        if (!formData.idDocuments) {
            newErrors.idDocuments = 'ID document is required';
        }
        
        if (!formData.declaration) {
            newErrors.declaration = 'You must agree to the declaration';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    return (
        <Modal open={open} handleOpenChange={handleOpenChange} >
           
            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="mt-8">
                <Tabs.List className="flex space-x-1 rounded-lg bg-gray-50 p-1" aria-label="Introduction type">
                    <Tabs.Trigger
                        value="individual"
                        className={`flex-1 rounded-md py-3 text-sm font-medium leading-none transition-all ${activeTab === 'individual' ? 'bg-white text-sky-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
                            } focus:outline-none focus-visible:ring focus-visible:ring-sky-500 focus-visible:ring-opacity-75`}
                    >
                        Individual
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="organization"
                        className={`flex-1 rounded-md py-3 text-sm font-medium leading-none transition-all ${activeTab === 'organization' ? 'bg-white text-sky-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
                            } focus:outline-none focus-visible:ring focus-visible:ring-sky-500 focus-visible:ring-opacity-75`}
                    >
                        Organization
                    </Tabs.Trigger>
                </Tabs.List>

                <Form.Root className="mt-8" onSubmit={handleSubmit}>
                    <Tabs.Content value="individual" className="focus:outline-none">
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">Individual Details</h3>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                                <CustomInput 
                                    name="firstName" 
                                    label="First Name" 
                                    type="text" 
                                    placeholder="John" 
                                    value={formData.firstName} 
                                    errors={errors.firstName || ''} 
                                    onChange={handleChange} 
                                />
                                <CustomInput 
                                    name="lastName" 
                                    label="Last Name" 
                                    type="text" 
                                    placeholder="Doe" 
                                    value={formData.lastName} 
                                    errors={errors.lastName || ''} 
                                    onChange={handleChange} 
                                />
                                <CustomInput 
                                    name="email" 
                                    label="Email" 
                                    type="email" 
                                    placeholder="john@example.com" 
                                    value={formData.email} 
                                    errors={errors.email || ''} 
                                    onChange={handleChange} 
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
                                        onChange={handlePhoneChange}
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
                                    name="dateOfBirth" 
                                    label="Date of Birth" 
                                    type="date" 
                                    value={formData.dateOfBirth} 
                                    errors={errors.dateOfBirth || ''} 
                                    onChange={handleChange} 
                                />
                                <CustomInput 
                                    name="postalAddress" 
                                    label="Postal Address" 
                                    type="text" 
                                    placeholder="123 Business Street" 
                                    value={formData.postalAddress} 
                                    errors={errors.postalAddress || ''} 
                                    onChange={handleChange} 
                                />
                                <CustomInput 
                                    name="postalCode" 
                                    label="Postal Code" 
                                    type="text" 
                                    placeholder="3000" 
                                    value={formData.postalCode} 
                                    errors={errors.postalCode || ''} 
                                    onChange={handleChange} 
                                    maxLength={4}
                                />
                            </div>
                        </div>
                    </Tabs.Content>

                    <Tabs.Content value="organization" className="focus:outline-none">
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">Organization Details</h3>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                                <CustomInput 
                                    name="firstName" 
                                    label="Contact First Name" 
                                    type="text" 
                                    placeholder="John" 
                                    value={formData.firstName} 
                                    errors={errors.firstName || ''} 
                                    onChange={handleChange} 
                                />
                                <CustomInput 
                                    name="lastName" 
                                    label="Contact Last Name" 
                                    type="text" 
                                    placeholder="Doe" 
                                    value={formData.lastName} 
                                    errors={errors.lastName || ''} 
                                    onChange={handleChange} 
                                />
                                <CustomInput 
                                    name="email" 
                                    label="Business Email" 
                                    type="email" 
                                    placeholder="contact@business.com" 
                                    value={formData.email} 
                                    errors={errors.email || ''} 
                                    onChange={handleChange} 
                                />
                                
                                <div className="relative w-full">
                                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                        Business Phone <span className="text-red-500">*</span>
                                    </label>
                                    <PhoneInput
                                        international
                                        defaultCountry="AU"
                                        id="mobileNumber"
                                        value={formData.mobileNumber}
                                        onChange={handlePhoneChange}
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
                                    name="postalAddress" 
                                    label="Business Address" 
                                    type="text" 
                                    placeholder="123 Business Street" 
                                    value={formData.postalAddress} 
                                    errors={errors.postalAddress || ''} 
                                    onChange={handleChange} 
                                />
                                <CustomInput 
                                    name="postalCode" 
                                    label="Postal Code" 
                                    type="text" 
                                    placeholder="3000" 
                                    value={formData.postalCode} 
                                    errors={errors.postalCode || ''} 
                                    onChange={handleChange} 
                                    maxLength={4}
                                />
                                <CustomInput 
                                    name="ABN" 
                                    label="Australian Business Number" 
                                    type="text" 
                                    placeholder="12 345 678 901" 
                                    value={formData.ABN} 
                                    errors={errors.ABN || ''} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>
                    </Tabs.Content>

                    <div className="mt-8 space-y-6 border-t border-gray-100 pt-8">
                        <h3 className="text-lg font-medium text-gray-900">Tax File Details</h3>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                            <CustomInput 
                                name="taxFileNumber" 
                                label="Tax File Number" 
                                type="text" 
                                placeholder="123456789" 
                                value={formData.taxFileNumber} 
                                errors={errors.taxFileNumber || ''} 
                                onChange={handleChange} 
                                maxLength={9}
                            />
                        </div>
                    </div>

                    <div className="mt-8 space-y-6 border-t border-gray-100 pt-8">
                        <h3 className="text-lg font-medium text-gray-900">Additional Details</h3>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                            <div className="relative w-full">
                                <label htmlFor="accountantLocation" className="block text-sm font-medium text-gray-700 mb-1">
                                    Preferred Location <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="accountantLocation"
                                    name="accountantLocation"
                                    value={formData.accountantLocation}
                                    onChange={handleSelectChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors appearance-none"
                                    style={{ 
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: 'right 0.5rem center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: '1.5em 1.5em',
                                        paddingRight: '2.5rem'
                                    }}
                                >
                                    <option value="runcorn">RUNCORN (Aman Nagpal)</option>
                                    <option value="logan">LOGAN (MR Behzad Ahmad)</option>
                                    <option value="beenleigh">Beenleigh (Navpreet Kaur)</option>
                                </select>
                            </div>
                            
                            <CustomInput 
                                name="otherDetails" 
                                label="Other Details" 
                                type="textarea" 
                                placeholder="Any additional information you'd like to provide" 
                                value={formData.otherDetails} 
                                errors={errors.otherDetails || ''} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    <div className="mt-8 space-y-6 border-t border-gray-100 pt-8">
                        <h3 className="text-lg font-medium text-gray-900">ID Documents</h3>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                            <div className="relative w-full">
                                <label htmlFor="idDocuments" className="block text-sm font-medium text-gray-700 mb-1">
                                    ID Documents <span className="text-red-500">*</span>
                                </label>
                                <div className={`w-full px-4 py-3 rounded-lg border ${errors.idDocuments ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus-within:ring-1 focus-within:ring-sky-500 focus-within:border-sky-500 transition-colors`}>
                                    <div className="flex items-center justify-center">
                                        <label htmlFor="idDocuments" className="cursor-pointer w-full">
                                            <div className="flex flex-col items-center justify-center py-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="text-sm text-gray-500">
                                                    {formData.idDocuments 
                                                        ? `${formData.idDocuments.length} file(s) selected` 
                                                        : 'Drag & drop or click to upload'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Driving License, Passport, etc.
                                                </p>
                                            </div>
                                            <input 
                                                id="idDocuments" 
                                                name="idDocuments" 
                                                type="file" 
                                                className="hidden" 
                                                onChange={(e) => handleFileChange(e, 'idDocuments')}
                                                accept="image/*,.pdf,.doc,.docx"
                                                multiple={true}
                                            />
                                        </label>
                                    </div>
                                </div>
                                {errors.idDocuments && (
                                    <motion.p 
                                        initial={{ opacity: 0, y: -5 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        transition={{ duration: 0.3 }}
                                        className="mt-1 text-sm text-red-600"
                                    >
                                        {errors.idDocuments}
                                    </motion.p>
                                )}
                            </div>
                            
                            <div className="relative w-full">
                                <label htmlFor="otherDocuments" className="block text-sm font-medium text-gray-700 mb-1">
                                    Other Documents
                                </label>
                                <div className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus-within:ring-1 focus-within:ring-sky-500 focus-within:border-sky-500 transition-colors">
                                    <div className="flex items-center justify-center">
                                        <label htmlFor="otherDocuments" className="cursor-pointer w-full">
                                            <div className="flex flex-col items-center justify-center py-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="text-sm text-gray-500">
                                                    {formData.otherDocuments 
                                                        ? `${formData.otherDocuments.length} file(s) selected` 
                                                        : 'Drag & drop or click to upload'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Any additional documents
                                                </p>
                                            </div>
                                            <input 
                                                id="otherDocuments" 
                                                name="otherDocuments" 
                                                type="file" 
                                                className="hidden" 
                                                onChange={(e) => handleFileChange(e, 'otherDocuments')}
                                                accept="image/*,.pdf,.doc,.docx"
                                                multiple={true}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Declaration */}
                    <div className="mt-8 space-y-6 border-t border-gray-100 pt-8">
                        <div className="flex items-start">
                            <div className="flex h-5 items-center">
                                <input
                                    id="declaration"
                                    name="declaration"
                                    type="checkbox"
                                    checked={formData.declaration}
                                    onChange={handleChange}
                                    className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="declaration" className="font-medium text-gray-700">
                                    Declaration <span className="text-red-500">*</span>
                                </label>
                                <p className="text-gray-500">
                                    I hereby authorise Proven Associated Server Pty Ltd & Mr Aman Nagma T/A Proven Accountants to act as my tax agent and represent me in all dealings with the Australian Taxation Office.
                                </p>
                                {errors.declaration && (
                                    <motion.p 
                                        initial={{ opacity: 0, y: -5 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        transition={{ duration: 0.3 }}
                                        className="mt-1 text-sm text-red-600"
                                    >
                                        {errors.declaration}
                                    </motion.p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-4">
                        <Dialog.Close asChild>
                            <button
                                type="button"
                                className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors"
                            >
                                Cancel
                            </button>
                        </Dialog.Close>
                        <button
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
                        </button>
                    </div>
                </Form.Root>
            </Tabs.Root>
        </Modal>
    )
}

export default IntroductionModal