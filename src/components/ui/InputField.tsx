import * as Form from '@radix-ui/react-form'

const InputField = ({ name, type = "text", label, placeholder, value, onChange, required, message }: { name: string, type?: string, label: string, placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required: boolean, message: string }) => {
    return (
        <Form.Field name={name} className="space-y-2">
            <Form.Label className="block text-sm font-medium text-gray-700">{label}</Form.Label>
            <Form.Control asChild>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="block w-full rounded-lg border-0 bg-gray-50 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm"
                    placeholder={placeholder}
                />
            </Form.Control>
            <Form.Message match="valueMissing" className="text-xs text-red-500 mt-1">
                {message}
            </Form.Message>

            {type === "email" && (
                <Form.Message match="typeMismatch" className="text-xs text-red-500 mt-1">
                    Please enter a valid email
                </Form.Message>
            )}
        </Form.Field>
    )
}

export default InputField