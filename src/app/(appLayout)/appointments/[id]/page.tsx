'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { 
  ClockIcon, 
  MapPinIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { meetingLocation } from '@/helper/meetingLocation';

const AppointmentPage = () => {
  const params = useParams<any>();
  const router = useRouter();
  const [location, setLocation] = useState<any>(null);
  
  useEffect(() => {
    const locationId = params.id;
    const foundLocation = meetingLocation.find((loc:any) => loc.id === locationId);
    
    if (foundLocation) {
      setLocation(foundLocation);
    } else {
      router.push('/appointments');
    }
  }, [params.id, router]);

  if (!location) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-6xl">
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button 
          onClick={() => router.push('/appointments')}
          className="flex items-center text-amber-600 hover:text-amber-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          <span>Back to Locations</span>
        </button>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-500">
            <MapPinIcon className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Book at {location.name}</h1>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <ClockIcon className="w-4 h-4 text-amber-500" />
          <span>{location.hours}</span>
        </div>
      </motion.div>

      {/* Important Notice */}
      <motion.div 
        className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-amber-800">Important Notice</h3>
            <p className="text-amber-700 text-sm">All New Clients for preparation of Tax Return need to pay upfront before starting the job.</p>
          </div>
        </div>
      </motion.div>

      {/* Booking Calendar */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Book Your Appointment</h2>
          <p className="text-sm text-gray-600">Select a convenient date and time below</p>
        </div>
        <div className="aspect-video md:aspect-auto md:h-[700px] w-full bg-white">
          <iframe 
            src={location.calendarLink}
            frameBorder="0"
            className="w-full h-full"
            title="Schedule Appointment"
          ></iframe>
        </div>
      </motion.div>
    </div>
  );
};

export default AppointmentPage;