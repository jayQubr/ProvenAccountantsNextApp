import React from 'react';

interface SubmitButtonProps {
  isSubmitting: boolean;
  disabled?: boolean;
  status?: 'pending' | 'in-progress' | 'completed' | 'rejected' | null;
  defaultText?: string;
  pendingText?: string;
  rejectedText?: string;
  completedText?: string;
  processingText?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting,
  disabled = false,
  status = null,
  defaultText = 'Submit Registration',
  pendingText = 'Update Registration',
  rejectedText = 'Resubmit Registration',
  completedText = 'Already Submitted',
  processingText = 'Processing...'
}) => {
  const isDisabled = isSubmitting || disabled || status === 'in-progress' || status === 'completed';
  
  const buttonText = isSubmitting 
    ? processingText
    : status === 'pending'
      ? pendingText
      : status === 'rejected'
        ? rejectedText
        : status === 'in-progress' || status === 'completed'
          ? completedText
          : defaultText;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center ${
        isDisabled ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      {isSubmitting ? (
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
    </button>
  );
};

export default SubmitButton;