'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeftIcon,
    CalendarIcon,
    ClockIcon,
    UserIcon,
    VideoCameraIcon,
    ChatBubbleLeftRightIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationCircleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { auth, db } from '@/lib/firebaseConfig';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Define the appointment interface
interface Appointment {
    id: string;
    title: string;
    description: string;
    date: any; // Firebase timestamp
    startTime: string;
    endTime: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    meetingLink?: string;
    accountantName: string;
    accountantPhotoURL?: string;
    serviceType: string;
    notes?: string;
    createdAt: any;
    updatedAt?: any;
}

// Mock data for development
const mockAppointments: { [key: string]: Appointment } = {
    '1': {
        id: '1',
        title: 'Tax Planning Consultation',
        description: 'Discuss tax planning strategies for the upcoming financial year',
        date: { seconds: Date.now() / 1000 + 86400 * 3 }, // 3 days from now
        startTime: '10:00',
        endTime: '10:30',
        status: 'scheduled',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        accountantName: 'Sarah Johnson',
        accountantPhotoURL: 'https://randomuser.me/api/portraits/women/44.jpg',
        serviceType: 'Consultation',
        notes: 'I would like to discuss tax deductions for my small business.',
        createdAt: { seconds: Date.now() / 1000 - 86400 * 7 } // Created 7 days ago
    },
    '2': {
        id: '2',
        title: 'Business Registration Review',
        description: 'Review of business registration documents and requirements',
        date: { seconds: Date.now() / 1000 - 86400 * 2 }, // 2 days ago
        startTime: '14:00',
        endTime: '14:45',
        status: 'completed',
        meetingLink: 'https://meet.google.com/xyz-abcd-efg',
        accountantName: 'Michael Chen',
        accountantPhotoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
        serviceType: 'Document Review',
        createdAt: { seconds: Date.now() / 1000 - 86400 * 14 }, // Created 14 days ago
        updatedAt: { seconds: Date.now() / 1000 - 86400 * 2 } // Updated 2 days ago
    },
    '3': {
        id: '3',
        title: 'ATO Registration Assistance',
        description: 'Help with completing ATO registration forms',
        date: { seconds: Date.now() / 1000 - 86400 * 1 }, // 1 day ago
        startTime: '11:00',
        endTime: '11:30',
        status: 'cancelled',
        accountantName: 'David Wilson',
        accountantPhotoURL: 'https://randomuser.me/api/portraits/men/67.jpg',
        serviceType: 'Registration',
        notes: 'Need help with ATO registration for my new business.',
        createdAt: { seconds: Date.now() / 1000 - 86400 * 10 }, // Created 10 days ago
        updatedAt: { seconds: Date.now() / 1000 - 86400 * 3 } // Updated 3 days ago
    },
    '4': {
        id: '4',
        title: 'Financial Statement Analysis',
        description: 'Review and analysis of quarterly financial statements',
        date: { seconds: Date.now() / 1000 + 86400 * 1 }, // 1 day from now
        startTime: '13:00',
        endTime: '14:00',
        status: 'rescheduled',
        meetingLink: 'https://meet.google.com/pqr-stuv-wxy',
        accountantName: 'Emily Rodriguez',
        accountantPhotoURL: 'https://randomuser.me/api/portraits/women/28.jpg',
        serviceType: 'Financial Analysis',
        notes: 'I need to understand the financial health of my business.',
        createdAt: { seconds: Date.now() / 1000 - 86400 * 5 }, // Created 5 days ago
        updatedAt: { seconds: Date.now() / 1000 - 86400 * 1 } // Updated 1 day ago
    }
};

