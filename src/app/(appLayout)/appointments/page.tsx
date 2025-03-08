'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { meetingLocation } from '@/helper/meetingLocation';

const AppointmentsPage = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const router = useRouter();

  const handleLocationSelect = (locationId:any) => {
    setSelectedLocation(locationId);
    router.push(`/appointments/${locationId}`);
  };

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-6xl">
      <motion.div 
        className="mb-6 md:mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-500">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Book an Appointment</h1>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Choose a location and schedule a meeting with our professional accountants
        </p>
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

      {/* Contact Information - Moved to top */}
      <motion.div 
        className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="p-5 md:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <PhoneIcon className="w-5 h-5 mt-0.5 text-amber-500" />
              <div>
                <p className="font-medium text-gray-800">Phone</p>
                <p className="text-gray-600">1300 811 002</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <EnvelopeIcon className="w-5 h-5 mt-0.5 text-amber-500" />
              <div>
                <p className="font-medium text-gray-800">Email</p>
                <p className="text-gray-600">info@provenaccountants.com.au</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ClockIcon className="w-5 h-5 mt-0.5 text-amber-500" />
              <div>
                <p className="font-medium text-gray-800">Business Hours</p>
                <p className="text-gray-600">10:00 AM – 6:00 PM*</p>
                <p className="text-sm text-gray-500">Monday to Saturday | Other timings, Please Call</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Office Locations - Updated with more modern design */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Select a Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {meetingLocation.map((location:any, index:any) => (
            <motion.div 
              key={location.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:border-amber-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => handleLocationSelect(location.id)}
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                    <MapPinIcon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">{location.name}</h2>
                </div>
                
                <div className="mb-4 flex items-start gap-2 text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                  <span>{location.hours}</span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLocationSelect(location.id);
                  }}
                  className="w-full mt-2 inline-flex items-center justify-center px-4 py-3 border border-amber-300 text-sm font-medium rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  <CalendarIcon className="w-4 h-4 mr-1.5" />
                  Book Appointment
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AppointmentsPage;