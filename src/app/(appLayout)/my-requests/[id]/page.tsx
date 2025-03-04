'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
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
import { doc, getDoc, deleteDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { getCurrentUser } from '@/lib/firebaseService';
import { Toaster, toast } from 'sonner';
import { User } from 'firebase/auth';

// Define the request interface
interface ServiceRequest {
  id: string;
  serviceId?: number;
  serviceName: string;
  status: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'completed';
  createdAt: any;
  updatedAt?: any;
  details: any;
  category: string;
  notes?: string;
  adminNotes?: string;
  collectionName: string;
}

// Define Firebase Timestamp interface
interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

// Service name mapping
const serviceNames = {
  'atoRegistrations': 'ATO Registration',
  'businessRegistrations': 'Business Registration',
  'trustRegistrations': 'Trust Registration',
  'companyRegistrations': 'Company Registration',
  'noticeAssessments': 'Notice of Assessment',
  'taxReturnCopies': 'Tax Return Copy',
  'basLodgements': 'BAS Lodgement Copy',
  'atoPortals': 'ATO Portal Copy',
  'paymentPlans': 'Payment Plan',
  'addressUpdates': 'Address Update'
};

// Service category mapping
const serviceCategories = {
  'atoRegistrations': 'Registration',
  'businessRegistrations': 'Registration',
  'trustRegistrations': 'Registration',
  'companyRegistrations': 'Registration',
  'noticeAssessments': 'Documentation',
  'taxReturnCopies': 'Documentation',
  'basLodgements': 'Documentation',
  'atoPortals': 'Documentation',
  'paymentPlans': 'Management',
  'addressUpdates': 'Management'
};

// Message interface
interface Message {
  id: string;
  text: string;
  createdAt: any;
  userId: string;
  userName: string;
  isAdmin: boolean;
}

const RequestDetailPage = () => {
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const collectionName = searchParams?.get('collection') || '';

  // Fetch user and request details
  useEffect(() => {
    const fetchUserAndRequest = async () => {
      try {
        const currentUser = await getCurrentUser() as User | null;
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }
        setUser(currentUser);

        await fetchRequestDetails(currentUser);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load request details');
      }
    };

    fetchUserAndRequest();
  }, [id, collectionName, router]);

  // Fetch request details from Firestore
  const fetchRequestDetails = async (currentUser: User) => {
    try {
      setLoading(true);
      
      if (!id || !collectionName) {
        router.push('/my-requests');
        return;
      }

      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Verify this request belongs to the current user
        if (data.userId !== currentUser.uid) {
          toast.error('You do not have permission to view this request');
          router.push('/my-requests');
          return;
        }
        
        setRequest({
          id: docSnap.id,
          serviceName: serviceNames[collectionName as keyof typeof serviceNames] || collectionName,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          details: data,
          category: serviceCategories[collectionName as keyof typeof serviceCategories] || 'Other',
          notes: data.notes,
          adminNotes: data.adminNotes,
          collectionName
        });
      } else {
        toast.error('Request not found');
        router.push('/my-requests');
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      toast.error('Failed to load request details');
      router.push('/my-requests');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete request
  const handleDeleteRequest = async () => {
    try {
      if (!id || !collectionName) return;
      
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      
      toast.success('Request deleted successfully');
      router.push('/my-requests');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user) return;
    
    try {
      await addDoc(collection(db, 'messages'), {
        text: message.trim(),
        requestId: id,
        collectionName: collectionName,
        userId: user.uid,
        userName: user.displayName || 'User',
        isAdmin: false,
        createdAt: serverTimestamp()
      });
      
      setMessage('');
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
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
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-4 h-4 mr-1.5" />
            {status === 'in-progress' ? 'In Progress' : 'Pending'}
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
      <Toaster position="top-right" />
      
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
                {Object.entries(request.details).map(([key, value]) => {
                  // Skip internal fields
                  if (['userId', 'userEmail', 'userName', 'createdAt', 'updatedAt', 'status', 'notes', 'adminNotes'].includes(key)) {
                    return null;
                  }
                  
                  // Handle boolean values
                  if (typeof value === 'boolean') {
                    return (
                      <div key={key} className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 mb-1">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-base text-gray-900">{value ? 'Yes' : 'No'}</span>
                      </div>
                    );
                  }
                  
                  // Handle array values
                  if (Array.isArray(value)) {
                    return (
                      <div key={key} className="flex flex-col col-span-2">
                        <span className="text-sm font-medium text-gray-500 mb-1">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </span>
                        <div className="space-y-2">
                          {value.map((item, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-md">
                              {Object.entries(item).map(([itemKey, itemValue]) => (
                                <div key={itemKey} className="mb-1">
                                  <span className="font-medium text-gray-700">{itemKey.charAt(0).toUpperCase() + itemKey.slice(1)}: </span>
                                  <span>{String(itemValue)}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  // Handle object values (excluding arrays and timestamps)
                  if (typeof value === 'object' && value !== null && !Array.isArray(value) && 
                      !(value && 'seconds' in value && 'nanoseconds' in value)) {
                    return (
                      <div key={key} className="flex flex-col col-span-2">
                        <span className="text-sm font-medium text-gray-500 mb-1">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </span>
                        <div className="p-3 bg-gray-50 rounded-md">
                          {Object.entries(value).map(([objKey, objValue]) => (
                            <div key={objKey} className="mb-1">
                              <span className="font-medium text-gray-700">{objKey.charAt(0).toUpperCase() + objKey.slice(1)}: </span>
                              <span>{String(objValue)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  // Handle timestamp values
                  if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
                    return (
                      <div key={key} className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 mb-1">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-base text-gray-900">{formatDate(value)}</span>
                      </div>
                    );
                  }
                  
                  // Default string representation
                  return (
                    <div key={key} className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="text-base text-gray-900">{String(value)}</span>
                    </div>
                  );
                })}
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