const AppointmentDetailPage = () => {
    const router = useRouter();
    const params:any = useParams();
    const appointmentId = params?.id ?? '';
    
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    
    useEffect(() => {
      const fetchAppointment = async () => {
        try {
          setLoading(true);
          
          // For development, use mock data
          if (appointmentId && mockAppointments[appointmentId]) {
            setAppointment(mockAppointments[appointmentId]);
            setLoading(false);
            return;
          }
          
          /* Uncomment for production
          const user = auth.currentUser;
          if (!user) {
            router.push('/login');
            return;
          }
          
          const appointmentRef = doc(db, 'appointments', appointmentId);
          const appointmentSnap = await getDoc(appointmentRef);
          
          if (appointmentSnap.exists()) {
            const appointmentData = appointmentSnap.data();
            
            // Verify this appointment belongs to the current user
            if (appointmentData.userId !== user.uid) {
              setError('You do not have permission to view this appointment.');
              setLoading(false);
              return;
            }
            
            setAppointment({
              id: appointmentSnap.id,
              ...appointmentData
            } as Appointment);
          } else {
            setError('Appointment not found.');
          }
          */
          
          // If we don't have mock data for this ID, show error
          if (!mockAppointments[appointmentId]) {
            setError('Appointment not found.');
          }
        } catch (err) {
          console.error('Error fetching appointment:', err);
          setError('Failed to load appointment details. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      if (appointmentId) {
        fetchAppointment();
      }
    }, [appointmentId, router]);
    
    // Handle appointment cancellation
    const handleCancelAppointment = async () => {
      if (!appointment) return;
      
      try {
        setCancelling(true);
        
        // For development, just simulate success
        setTimeout(() => {
          setAppointment({
            ...appointment,
            status: 'cancelled',
            updatedAt: { seconds: Date.now() / 1000 }
          });
          setShowCancelModal(false);
          setCancelling(false);
        }, 1000);
        
        /* Uncomment for production
        const appointmentRef = doc(db, 'appointments', appointment.id);
        await updateDoc(appointmentRef, {
          status: 'cancelled',
          cancelReason: cancelReason,
          updatedAt: serverTimestamp()
        });
        
        // Update local state
        setAppointment({
          ...appointment,
          status: 'cancelled',
          updatedAt: { seconds: Date.now() / 1000 }
        });
        
        setShowCancelModal(false);
        */
      } catch (err) {
        console.error('Error cancelling appointment:', err);
        setError('Failed to cancel appointment. Please try again.');
        setCancelling(false);
      }
    };
    
    // Format date from Firebase timestamp
    const formatDate = (timestamp: any) => {
      if (!timestamp) return '';
      
      const date = new Date(timestamp.seconds * 1000);
      return new Intl.DateTimeFormat('en-AU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    };
    
    // Format time (e.g., "10:00" to "10:00 AM")
    const formatTime = (time: string) => {
      if (!time) return '';
      
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      
      return `${formattedHour}:${minutes} ${ampm}`;
    };
    
    // Check if appointment is upcoming
    const isUpcoming = (appointment: Appointment) => {
      if (!appointment.date) return false;
      
      const appointmentDate = new Date(appointment.date.seconds * 1000);
      const now = new Date();
      
      return appointmentDate > now;
    };
    
    // Generate status badge
    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'scheduled':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircleIcon className="w-3 h-3 mr-1" />
              Scheduled
            </span>
          );
        case 'completed':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <CheckCircleIcon className="w-3 h-3 mr-1" />
              Completed
            </span>
          );
        case 'cancelled':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <XCircleIcon className="w-3 h-3 mr-1" />
              Cancelled
            </span>
          );
        case 'rescheduled':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <ArrowPathIcon className="w-3 h-3 mr-1" />
              Rescheduled
            </span>
          );
        default:
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {status}
            </span>
          );
      }
    };
    
    // Render cancel appointment modal
    const renderCancelModal = () => (
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Cancel Appointment</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to cancel this appointment? This action cannot be undone.
                    </p>
                    <div className="mt-4">
                      <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700">
                        Reason for cancellation (optional)
                      </label>
                      <textarea
                        id="cancelReason"
                        name="cancelReason"
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2"
                        placeholder="Please provide a reason for cancellation..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleCancelAppointment}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cancelling...
                  </>
                ) : (
                  'Cancel Appointment'
                )}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
    
    if (loading) {
      return (
        <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-4xl">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-center flex-col py-8">
              <ExclamationCircleIcon className="w-12 h-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">{error}</h2>
              <p className="text-gray-600 mb-6">We couldn't find the appointment you're looking for.</p>
              <Link
                href="/appointments"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Return to Appointments
              </Link>
            </div>
          </div>
        </div>
      );
    }
    
    if (!appointment) {
      return (
        <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-center flex-col py-8">
              <ExclamationCircleIcon className="w-12 h-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Appointment Not Found</h2>
              <p className="text-gray-600 mb-6">We couldn't find the appointment you're looking for.</p>
              <Link
                href="/appointments"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Return to Appointments
              </Link>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center mb-6">
            <Link
              href="/appointments"
              className="flex items-center text-amber-600 hover:text-amber-700 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              <span>Back to Appointments</span>
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{appointment.title}</h1>
                    <div className="flex items-center mt-1">
                      {getStatusBadge(appointment.status)}
                      <span className="ml-2 text-sm text-gray-500">{appointment.serviceType}</span>
                    </div>
                  </div>
                </div>
                
                {isUpcoming(appointment) && appointment.status === 'scheduled' && (
                  <div className="flex space-x-2">
                    <Link
                      href={`/appointments/edit/${appointment.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      <ArrowPathIcon className="w-4 h-4 mr-1.5" />
                      Reschedule
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => setShowCancelModal(true)}
                    >
                      <TrashIcon className="w-4 h-4 mr-1.5" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Appointment Details</h2>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <CalendarIcon className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Date</p>
                          <p className="text-base text-gray-900">{formatDate(appointment.date)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <ClockIcon className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Time</p>
                          <p className="text-base text-gray-900">
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <UserIcon className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Accountant</p>
                          <div className="flex items-center mt-1">
                            {appointment.accountantPhotoURL ? (
                              <img
                                src={appointment.accountantPhotoURL}
                                alt={appointment.accountantName}
                                className="w-8 h-8 rounded-full mr-2 object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-sm font-medium mr-2">
                                {appointment.accountantName.charAt(0)}
                              </div>
                            )}
                            <p className="text-base text-gray-900">{appointment.accountantName}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Description</p>
                          <p className="text-base text-gray-900">{appointment.description}</p>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="flex items-start">
                          <ChatBubbleLeftRightIcon className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Your Notes</p>
                            <p className="text-base text-gray-900">{appointment.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {appointment.meetingLink && isUpcoming(appointment) && appointment.status === 'scheduled' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <VideoCameraIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-700">Meeting Link</p>
                          <p className="text-base text-blue-900 mb-2">
                            Join your appointment via Google Meet
                          </p>
                          <a
                            href={appointment.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <VideoCameraIcon className="w-4 h-4 mr-2" />
                            Join Meeting
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Appointment Timeline</h2>
                    <div className="relative pl-6 border-l-2 border-gray-200 space-y-4">
                      <div className="relative">
                        <div className="absolute -left-[25px] mt-1.5 w-4 h-4 rounded-full bg-amber-500"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Appointment Created</p>
                          <p className="text-xs text-gray-500">{formatDate(appointment.createdAt)}</p>
                        </div>
                      </div>
                      
                      {appointment.status === 'rescheduled' && appointment.updatedAt && (
                        <div className="relative">
                          <div className="absolute -left-[25px] mt-1.5 w-4 h-4 rounded-full bg-amber-500"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Appointment Rescheduled</p>
                            <p className="text-xs text-gray-500">{formatDate(appointment.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                      
                      {appointment.status === 'cancelled' && appointment.updatedAt && (
                        <div className="relative">
                          <div className="absolute -left-[25px] mt-1.5 w-4 h-4 rounded-full bg-red-500"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Appointment Cancelled</p>
                            <p className="text-xs text-gray-500">{formatDate(appointment.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                      
                      {appointment.status === 'completed' && appointment.updatedAt && (
                        <div className="relative">
                          <div className="absolute -left-[25px] mt-1.5 w-4 h-4 rounded-full bg-green-500"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Appointment Completed</p>
                            <p className="text-xs text-gray-500">{formatDate(appointment.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                      
                      {appointment.status === 'scheduled' && (
                        <div className="relative">
                          <div className="absolute -left-[25px] mt-1.5 w-4 h-4 rounded-full bg-gray-300"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Upcoming Appointment</p>
                            <p className="text-xs text-gray-500">{formatDate(appointment.date)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      If you need to make changes to your appointment or have any questions, please contact our support team.
                    </p>
                    <Link
                      href="/contact"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      Contact Support
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {showCancelModal && renderCancelModal()}
      </div>
    );
  };
  
  export default AppointmentDetailPage;