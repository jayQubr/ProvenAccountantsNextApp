import { collection, query, where, getDocs, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { 
  DocumentTextIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  DocumentDuplicateIcon,
  ArrowPathRoundedSquareIcon,
  MapPinIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  DocumentCheckIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

// Service category mapping
export const serviceCategories = {
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
export const serviceNames = {
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

// Get icon based on collection name
export const getServiceIcon = (collectionName: string) => {
  switch (collectionName) {
    case 'atoRegistrations':
      return IdentificationIcon;
    case 'businessRegistrations':
      return BuildingOfficeIcon;
    case 'trustRegistrations':
      return ShieldCheckIcon;
    case 'companyRegistrations':
      return BriefcaseIcon;
    case 'noticeAssessments':
      return DocumentCheckIcon;
    case 'taxReturnCopies':
      return DocumentDuplicateIcon;
    case 'basLodgements':
      return DocumentTextIcon;
    case 'atoPortals':
      return ArrowPathRoundedSquareIcon;
    case 'paymentPlans':
      return CreditCardIcon;
    case 'addressUpdates':
      return MapPinIcon;
    default:
      return DocumentTextIcon;
  }
};

// Format date from Firebase timestamp
export const formatDate = (timestamp: any) => {
  if (!timestamp) return 'Unknown date';
  
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format relative date (e.g., "Today", "Yesterday", "2 days ago")
export const formatRelativeDate = (timestamp: any) => {
  if (!timestamp) return 'Unknown date';
  
  const date = new Date(timestamp.seconds * 1000);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return formatDate(timestamp);
  }
};

// Get status color based on status
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-blue-100 text-blue-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Format status text
export const formatStatus = (status: string) => {
  if (status === 'in-progress') return 'In Progress';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Fetch user requests from Firestore
export const fetchUserRequests = async (userId: string, limit = 0) => {
  try {
    const allRequests: any[] = [];
    
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
      let q;
      
      if (limit > 0) {
        q = query(
          collectionRef, 
          where("userId", "==", userId),
          firestoreLimit(limit)
        );
      } else {
        q = query(
          collectionRef, 
          where("userId", "==", userId)
        );
      }
      
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
          collectionName,
          // Additional fields for dashboard display
          type: 'request',
          title: serviceNames[collectionName as keyof typeof serviceNames] || collectionName,
          date: formatRelativeDate(data.createdAt),
          icon: getServiceIcon(collectionName),
          href: `/my-requests/${doc.id}?collection=${collectionName}`,
          statusColor: getStatusColor(data.status),
          statusText: formatStatus(data.status)
        });
      });
    }

    // Sort requests by createdAt timestamp in descending order (newest first)
    allRequests.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    return { success: true, data: allRequests };
  } catch (error) {
    console.error('Error fetching requests:', error);
    return { success: false, error };
  }
};