import { motion } from "framer-motion";

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
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errors: string;
    required?: boolean;
}

const CustomInput = ({ label, name, value, onChange, errors, placeholder, type = "text", maxLength = null, required = true }: CustomInputProps) => {
    return (
        <div className="relative w-full">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === "textarea" ? (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e as any)}
                    className={`w-full px-4 py-3 rounded-lg border ${errors ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors`}
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
                className={`w-full px-4 py-3 rounded-lg border ${errors ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors`}
                placeholder={placeholder}
                maxLength={maxLength ?? undefined}
                {...(errors ? shakeAnimation : {})}
            />
            )}
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