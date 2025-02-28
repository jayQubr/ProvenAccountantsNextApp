'use client'
import React, { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebaseConfig'
import { getUserProfile, updateUserProfile } from '@/lib/firebaseService'
import CustomInput from '@/components/ui/CustomInput'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { updateProfile } from 'firebase/auth'
import { motion } from 'framer-motion'

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [updateSuccess, setUpdateSuccess] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser
        if (currentUser) {
          const userProfileResult = await getUserProfile(currentUser.uid)
          if (userProfileResult.success) {
            const userData = userProfileResult.data
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              ...userData
            })
            
            setFormData({
              displayName: currentUser.displayName || '',
              firstName: userData?.firstName || '',
              lastName: userData?.lastName || '',
              email: currentUser.email || '',
              phone: userData?.phone || '',
              address: userData?.address || '',
              postalCode: userData?.postalCode || '',
              description: userData?.description || ''
            })
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
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
    setFormData(prev => ({ ...prev, phone: value || '' }))
    
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

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Username is required'
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required'
    } else if (!/^\d{4}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Postal code must be 4 digits'
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      const currentUser = auth.currentUser
      
      if (currentUser) {
        // Update display name in Firebase Auth
        await updateProfile(currentUser, {
          displayName: formData.displayName
        })
        
        // Update user profile in Firestore
        await updateUserProfile(currentUser.uid, {
          displayName: formData.displayName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          postalCode: formData.postalCode,
          description: formData.description
        })
        
        // Refresh user data
        const userProfileResult = await getUserProfile(currentUser.uid)
        if (userProfileResult.success) {
          setUser({
            ...user,
            displayName: formData.displayName,
            ...userProfileResult.data
          })
        }
        
        setUpdateSuccess(true)
        setTimeout(() => {
          setUpdateSuccess(false)
          setIsEditing(false)
        }, 3000)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center mb-8">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Profile'}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-sky-500 to-sky-700 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {formData.firstName && formData.lastName 
                  ? `${formData.firstName[0]}${formData.lastName[0]}`
                  : formData.displayName?.substring(0, 2) || 'U'}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{formData.displayName || 'User'}</h2>
              <p className="text-gray-500">{formData.email}</p>
              {formData.description && !isEditing && (
                <p className="mt-2 text-gray-700">{formData.description}</p>
              )}
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomInput
                  label="Username"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  errors={errors.displayName || ''}
                  placeholder="Enter username"
                />
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors`}
                    placeholder="Tell us about yourself"
                    rows={3}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
                
                <CustomInput
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  errors={errors.firstName || ''}
                  placeholder="Enter first name"
                />
                
                <CustomInput
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  errors={errors.lastName || ''}
                  placeholder="Enter last name"
                />
                
                <CustomInput
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  errors={errors.email || ''}
                  placeholder="Enter email"
                  type="email"
                />
                
                <div className="relative w-full">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="AU"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <CustomInput
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    errors={errors.address || ''}
                    placeholder="Enter address"
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
                />
              </div>
              
              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              
              {updateSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg"
                >
                  Profile updated successfully!
                </motion.div>
              )}
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">First Name</h3>
                <p className="text-gray-900">{formData.firstName || 'Not provided'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Last Name</h3>
                <p className="text-gray-900">{formData.lastName || 'Not provided'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                <p className="text-gray-900">{formData.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Mobile Number</h3>
                <p className="text-gray-900">{formData.phone || 'Not provided'}</p>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
                <p className="text-gray-900">{formData.address || 'Not provided'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Postal Code</h3>
                <p className="text-gray-900">{formData.postalCode || 'Not provided'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage