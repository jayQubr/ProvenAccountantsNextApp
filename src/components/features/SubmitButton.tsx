import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';

interface SubmitButtonProps {
  isSubmitting: boolean;
  disabled?: boolean;
  status?: 'pending' | 'in-progress' | 'completed' | 'rejected' | null;
  defaultText?: string;
  pendingText?: string;
  rejectedText?: string;
  completedText?: string;
  processingText?: string;
  onConfirm?: () => void;
  confirmMessage?: string;
  validateForm: () => boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting,
  disabled = false,
  status = null,
  defaultText = 'Submit Registration',
  pendingText = 'Update Registration',
  rejectedText = 'Resubmit Registration',
  completedText = 'Already Submitted',
  processingText = 'Processing...',
  onConfirm,
  confirmMessage = 'Are you sure you want to submit this registration?',
  validateForm,
}) => {

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isConfirming && !isSubmitting) {
      setShowConfirmation(false);
      setIsConfirming(false);
    }
  }, [isSubmitting, isConfirming]);

  const isDisabled = isSubmitting || disabled || status === 'in-progress' || status === 'completed' || status === 'pending' || status === 'rejected';

  const buttonText = isSubmitting 
    ? processingText
    : status === 'pending'
      ? pendingText
      : status === 'rejected'
        ? rejectedText
        : status === 'in-progress' || status === 'completed'
          ? completedText
          : defaultText;

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Validate the form before showing confirmation
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    if (!isDisabled) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsConfirming(true);

    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowConfirmation(false);
    setIsConfirming(false);
  };

  return (
    <div className="relative">
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        type="button"
        disabled={isDisabled}
        onClick={handleButtonClick}
        className={`px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center ${
          isDisabled ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting && !isConfirming ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {processingText}
          </>
        ) : (
          buttonText
        )}
      </motion.button>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmation</h3>
            <p className="text-gray-600 mb-6">{confirmMessage}</p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting && isConfirming}
                className={`px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center justify-center min-w-[100px] ${
                  isSubmitting && isConfirming ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting && isConfirming ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {processingText}
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitButton;
