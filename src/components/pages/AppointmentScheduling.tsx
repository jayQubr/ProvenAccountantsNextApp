'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { format, addDays, startOfDay, addMinutes, isBefore, isAfter, parseISO } from 'date-fns';
import { auth, db } from '@/lib/firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

// Define the accountant interface
interface Accountant {
  id: string;
  name: string;
  photoURL?: string;
  specialization: string;
  experience: string;
}

// Define the service type interface
interface ServiceType {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
}

// Define the time slot interface
interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

// Mock data for accountants
const mockAccountants: Accountant[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    photoURL: 'https://randomuser.me/api/portraits/women/44.jpg',
    specialization: 'Tax Planning',
    experience: '8 years'
  },
  {
    id: '2',
    name: 'Michael Chen',
    photoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
    specialization: 'Business Registration',
    experience: '10 years'
  },
  {
    id: '3',
    name: 'David Wilson',
    photoURL: 'https://randomuser.me/api/portraits/men/67.jpg',
    specialization: 'ATO Registration',
    experience: '5 years'
  },
  {
    id: '4',
    name: 'Emma Thompson',
    photoURL: 'https://randomuser.me/api/portraits/women/22.jpg',
    specialization: 'Tax Returns',
    experience: '7 years'
  }
];

// Mock data for service types
const mockServiceTypes: ServiceType[] = [
  {
    id: '1',
    name: 'Tax Planning Consultation',
    description: 'Discuss tax planning strategies for your business or personal finances',
    duration: 30
  },
  {
    id: '2',
    name: 'Business Registration Assistance',
    description: 'Get help with business registration documents and requirements',
    duration: 45
  },
  {
    id: '3',
    name: 'ATO Registration Support',
    description: 'Assistance with ATO registration forms and processes',
    duration: 30
  },
  {
    id: '4',
    name: 'Tax Return Consultation',
    description: 'Discuss your tax return requirements and get expert advice',
    duration: 30
  },
  {
    id: '5',
    name: 'General Accounting Consultation',
    description: 'General consultation about your accounting needs',
    duration: 60
  }
];

