import useStore from "@/utils/useStore";
import { InformationCircleIcon } from "@heroicons/react/24/outline"
import Link from "next/link";

const PersonalInformation = ({ title }: { title?: string }) => {
  const { user } = useStore();
  const userData = {
    fullName : user.firstName + ' ' + user.lastName,
    email: user.email,
    dateOfBirth: user.dateOfBirth,
    phone: user.phone
  }
  return (
    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center text-xs mr-2">
          <InformationCircleIcon className="w-4 h-4" />
        </span>
       {title ? title : 'Personal Information'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-gray-500">Full Name (Applicant/Authorised Person)</p>
          <p className="text-sm font-medium text-gray-800">{userData.fullName}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-500">Email</p>
          <p className="text-sm font-medium text-gray-800">{userData.email}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-500">Date of Birth</p>
          <p className="text-sm font-medium text-gray-800">
            {new Date(userData.dateOfBirth).toLocaleDateString('en-AU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-500">Phone Number</p>
          <p className="text-sm font-medium text-gray-800">{userData.phone}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 italic">
          This information is from your profile. If you need to update these details, please visit your <Link href='/my-profile' className="text-indigo-500 underline">profile settings</Link>.
        </p>
      </div>
    </div>
  )
}

export default PersonalInformation