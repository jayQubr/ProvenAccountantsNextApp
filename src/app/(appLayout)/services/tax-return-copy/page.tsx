'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon} from '@heroicons/react/24/outline'
import { IdentificationIcon } from '@heroicons/react/24/outline'
import CustomInput from '@/components/ui/CustomInput';

const TaxReturnCopy = () => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const [companyData, setCompanyData] = useState<any>({
    year: '',
    details: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const { name, value } = e.target
    setCompanyData((prev:any) => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!companyData.year.trim()) {
      newErrors.year = 'Year is required'
    }

    if (!companyData.details.trim()) {
      newErrors.details = 'Details is required'
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Year for which Tax Return Copy</h1>
        </div>
        
        <p className="text-gray-600 text-sm">
          Complete the form below to register your tax return copy. All fields marked with * are required.
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
            <div className="space-y-4 mt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Year for which Tax Return Copy</h2>
              <CustomInput label="Specify the year" type="number" name="year" value={companyData.year} onChange={(e) => handleChange(e, 0)} errors={errors.year} placeholder="Enter your year" />
              <CustomInput label="Details (Optional)" type="textarea" name="details" value={companyData.details} onChange={(e) => handleChange(e, 0)} errors={errors.details} placeholder="Enter your details" />
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

export default TaxReturnCopy