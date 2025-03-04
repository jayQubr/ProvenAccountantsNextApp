import { motion } from "framer-motion";
import React, { ReactNode } from "react";

const shakeAnimation = {
    initial: { x: 0 },
    animate: { x: [0, -5, 5, -5, 5, 0], transition: { duration: 0.3 } }
};
interface CustomInputProps {
    label: string;
    name: string;
    value: string;
    placeholder?: string;
    type?: string;
    maxLength?: number | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    errors: string;
    required?: boolean;
    icon?: ReactNode;
    autoComplete?: string;
    rightElement?: ReactNode;
    disabled?: boolean;
}

const CustomInput = ({ 
    label, 
    name, 
    value, 
    onChange, 
    errors, 
    placeholder, 
    type = "text", 
    maxLength = null, 
    required = true,
    icon,
    autoComplete,
    rightElement,
    disabled = false
}: CustomInputProps) => {
    return (
        <div className="relative w-full">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {icon}
                    </div>
                )}
                
                {type === "textarea" ? (
                    <textarea
                        id={name}
                        name={name}
                        value={value}
                        onChange={(e) => onChange(e)}
                        className={`w-full ${icon ? 'pl-10' : 'px-4'} py-3 rounded-lg border ${errors ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors`}
                        placeholder={placeholder}
                        maxLength={maxLength ?? undefined}
                        {...(errors ? shakeAnimation : {})}
                    />
                ) : (
                    <motion.input
                        type={type}
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={`w-full ${icon ? 'pl-10' : 'px-4'} py-3 rounded-lg border ${errors ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors`}
                        placeholder={placeholder}
                        maxLength={maxLength ?? undefined}
                        autoComplete={autoComplete}
                        disabled={disabled}
                        {...(errors ? shakeAnimation : {})}
                    />
                )}
                
                {rightElement && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>
            
            {errors && (
                <motion.p 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.3 }}
                    className="mt-1 text-sm text-red-600"
                >
                    {errors}
                </motion.p>
            )}
        </div>
    );
}

export default CustomInput;