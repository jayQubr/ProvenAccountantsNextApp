'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  CalendarIcon, 
  ClockIcon, 
  VideoCameraIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

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
}

// Mock data for development - will be replaced with Firebase data
const mockAppointments: Appointment[] = [
  {
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
    serviceType: 'Consultation'
  },
  {
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
    serviceType: 'Document Review'
  },
  {
    id: '3',
    title: 'ATO Registration Assistance',
    description: 'Help with completing ATO registration forms',
    date: { seconds: Date.now() / 1000 - 86400 * 5 }, // 5 days ago
    startTime: '11:30',
    endTime: '12:15',
    status: 'cancelled',
    accountantName: 'David Wilson',
    accountantPhotoURL: 'https://randomuser.me/api/portraits/men/67.jpg',
    serviceType: 'Registration'
  },
  {
    id: '4',
    title: 'Tax Return Consultation',
    description: 'Discussion about your tax return requirements',
    date: { seconds: Date.now() / 1000 + 86400 * 7 }, // 7 days from now
    startTime: '15:30',
    endTime: '16:00',
    status: 'rescheduled',
    meetingLink: 'https://meet.google.com/mno-pqrs-tuv',
    accountantName: 'Emma Thompson',
    accountantPhotoURL: 'https://randomuser.me/api/portraits/women/22.jpg',
    serviceType: 'Consultation'
  }
];

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch appointments from Firebase
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // For development, use mock data
        // In production, uncomment the Firebase code below
        
        setAppointments(mockAppointments);
        
        /* Uncomment for production
        const user = auth.currentUser;
        if (!user) {
          router.push('/login');
          return;
        }

        const appointmentsRef = collection(db, 'appointments');
        const q = query(
          appointmentsRef,
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const fetchedAppointments: Appointment[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedAppointments.push({
            id: doc.id,
            ...doc.data()
          } as Appointment);
        });
        
        setAppointments(fetchedAppointments);
        */
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [router]);

  // Filter appointments based on search term and status filter
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = 
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.accountantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort appointments: upcoming first, then past
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const now = Date.now() / 1000;
    const aIsUpcoming = a.date.seconds > now;
    const bIsUpcoming = b.date.seconds > now;
    
    if (aIsUpcoming && !bIsUpcoming) return -1;
    if (!aIsUpcoming && bIsUpcoming) return 1;
    
    // Both are upcoming or both are past, sort by date
    return b.date.seconds - a.date.seconds;
  });

  // Group appointments by upcoming and past
  const upcomingAppointments = sortedAppointments.filter(
    app => app.date.seconds > Date.now() / 1000 && app.status !== 'cancelled'
  );
  
  const pastAppointments = sortedAppointments.filter(
    app => app.date.seconds <= Date.now() / 1000 || app.status === 'cancelled'
  );

  // Handle cancel appointment
  const handleCancelAppointment = async (id: string) => {
    try {
      // For development, just update the status
      setAppointments(appointments.map(app => 
        app.id === id ? { ...app, status: 'cancelled' as const } : app
      ));
      setCancelConfirmId(null);
      
      /* Uncomment for production
      const appointmentRef = doc(db, 'appointments', id);
      await updateDoc(appointmentRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
      
      setAppointments(appointments.map(app => 
        app.id === id ? { ...app, status: 'cancelled' } : app
      ));
      setCancelConfirmId(null);
      */
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  // Format date from Firebase timestamp
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if date is today
  const isToday = (timestamp: any) => {
    if (!timestamp) return false;
    
    const date = new Date(timestamp.seconds * 1000);
    const today = new Date();
    
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
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

  // Get status badge based on status
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ArrowPathIcon className="w-3 h-3 mr-1" />
            Rescheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <ExclamationCircleIcon className="w-3 h-3 mr-1" />
            Unknown
          </span>
        );
    }
  };

  // Render appointment card
  const renderAppointmentCard = (appointment: Appointment) => (
    <motion.div
      key={appointment.id}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 mt-1">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{appointment.title}</h3>
              <p className="text-xs text-gray-500 mb-1">
                Type: <span className="font-medium text-amber-600">{appointment.serviceType}</span>
              </p>
              {getStatusBadge(appointment.status)}
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          <p className="mb-2">{appointment.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
              <span className={isToday(appointment.date) ? "font-medium text-green-600" : ""}>
                {isToday(appointment.date) ? "Today" : formatDate(appointment.date)}
              </span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
              <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
            </div>
          </div>
          
          <div className="flex items-center mt-2">
            {appointment.accountantPhotoURL ? (
              <img 
                src={appointment.accountantPhotoURL} 
                alt={appointment.accountantName}
                className="w-6 h-6 rounded-full mr-2 object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-2">
                {appointment.accountantName.charAt(0)}
              </div>
            )}
            <span>Accountant: {appointment.accountantName}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
          {appointment.status === 'scheduled' && appointment.meetingLink ? (
            <a 
              href={appointment.meetingLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center"
            >
              <VideoCameraIcon className="w-4 h-4 mr-1" />
              Join Meeting
            </a>
          ) : (
            <div className="text-xs text-gray-500">
              {appointment.status === 'scheduled' ? 'Meeting link will be available soon' : ''}
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={() => router.push(`/appointments/${appointment.id}`)}
              className="p-1.5 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
              aria-label="View appointment details"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            
            {appointment.status === 'scheduled' && (
              <>
                <button
                  onClick={() => router.push(`/appointments/edit/${appointment.id}`)}
                  className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  aria-label="Edit appointment"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCancelConfirmId(appointment.id)}
                  className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  aria-label="Cancel appointment"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Cancel confirmation */}
      <AnimatePresence>
        {cancelConfirmId === appointment.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 px-4 py-3 border-t border-red-100"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-sm text-red-700">Are you sure you want to cancel this appointment?</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCancelConfirmId(null)}
                  className="px-3 py-1 text-xs font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                >
                  No, Keep It
                </button>
                <button
                  onClick={() => handleCancelAppointment(appointment.id)}
                  className="px-3 py-1 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

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
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">My Appointments</h1>
          </div>
          <Link
            href="/appointments/schedule"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <PlusIcon className="w-4 h-4 mr-1.5" />
            Schedule
          </Link>
        </div>
        <p className="text-sm text-gray-600">
          View and manage your scheduled appointments with our accountants
        </p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div 
        className="mb-6 bg-white rounded-xl shadow-sm p-4 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-2/3">
            <label htmlFor="search" className="sr-only">Search appointments</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-amber-500 focus:border-amber-500 text-sm"
                placeholder="Search by title, accountant, or type..."
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <label htmlFor="status" className="sr-only">Filter by status</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="status"
                name="status"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Appointments List */}
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        {loading ? (
          // Loading skeleton
          [...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredAppointments.length > 0 ? (
          <>
            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-amber-500" />
                  Upcoming Appointments
                </h2>
                <div className="space-y-4">
                  {upcomingAppointments.map(renderAppointmentCard)}
                </div>
              </div>
            )}
            
            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2 text-gray-500" />
                  Past Appointments
                </h2>
                <div className="space-y-4">
                  {pastAppointments.map(renderAppointmentCard)}
                </div>
              </div>
            )}
          </>
        ) : (
          // No appointments found
          <motion.div
            className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
            }}
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <CalendarIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No appointments found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchTerm || statusFilter !== 'all'
                ? "Try adjusting your search or filter to find what you're looking for."
                : "You don't have any appointments scheduled yet."}
            </p>
            {searchTerm || statusFilter !== 'all' ? (
              <button 
                onClick={() => {setSearchTerm(''); setStatusFilter('all');}}
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
              >
                Reset filters
              </button>
            ) : (
              <Link 
                href="/appointments/schedule"
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors inline-flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Link>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AppointmentsPage;