'use client'

import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import * as Form from '@radix-ui/react-form'
import Modal from '../ui/Modal'
import InputField from '../ui/InputField'

type FormData = {
    // Individual/Organization common fields
    name: string
    email: string
    taxFileNumber: string
    mobileNumber: string
    dateOfBirth: string
    address: string
    city: string


    acn?: string
    authorizedName: string
    authorizedEmail: string
    authorizedMobile: string
    authorizedDob: string

    // Previous accountant details
    previousAccountantEmail: string
    previousAccountantMobile: string
    declaration: boolean
}

interface IntroductionModalProps {
    isOpen?: boolean;
    setIsOpen?: (isOpen: boolean) => void;
}

const IntroductionModal = ({ isOpen = false, setIsOpen }: IntroductionModalProps) => {
    const [activeTab, setActiveTab] = useState('individual')
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        taxFileNumber: '',
        mobileNumber: '',
        dateOfBirth: '',
        address: '',
        city: '',
        acn: '',
        authorizedName: '',
        authorizedEmail: '',
        authorizedMobile: '',
        authorizedDob: '',
        previousAccountantEmail: '',
        previousAccountantMobile: '',
        declaration: false
    })
    const [open, setOpen] = useState(isOpen)

    useEffect(() => {
        if (isOpen !== undefined) {
            setOpen(isOpen);
        }
    }, [isOpen]);

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (setIsOpen) {
            setIsOpen(newOpen);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
        handleOpenChange(false);
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
                                <InputField name="name" label="Full Name" placeholder="John Doe" value={formData.name} onChange={handleChange} required={true} message="Please enter your full name" />
                                <InputField type='email' name="email" label="Email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required={true} message="Please enter your email" />
                                <InputField type='text' name="taxFileNumber" label="Tax File Number" placeholder="123 456 789" value={formData.taxFileNumber} onChange={handleChange} required={true} message="Please enter your tax file number" />
                                <InputField type='tel' name="mobileNumber" label="Mobile Number" placeholder="0400 123 456" value={formData.mobileNumber} onChange={handleChange} required={true} message="Please enter your mobile number" />
                                <InputField type='date' name="dateOfBirth" label="Date of Birth" placeholder="25/01/1990" value={formData.dateOfBirth} onChange={handleChange} required={true} message="Please enter your date of birth" />
                                <InputField type='text' name="address" label="Address" placeholder="123 Main Street" value={formData.address} onChange={handleChange} required={true} message="Please enter your address" />
                                <InputField type='text' name="city" label="City" placeholder="Sydney" value={formData.city} onChange={handleChange} required={true} message="Please enter your city" />
                            </div>
                        </div>
                    </Tabs.Content>

                    <Tabs.Content value="organization" className="focus:outline-none">
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">Organization Details</h3>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                                <InputField type='text' name="name" label="Organization Name" placeholder="Acme Corporation" value={formData.name} onChange={handleChange} required={true} message="Please enter your organization name" />
                                <InputField type='email' name="email" label="Email" placeholder="info@acme.com" value={formData.email} onChange={handleChange} required={true} message="Please enter your email" />
                                <InputField type='text' name="taxFileNumber" label="Australian Company Number" placeholder="12 345 678 901" value={formData.taxFileNumber} onChange={handleChange} required={true} message="Please enter your ABN" />
                                <InputField type='tel' name="mobileNumber" label="Mobile Number" placeholder="0400 123 456" value={formData.mobileNumber} onChange={handleChange} required={true} message="Please enter your mobile number" />
                                <InputField type='text' name="address" label="Registered Address" placeholder="123 Business Street" value={formData.address} onChange={handleChange} required={true} message="Please enter your registered address" />
                                <InputField type='text' name="city" label="City" placeholder="Melbourne" value={formData.city} onChange={handleChange} required={true} message="Please enter your city" />
                                <InputField type='text' name="city" label="City" placeholder="Melbourne" value={formData.city} onChange={handleChange} required={true} message="Please enter your city" />
                            </div>
                        </div>
                    </Tabs.Content>

                    {/* Authorized Person Details - Common for both tabs */}
                    <div className="mt-8 space-y-6 border-t border-gray-100 pt-8">
                        <h3 className="text-lg font-medium text-gray-900">Authorized Person Details</h3>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                            <InputField type='text' name="authorizedName" label="Full Name" placeholder="Jane Smith" value={formData.authorizedName} onChange={handleChange} required={true} message="Please enter your authorized person's name" />

                            <InputField type='email' name="authorizedEmail" label="Email" placeholder="jane@acme.com" value={formData.authorizedEmail} onChange={handleChange} required={true} message="Please enter your authorized person's email" />

                            <InputField type='tel' name="authorizedMobile" label="Telephone/Mobile" placeholder="0400 987 654" value={formData.authorizedMobile} onChange={handleChange} required={true} message="Please enter your authorized person's mobile number" />

                            <InputField type='date' name="authorizedDob" label="Date of Birth" placeholder="25/01/1990" value={formData.authorizedDob} onChange={handleChange} required={true} message="Please enter your authorized person's date of birth" />
                        </div>
                    </div>

                    {/* Previous Accountant Details - Common for both tabs */}
                    <div className="mt-8 space-y-6 border-t border-gray-100 pt-8">
                        <h3 className="text-lg font-medium text-gray-900">Previous Accountant Details (if any)</h3>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                            <InputField type='email' name="previousAccountantEmail" label="Email of Accountant" placeholder="accountant@example.com" value={formData.previousAccountantEmail} onChange={handleChange} required={true} message="Please enter your previous accountant's email" />
                            <InputField type='tel' name="previousAccountantMobile" label="Telephone/Mobile" placeholder="0400 123 789" value={formData.previousAccountantMobile} onChange={handleChange} required={true} message="Please enter your previous accountant's mobile number" />
                        </div>
                    </div>

                    {/* Declaration - Common for both tabs */}
                    <div className="mt-8 space-y-6 border-t border-gray-100 pt-8">
                        <div className="flex items-start">
                            <div className="flex h-5 items-center">
                                <input
                                    id="declaration"
                                    name="declaration"
                                    type="checkbox"
                                    checked={formData.declaration}
                                    onChange={handleChange}
                                    required
                                    className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="declaration" className="font-medium text-gray-700">
                                    Declaration
                                </label>
                                <p className="text-gray-500">
                                    I hereby authorise Proven Associated Server Pty Ltd & Mr Aman Nagma T/A Proven Accountants to act as my tax agent and represent me in all dealings with the Australian Taxation Office.
                                </p>
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
                            className="inline-flex items-center rounded-md border border-transparent bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors"
                        >
                            Register
                        </button>
                    </div>
                </Form.Root>
            </Tabs.Root>
        </Modal>
    )
}

export default IntroductionModal