'use client'
import React, { useState, useEffect } from 'react'
import { auth } from '@/lib/firebaseConfig'
import { getUserProfile } from '@/lib/firebaseService'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  CalendarIcon, 
  DocumentTextIcon, 
  ArrowRightIcon, 
  ClockIcon, 
  UserCircleIcon,
  BriefcaseIcon,
  DocumentDuplicateIcon,
  PhoneIcon,
  CreditCardIcon,
  DocumentCheckIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser
        if (currentUser) {
          const userProfileResult = await getUserProfile(currentUser.uid)
          if (userProfileResult.success) {
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              ...userProfileResult.data
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

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  }

  // Quick access services
  const quickServices = [
    { 
      name: 'ATO Registration', 
      icon: DocumentCheckIcon, 
      href: '/services/ato-registration',
      color: 'bg-blue-50 text-blue-700' 
    },
    { 
      name: 'Business Registration', 
      icon: BuildingOfficeIcon, 
      href: '/services/business-registration',
      color: 'bg-purple-50 text-purple-700' 
    },
    { 
      name: 'Company Registration', 
      icon: BriefcaseIcon, 
      href: '/services/company-registration',
      color: 'bg-green-50 text-green-700' 
    },
    { 
      name: 'Trust Registration', 
      icon: ShieldCheckIcon, 
      href: '/services/trust-registration',
      color: 'bg-amber-50 text-amber-700' 
    },
    { 
      name: 'Tax Return Copy', 
      icon: DocumentDuplicateIcon, 
      href: '/services/tax-return-copy',
      color: 'bg-rose-50 text-rose-700' 
    },
    { 
      name: 'Payment Plan', 
      icon: CreditCardIcon, 
      href: '/services/payment-plan',
      color: 'bg-teal-50 text-teal-700' 
    }
  ]

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'request',
      title: 'Tax Return Copy',
      status: 'In Progress',
      date: '2 days ago',
      icon: DocumentTextIcon,
      href: '/my-requests/1',
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 2,
      type: 'appointment',
      title: 'Tax Consultation',
      status: 'Upcoming',
      date: 'Tomorrow, 10:00 AM',
      icon: CalendarIcon,
      href: '/appointments/2',
      statusColor: 'bg-green-100 text-green-800'
    }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl p-6 mb-6 text-white shadow-lg"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-sky-100 mb-4">
              Your financial dashboard is ready for you.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link 
                href="/services" 
                className="inline-flex items-center px-4 py-2 bg-white text-sky-700 rounded-lg font-medium text-sm hover:bg-sky-50 transition-colors"
              >
                Browse Services
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                href="/appointments/schedule" 
                className="inline-flex items-center px-4 py-2 bg-sky-800 text-white rounded-lg font-medium text-sm hover:bg-sky-900 transition-colors"
              >
                Schedule Appointment
                <CalendarIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 rounded-full bg-sky-800 flex items-center justify-center">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="w-16 h-16 text-white" />
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Access Services */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Services</h2>
          <Link href="/services" className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center">
            View All
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {quickServices.map((service, index) => (
            <motion.div
              key={service.name}
              variants={itemVariants}
              className="relative"
            >
              <Link 
                href={service.href}
                className="flex flex-col items-center p-4 rounded-xl border border-gray-200 bg-white hover:border-sky-200 hover:shadow-md transition-all h-full"
              >
                <div className={`p-3 rounded-full ${service.color} mb-3`}>
                  <service.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-center text-gray-800">{service.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link href="/my-requests" className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center">
              View All
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <motion.div 
                  key={activity.id}
                  variants={itemVariants}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <Link href={activity.href} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${activity.type === 'appointment' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                        <activity.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${activity.statusColor}`}>
                        {activity.status}
                      </span>
                      <ArrowRightIcon className="ml-3 h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">No recent activities</p>
                <Link 
                  href="/services" 
                  className="inline-flex items-center px-4 py-2 bg-sky-100 text-sky-700 rounded-lg font-medium text-sm hover:bg-sky-200 transition-colors"
                >
                  Browse Services
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          
          <div className="p-4 space-y-3">
            <motion.div variants={itemVariants}>
              <Link 
                href="/appointments/schedule" 
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-sky-200 hover:bg-sky-50 transition-all"
              >
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700 mr-3">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-gray-800">Schedule Appointment</span>
              </Link>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Link 
                href="/my-requests" 
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-sky-200 hover:bg-sky-50 transition-all"
              >
                <div className="p-2 rounded-lg bg-purple-50 text-purple-700 mr-3">
                  <DocumentTextIcon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-gray-800">View My Requests</span>
              </Link>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Link 
                href="/my-profile" 
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-sky-200 hover:bg-sky-50 transition-all"
              >
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 mr-3">
                  <UserCircleIcon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-gray-800">Update Profile</span>
              </Link>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Link 
                href="/appointments" 
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-sky-200 hover:bg-sky-50 transition-all"
              >
                <div className="p-2 rounded-lg bg-green-50 text-green-700 mr-3">
                  <ClockIcon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-gray-800">My Appointments</span>
              </Link>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <a 
                href="tel:+61123456789" 
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-sky-200 hover:bg-sky-50 transition-all"
              >
                <div className="p-2 rounded-lg bg-rose-50 text-rose-700 mr-3">
                  <PhoneIcon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-gray-800">Contact Support</span>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Mobile App-like Bottom Navigation - Only visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex flex-col items-center text-sky-600">
            <div className="p-1 rounded-full bg-sky-100">
              <DocumentTextIcon className="h-5 w-5" />
            </div>
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link href="/services" className="flex flex-col items-center text-gray-500 hover:text-sky-600">
            <div className="p-1 rounded-full">
              <BriefcaseIcon className="h-5 w-5" />
            </div>
            <span className="text-xs mt-1">Services</span>
          </Link>
          
          <Link href="/appointments" className="flex flex-col items-center text-gray-500 hover:text-sky-600">
            <div className="p-1 rounded-full">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <span className="text-xs mt-1">Appointments</span>
          </Link>
          
          <Link href="/my-requests" className="flex flex-col items-center text-gray-500 hover:text-sky-600">
            <div className="p-1 rounded-full">
              <DocumentDuplicateIcon className="h-5 w-5" />
            </div>
            <span className="text-xs mt-1">Requests</span>
          </Link>
          
          <Link href="/my-profile" className="flex flex-col items-center text-gray-500 hover:text-sky-600">
            <div className="p-1 rounded-full">
              <UserCircleIcon className="h-5 w-5" />
            </div>
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
      
      {/* Add padding at the bottom for mobile to account for the fixed navigation */}
      <div className="h-20 md:hidden"></div>
    </div>
  )
}

export default Dashboard