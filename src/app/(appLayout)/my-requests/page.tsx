'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ClipboardDocumentListIcon, 
  EyeIcon, 
  TrashIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
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

const MyRequestsPage = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch requests from Firebase
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        
        const user = await getCurrentUser() as User | null;
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const allRequests: ServiceRequest[] = [];
        
        // Collections to fetch from
        const collections = [
          'atoRegistrations',
          'businessRegistrations',
          'trustRegistrations',
          'companyRegistrations',
          'noticeAssessments',
          'taxReturnCopies',
          'basLodgements',
          'atoPortals',
          'paymentPlans',
          'addressUpdates'
        ];

        // Fetch from each collection
        for (const collectionName of collections) {
          const collectionRef = collection(db, collectionName);
          const q = query(
            collectionRef, 
            where("userId", "==", user.uid as string)
            // Removed orderBy to avoid needing composite indexes
          );
          
          const querySnapshot = await getDocs(q);
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            allRequests.push({
              id: doc.id,
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
          });
        }

        // Sort requests by createdAt timestamp in descending order (newest first)
        allRequests.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setRequests(allRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast.error('Failed to load your requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [router]);

  // Filter requests based on search term and status filter
  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      request.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle delete request
  const handleDeleteRequest = async (id: string, collectionName: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      
      setRequests(requests.filter(req => req.id !== id));
      setDeleteConfirmId(null);
      toast.success('Request deleted successfully');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  // Format date from Firebase timestamp
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            {status === 'in-progress' ? 'In Progress' : 'Pending'}
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ExclamationCircleIcon className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-6xl">
      <Toaster position="top-right" />
      
      <motion.div 
        className="mb-6 md:mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-500">
            <ClipboardDocumentListIcon className="w-5 h-5" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">My Requests</h1>
        </div>
        <p className="text-sm text-gray-600">
          View and manage all your service requests in one place
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
            <label htmlFor="search" className="sr-only">Search requests</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Search by service name or category..."
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Requests List */}
      <motion.div
        className="space-y-4"
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
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
              }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 mt-1">
                      <DocumentTextIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.serviceName}</h3>
                      <p className="text-xs text-gray-500 mb-1">
                        Category: <span className="font-medium text-indigo-600">{request.category}</span>
                      </p>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-gray-600">
                  {/* Display some key request details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(request.details).slice(0, 4).map(([key, value]) => {
                      // Skip internal fields
                      if (['userId', 'userEmail', 'userName', 'createdAt', 'updatedAt', 'status', 'notes', 'adminNotes'].includes(key)) {
                        return null;
                      }
                      
                      // Handle boolean values
                      if (typeof value === 'boolean') {
                        return (
                          <div key={key} className="flex items-start">
                            <span className="font-medium text-gray-700 mr-2">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</span>
                            <span>{value ? 'Yes' : 'No'}</span>
                          </div>
                        );
                      }
                      
                      // Skip object and array values
                      if (typeof value === 'object' && value !== null) {
                        return null;
                      }
                      
                      return (
                        <div key={key} className="flex items-start">
                          <span className="font-medium text-gray-700 mr-2">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</span>
                          <span>{String(value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Requested on {formatDate(request.createdAt)}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/my-requests/${request.id}?collection=${request.collectionName}`)}
                      className="p-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                      aria-label="View request details"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(request.id)}
                      className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      aria-label="Delete request"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Delete confirmation */}
              <AnimatePresence>
                {deleteConfirmId === request.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 px-4 py-3 border-t border-red-100"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                      <p className="text-sm text-red-700">Are you sure you want to delete this request?</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1 text-xs font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(request.id, request.collectionName)}
                          className="px-3 py-1 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        ) : (
          // No requests found
          <motion.div
            className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
            }}
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ClipboardDocumentListIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No requests found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchTerm || statusFilter !== 'all'
                ? "Try adjusting your search or filter to find what you're looking for."
                : "You haven't made any service requests yet."}
            </p>
            {searchTerm || statusFilter !== 'all' ? (
              <button 
                onClick={() => {setSearchTerm(''); setStatusFilter('all');}}
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
              >
                Reset filters
              </button>
            ) : (
              <Link 
                href="/services"
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors inline-flex items-center"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Browse Services
              </Link>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MyRequestsPage;