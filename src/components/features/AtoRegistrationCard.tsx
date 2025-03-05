import React from "react";
import { CheckIcon } from "@heroicons/react/24/outline";

interface RegistrationCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  isSelected: any;
  onClick: () => void;
  isDisabled: boolean;
}

const RegistrationCard: React.FC<RegistrationCardProps> = ({
  name,
  description,
  icon,
  isSelected,
  onClick,
  isDisabled,
}) => {
  return (
    <div
      className={`relative rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
        isSelected ? "border-sky-500 bg-sky-50 shadow-md" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
      onClick={() => !isDisabled && onClick()}
    >
      <div className="absolute top-3 right-3">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center ${
            isSelected ? "bg-sky-500" : "border border-gray-300"
          }`}
        >
          {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
        </div>
      </div>
      <div className="flex flex-col items-start">
        <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center mb-3">
          {icon}
        </div>
        <h3 className="font-medium text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default RegistrationCard;