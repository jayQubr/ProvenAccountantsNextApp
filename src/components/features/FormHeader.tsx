import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface FormHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onBack: () => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({ 
  title, 
  description, 
  icon, 
  onBack 
}) => {
  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={onBack}
        className="flex items-center text-sky-600 hover:text-sky-700 mb-4 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        <span>Back to Services</span>
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-500">
          {icon}
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h1>
      </div>

      <p className="text-gray-600 text-sm">
        {description}
      </p>
    </motion.div>
  );
};

export default FormHeader; 