const generateTimeSlots = (duration: number = 30): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Calculate end time
        const endHour = minute + duration >= 60 ? hour + 1 : hour;
        const endMinute = (minute + duration) % 60;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        // Don't add slots that go beyond end time
        if (endHour < endHour || (endHour === endHour && endMinute <= 0)) {
          slots.push({
            startTime,
            endTime,
            available: Math.random() > 0.3 // Randomly mark some as unavailable for mock data
          });
        }
      }
    }
    
    return slots;
  };
  
  const ScheduleAppointmentPage = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [accountants, setAccountants] = useState<Accountant[]>([]);
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [selectedAccountant, setSelectedAccountant] = useState<string>('');
    const [selectedService, setSelectedService] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    // Generate available dates (today + next 14 days)
    const availableDates = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i));
    
    // Fetch accountants and service types
    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          
          // For development, use mock data
          setAccountants(mockAccountants);
          setServiceTypes(mockServiceTypes);
          
          /* Uncomment for production
          const accountantsRef = collection(db, 'accountants');
          const accountantsSnapshot = await getDocs(accountantsRef);
          const fetchedAccountants: Accountant[] = [];
          
          accountantsSnapshot.forEach((doc) => {
            fetchedAccountants.push({
              id: doc.id,
              ...doc.data()
            } as Accountant);
          });
          
          setAccountants(fetchedAccountants);
          
          const serviceTypesRef = collection(db, 'serviceTypes');
          const serviceTypesSnapshot = await getDocs(serviceTypesRef);
          const fetchedServiceTypes: ServiceType[] = [];
          
          serviceTypesSnapshot.forEach((doc) => {
            fetchedServiceTypes.push({
              id: doc.id,
              ...doc.data()
            } as ServiceType);
          });
          
          setServiceTypes(fetchedServiceTypes);
          */
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Failed to load appointment data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }, []);
    
    // Update time slots when service or date changes
    useEffect(() => {
      if (selectedService && selectedDate) {
        const service = serviceTypes.find(s => s.id === selectedService);
        if (service) {
          // In a real app, you would fetch available time slots from the server
          // based on the selected accountant, service, and date
          setTimeSlots(generateTimeSlots(service.duration));
        }
      }
    }, [selectedService, selectedDate, serviceTypes]);
    
    // Handle form submission
    const handleSubmit = async () => {
      if (!selectedAccountant || !selectedService || !selectedTimeSlot) {
        setError('Please complete all required fields');
        return;
      }
      
      try {
        setSubmitting(true);
        
        const accountant = accountants.find(a => a.id === selectedAccountant);
        const service = serviceTypes.find(s => s.id === selectedService);
        
        if (!accountant || !service) {
          throw new Error('Invalid selection');
        }
        
        // For development, just simulate success
        setTimeout(() => {
          setSubmitting(false);
          router.push('/appointments');
        }, 1500);
        
        /* Uncomment for production
        const user = auth.currentUser;
        if (!user) {
          router.push('/login');
          return;
        }
        
        // Format date string for the appointment
        const appointmentDate = format(selectedDate, 'yyyy-MM-dd');
        
        // Create appointment document
        await addDoc(collection(db, 'appointments'), {
          userId: user.uid,
          accountantId: selectedAccountant,
          accountantName: accountant.name,
          accountantPhotoURL: accountant.photoURL,
          serviceType: service.name,
          title: service.name,
          description: service.description,
          date: new Date(`${appointmentDate}T00:00:00`),
          startTime: selectedTimeSlot.startTime,
          endTime: selectedTimeSlot.endTime,
          notes: notes,
          status: 'scheduled',
          createdAt: serverTimestamp(),
        });
        
        setSubmitting(false);
        router.push('/appointments');
        */
      } catch (error) {
        console.error('Error scheduling appointment:', error);
        setError('Failed to schedule appointment. Please try again.');
        setSubmitting(false);
      }
    };
    
    // Format date for display
    const formatDateForDisplay = (date: Date) => {
      return format(date, 'EEE, MMM d, yyyy');
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
    
    // Check if a date is selectable (not in the past)
    const isDateSelectable = (date: Date) => {
      return !isBefore(date, startOfDay(new Date()));
    };
    
    // Render step 1: Select accountant and service
    const renderStep1 = () => (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select an Accountant</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accountants.map((accountant) => (
              <div
                key={accountant.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAccountant === accountant.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                }`}
                onClick={() => setSelectedAccountant(accountant.id)}
              >
                <div className="flex items-center space-x-3">
                  {accountant.photoURL ? (
                    <img
                      src={accountant.photoURL}
                      alt={accountant.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-lg font-medium">
                      {accountant.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{accountant.name}</h3>
                    <p className="text-sm text-gray-500">{accountant.specialization}</p>
                    <p className="text-xs text-gray-400">{accountant.experience} experience</p>
                  </div>
                  {selectedAccountant === accountant.id && (
                    <div className="ml-auto">
                      <CheckIcon className="w-5 h-5 text-amber-500" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Service</h2>
          <div className="space-y-3">
            {serviceTypes.map((service) => (
              <div
                key={service.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedService === service.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                }`}
                onClick={() => setSelectedService(service.id)}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Duration: {service.duration} minutes</p>
                  </div>
                  {selectedService === service.id && (
                    <div className="ml-4">
                      <CheckIcon className="w-5 h-5 text-amber-500" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={!selectedAccountant || !selectedService}
            onClick={() => setStep(2)}
          >
            Next: Select Date & Time
          </button>
        </div>
      </div>
    );
    
    // Render step 2: Select date and time
    const renderStep2 = () => (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Date</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {availableDates.map((date) => (
              <div
                key={date.toISOString()}
                className={`p-3 border rounded-lg text-center cursor-pointer transition-colors ${
                  format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                    ? 'border-amber-500 bg-amber-50'
                    : isDateSelectable(date)
                    ? 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                    : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => isDateSelectable(date) && setSelectedDate(date)}
              >
                <div className="text-xs font-medium text-gray-500">{format(date, 'EEE')}</div>
                <div className="text-lg font-semibold text-gray-900">{format(date, 'd')}</div>
                <div className="text-xs text-gray-500">{format(date, 'MMM')}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Time</h2>
          {timeSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`p-2 border rounded-lg text-center cursor-pointer transition-colors ${
                    selectedTimeSlot && selectedTimeSlot.startTime === slot.startTime
                      ? 'border-amber-500 bg-amber-50'
                      : slot.available
                      ? 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={() => slot.available && setSelectedTimeSlot(slot)}
                >
                  <div className="text-sm font-medium">
                    {formatTime(slot.startTime)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No available time slots for the selected date.</p>
          )}
        </div>
        
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Additional Notes (Optional)</h2>
          <textarea
            rows={3}
            className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2"
            placeholder="Add any specific details or questions for your appointment..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            onClick={() => setStep(1)}
          >
            Back
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={!selectedTimeSlot}
            onClick={() => setStep(3)}
          >
            Next: Review & Confirm
          </button>
        </div>
      </div>
    );
    
    // Render step 3: Review and confirm
    const renderStep3 = () => {
      const accountant = accountants.find(a => a.id === selectedAccountant);
      const service = serviceTypes.find(s => s.id === selectedService);
      
      return (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-amber-800 mb-2">Appointment Summary</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <UserIcon className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Accountant</p>
                  <p className="text-base text-gray-900">{accountant?.name}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Service</p>
                  <p className="text-base text-gray-900">{service?.name}</p>
                  <p className="text-sm text-gray-500">{service?.description}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CalendarIcon className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Date</p>
                  <p className="text-base text-gray-900">{formatDateForDisplay(selectedDate)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <ClockIcon className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Time</p>
                  <p className="text-base text-gray-900">
                    {selectedTimeSlot ? `${formatTime(selectedTimeSlot.startTime)} - ${formatTime(selectedTimeSlot.endTime)}` : ''}
                  </p>
                </div>
              </div>
              
              {notes && (
                <div className="flex items-start">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Additional Notes</p>
                    <p className="text-base text-gray-900">{notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You will receive a confirmation email with the meeting details.</li>
                    <li>A Google Meet link will be provided 15 minutes before the appointment.</li>
                    <li>You can reschedule or cancel this appointment up to 24 hours before the scheduled time.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              onClick={() => setStep(2)}
              disabled={submitting}
            >
              Back
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scheduling...
                </>
              ) : (
                'Confirm Appointment'
              )}
            </button>
          </div>
        </div>
      );
    };
    
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Schedule an Appointment</h1>
                  <p className="text-sm text-gray-600">Book a meeting with one of our expert accountants</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Progress steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      step >= 1 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      1
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">Select</div>
                      <div className="text-xs text-gray-500">Accountant & Service</div>
                    </div>
                  </div>
                  
                  <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
                  
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      step >= 2 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      2
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">Schedule</div>
                      <div className="text-xs text-gray-500">Date & Time</div>
                    </div>
                  </div>
                  
                  <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
                  
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      step >= 3 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      3
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">Confirm</div>
                      <div className="text-xs text-gray-500">Review & Book</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Step content */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                </div>
              ) : (
                <>
                  {step === 1 && renderStep1()}
                  {step === 2 && renderStep2()}
                  {step === 3 && renderStep3()}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };
  
  export default ScheduleAppointmentPage;