import { auth } from '@/lib/firebaseConfig'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

const Modal = ({ open, handleOpenChange, children }: { open: boolean, handleOpenChange: (open: boolean) => void, children: React.ReactNode }) => {
  const router = useRouter();

  const handleLogOut = () => {
    signOut(auth);
    toast.success('Logged out successfully');
    router.push('/login');
  }
  
  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center items-center bg-gradient-to-b from-sky-50 to-white min-h-screen w-full p-6"
        >
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-sky-500 p-6 text-white">
              <div className="flex justify-center mb-4">
                <InformationCircleIcon className="h-16 w-16 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-center">Welcome to Your Account</h2>
              <p className="text-sky-100 text-center">
                Complete your profile to get started with our services
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  To provide you with the best service, we need some additional information. Please take a moment to complete your profile.
                </p>
                
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <svg className="h-5 w-5 text-sky-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Personal or business information
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="h-5 w-5 text-sky-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Contact details
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="h-5 w-5 text-sky-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Required documents
                  </li>
                </ul>
                
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-sky-500 text-white py-3 px-4 rounded-lg font-medium shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors"
                  >
                    Get Started
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogOut}
                    className="flex-1 bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Log Out
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm data-[state=open]:animate-overlayShow z-40" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[800px] translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl focus:outline-none data-[state=open]:animate-contentShow z-50">
          <Dialog.Title className="text-2xl font-medium text-gray-900 mb-1">
            Complete Your Profile
          </Dialog.Title>
          <Dialog.Description className="text-gray-600 mb-6">
            Please fill out the form below to get started with our services.
          </Dialog.Description>
          
          {children}
          
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
              aria-label="Close"
            >
              <Cross2Icon className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal