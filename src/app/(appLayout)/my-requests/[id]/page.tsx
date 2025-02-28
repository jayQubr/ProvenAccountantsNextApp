'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// Define the request interface
interface ServiceRequest {
  id: string;
  serviceId: number;
  serviceName: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: any;
  updatedAt?: any;
  details: any;
  category: string;
  notes?: string;
  adminNotes?: string;
}

// Mock data for development - will be replaced with Firebase data
const mockRequests: { [key: string]: ServiceRequest } = {
  '1': {
    id: '1',
    serviceId: 1,
    serviceName: 'ATO Registration',
    status: 'pending',
    createdAt: { seconds: Date.now() / 1000 - 86400 }, // 1 day ago
    details: { 
      taxFileNumber: '123456789', 
      businessName: 'Example Business',
      businessType: 'Sole Trader',
      contactNumber: '0412 345 678',
      email: 'example@business.com',
      address: '123 Business St, Sydney NSW 2000'
    },
    category: 'Registration',
    notes: 'Please process this registration as soon as possible.'
  },
  '2': {
    id: '2',
    serviceId: 5,
    serviceName: 'Notice Assessment',
    status: 'approved',
    createdAt: { seconds: Date.now() / 1000 - 172800 },
    updatedAt: { seconds: Date.now() / 1000 - 86400 },
    details: { 
      assessmentYear: '2023', 
      referenceNumber: 'REF123456',
      taxFileNumber: '987654321',
      fullName: 'John Smith',
      contactNumber: '0412 345 678',
      email: 'john@example.com'
    },
    category: 'Documentation',
    notes: 'Need this for my home loan application.',
    adminNotes: 'Approved. Documents will be sent via email.'
  },
  '3': {
    id: '3',
    serviceId: 9,
    serviceName: 'Payment Plan',
    status: 'completed',
    createdAt: { seconds: Date.now() / 1000 - 259200 },
    updatedAt: { seconds: Date.now() / 1000 - 43200 }, 
    details: { 
      amount: '$5,000', 
      paymentPlan: 'Monthly',
      taxFileNumber: '456789123',
      fullName: 'Sarah Johnson',
      contactNumber: '0412 987 654',
      email: 'sarah@example.com',
      reason: 'Cash flow issues due to COVID-19'
    },
    category: 'Management',
    notes: 'I need this payment plan urgently.',
    adminNotes: 'Payment plan has been set up. First payment due on 15th of next month.'
  },
  '4': {
    id: '4',
    serviceId: 6,
    serviceName: 'Tax Return Copy',
    status: 'rejected',
    createdAt: { seconds: Date.now() / 1000 - 345600 }, 
    updatedAt: { seconds: Date.now() / 1000 - 172800 },
    details: { 
      year: '2022', 
      reason: 'Loan Application',
      taxFileNumber: '789123456',
      fullName: 'Michael Brown',
      contactNumber: '0413 456 789',
      email: 'michael@example.com'
    },
    category: 'Documentation',
    notes: 'Need this for bank loan application.',
    adminNotes: 'Rejected. The tax return for this year has not been lodged yet. Please lodge your tax return first.'
  }
};

const RequestDetailPage = () => {
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // Fetch request details from Firebase
  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        
        if (mockRequests[id]) {
          setRequest(mockRequests[id]);
        } else {
          router.push('/my-requests');
        }

      } catch (error) {
        console.error('Error fetching request details:', error);
        router.push('/my-requests');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRequestDetails();
    }
  }, [id, router]);

  // Handle delete request
  const handleDeleteRequest = async () => {
    try {

      router.push('/my-requests');

    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    try {
      setMessage('');
      alert('Message sent successfully!');
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Format date from Firebase timestamp
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-4 h-4 mr-1.5" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <CheckCircleIcon className="w-4 h-4 mr-1.5" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <ExclamationCircleIcon className="w-4 h-4 mr-1.5" />
            Rejected
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-4 h-4 mr-1.5" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <ClockIcon className="w-4 h-4 mr-1.5" />
            Unknown
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-4xl">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            <span>Back to Requests</span>
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded-full w-24"></div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="h-5 bg-gray-200 rounded w-full"></div>
            <div className="h-5 bg-gray-200 rounded w-5/6"></div>
            <div className="h-5 bg-gray-200 rounded w-4/6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-1">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-5 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
          
          <div className="h-32 bg-gray-200 rounded w-full mb-6"></div>
          
          <div className="flex justify-between">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-4xl">
        <div className="flex items-center mb-6">
          <Link
            href="/my-requests"
            className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            <span>Back to Requests</span>
          </Link>
        </div>
        
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <ClipboardDocumentListIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Request not found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            The request you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link 
            href="/my-requests"
            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
          >
            Back to My Requests
          </Link>
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
            href="/my-requests"
            className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            <span>Back to Requests</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 mt-1">
                  <DocumentTextIcon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 mb-1">{request.serviceName}</h1>
                  <p className="text-sm text-gray-500 mb-2">
                    Category: <span className="font-medium text-indigo-600">{request.category}</span>
                  </p>
                  {getStatusBadge(request.status)}
                </div>
              </div>
              
              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium flex items-center"
                >
                  <TrashIcon className="w-4 h-4 mr-1.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
          
          {/* Request Details */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {Object.entries(request.details).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-base text-gray-900">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Request Timeline */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mt-0.5">
                    <CalendarDaysIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Request Submitted</p>
                    <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                  </div>
                </div>
                
                {request.updatedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mt-0.5">
                      <ClockIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Status Updated</p>
                      <p className="text-xs text-gray-500">{formatDate(request.updatedAt)}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Status changed to <span className="font-medium">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Notes */}
            {(request.notes || request.adminNotes) && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                
                {request.notes && (
                  <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-1">Your Notes:</p>
                    <p className="text-sm text-gray-600">{request.notes}</p>
                  </div>
                )}
                
                {request.adminNotes && (
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <p className="text-sm font-medium text-indigo-700 mb-1">Admin Notes:</p>
                    <p className="text-sm text-indigo-600">{request.adminNotes}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Contact Form */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
              
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label htmlFor="message" className="sr-only">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    className="block w-full rounded-md border border-gray-200 py-2 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PaperAirplaneIcon className="w-4 h-4 mr-1.5" />
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Request</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this request? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRequest}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RequestDetailPage; 