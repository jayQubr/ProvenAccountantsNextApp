import { motion } from 'framer-motion';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { RegistrationStatus } from '@/lib/registrationService';

interface RegistrationStatusBannerProps {
  status: RegistrationStatus;
  title: string;
  createdAt?: any;
  notes?: string;
  type: string;
  updatedAt?: any;
}

const statusColors: Record<RegistrationStatus, { bg: string, text: string, icon: any }> = {
  'pending': { 
    bg: 'bg-amber-50', 
    text: 'text-amber-700',
    icon: <ClockIcon className="w-5 h-5 text-amber-500" />
  },
  'in-progress': { 
    bg: 'bg-blue-50', 
    text: 'text-blue-700',
    icon: <ClockIcon className="w-5 h-5 text-blue-500" />
  },
  'completed': { 
    bg: 'bg-green-50', 
    text: 'text-green-700',
    icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />
  },
  'rejected': { 
    bg: 'bg-red-50', 
    text: 'text-red-700',
    icon: <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
  }
};

const RegistrationStatusBanner = ({ 
  status, 
  title,
  createdAt, 
  notes,
  type,
  updatedAt
}: RegistrationStatusBannerProps) => {
  const statusColor = statusColors[status];
  const borderColor = status === 'completed' 
    ? 'border-green-200' 
    : status === 'rejected' 
      ? 'border-red-200' 
      : status === 'in-progress'
        ? 'border-blue-200'
        : 'border-amber-200';

  return (
    <motion.div
      className={`mb-6 p-4 rounded-lg border ${statusColor?.bg} ${statusColor?.text} ${borderColor}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {statusColor?.icon}
        </div>
        <div>
          <h3 className="font-medium">
            {status === 'pending' && `Your ${title} request is pending`}
            {status === 'in-progress' && `Your ${title} is being processed`}
            {status === 'completed' && `Your ${title} has been completed`}
            {status === 'rejected' && `Your ${title} request was not approved`}
          </h3>
          <p className="text-sm mt-1">
            {status === 'pending' && 'We have received your request and will process it soon.'}
            {status === 'in-progress' && `Our team is currently working on your ${type} registration.`}
            {status === 'completed' && `Your ${type} registration has been successfully processed.`}
            {status === 'rejected' && 'Please contact our support team for more information.'}
          </p>
          {notes && (
            <p className="text-sm mt-2 p-2 bg-white bg-opacity-50 rounded">
              <span className="font-medium">Notes:</span> {notes}
            </p>
          )}
          {createdAt && (
            <p className="text-xs mt-2">
              Submitted on: {createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
            </p>
          )}
          {updatedAt && (
            <p className="text-xs mt-2">
              Updated on: {updatedAt?.toDate?.().toLocaleDateString() || 'N/A'}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RegistrationStatusBanner;