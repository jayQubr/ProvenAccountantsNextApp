'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeftIcon, CalendarIcon, ClockIcon, 
  CheckIcon, ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { format, addDays, startOfDay, isBefore } from 'date-fns';

// Simplified interfaces
interface Appointment {
  id: string;
  title: string;
  date: any;
  startTime: string;
  endTime: string;
  status: string;
  accountantName: string;
  serviceType: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

// Mock appointment data (simplified)
let mockAppointments:any = {
  '1': {
    id: '1',
    title: 'Tax Planning Consultation',
    date: { seconds: Date.now() / 1000 + 86400 * 3 },
    startTime: '10:00',
    endTime: '10:30',
    status: 'scheduled',
    accountantName: 'Sarah Johnson',
    serviceType: 'Consultation'
  }
};

const RescheduleAppointmentPage = () => {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Generate available dates (next 14 days)
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i));
  
  // Fetch appointment data
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        
        // For development, use mock data
        if (appointmentId && mockAppointments[appointmentId]) {
          const appt = mockAppointments[appointmentId];
          setAppointment(appt);
          
          // Set initial selected date to the appointment date
          const apptDate = new Date(appt.date.seconds * 1000);
          setSelectedDate(startOfDay(apptDate));
        } else {
          setError('Appointment not found.');
        }
        
        /* Production code would use Firebase
        const appointmentRef = doc(db, 'appointments', appointmentId);
        const appointmentSnap = await getDoc(appointmentRef);
        
        if (appointmentSnap.exists()) {
          const appointmentData = appointmentSnap.data();
          setAppointment({
            id: appointmentSnap.id,
            ...appointmentData
          } as Appointment);
          
          const apptDate = new Date(appointmentData.date.seconds * 1000);
          setSelectedDate(startOfDay(apptDate));
        } else {
          setError('Appointment not found.');
        }
        */
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to load appointment details.');
      } finally {
        setLoading(false);
      }
    };
    
    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);
  
  // Generate time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      // Generate mock time slots (30-minute intervals from 9 AM to 5 PM)
      const slots: TimeSlot[] = [];
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const endHour = minute + 30 >= 60 ? hour + 1 : hour;
          const endMinute = (minute + 30) % 60;
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
          
          slots.push({
            startTime,
            endTime,
            available: Math.random() > 0.3 // Randomly mark some as unavailable
          });
        }
      }
      setTimeSlots(slots);
    }
  }, [selectedDate]);
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!appointment || !selectedDate || !selectedTimeSlot) {
      setError('Please select a date and time.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // For development, simulate success
      setTimeout(() => {
        setSubmitting(false);
        router.push(`/appointments/${appointmentId}`);
      }, 1000);
      
      /* Production code would use Firebase
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        date: new Date(format(selectedDate, 'yyyy-MM-dd')),
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        status: 'rescheduled',
        updatedAt: serverTimestamp()
      });
      
      router.push(`/appointments/${appointmentId}`);
      */
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      setError('Failed to reschedule appointment.');
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
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }
  
  if (error || !appointment) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-center flex-col py-8">
            <ExclamationCircleIcon className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{error || 'Appointment Not Found'}</h2>
            <Link
              href="/appointments"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700"
            >
              Return to Appointments
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center mb-6">
          <Link
            href={`/appointments/${appointmentId}`}
            className="flex items-center text-amber-600 hover:text-amber-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            <span>Back to Appointment</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Reschedule Appointment</h1>
                <p className="text-sm text-gray-600">{appointment.title}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a New Date</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {availableDates.map((date) => (
                    <div
                      key={date.toISOString()}
                      className={`p-3 border rounded-lg text-center cursor-pointer ${
                        selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className="text-xs font-medium text-gray-500">{format(date, 'EEE')}</div>
                      <div className="text-lg font-semibold text-gray-900">{format(date, 'd')}</div>
                      <div className="text-xs text-gray-500">{format(date, 'MMM')}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a New Time</h2>
                {timeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className={`p-2 border rounded-lg text-center cursor-pointer ${
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
              
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={!selectedDate || !selectedTimeSlot || submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Rescheduling...
                    </>
                  ) : (
                    'Confirm New Time'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RescheduleAppointmentPage;