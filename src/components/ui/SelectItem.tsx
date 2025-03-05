import { CheckIcon } from '@radix-ui/react-icons';
import * as Select from '@radix-ui/react-select';
import React from "react";

const SelectItem = React.forwardRef(({ children, className, ...props }: any, forwardedRef) => {
    return (
      <Select.Item
        className={`text-sm leading-none text-gray-700 rounded-md flex items-center h-9 pr-9 pl-6 relative select-none data-[disabled]:text-gray-300 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-sky-100 data-[highlighted]:text-sky-700 ${className}`}
        {...props}
        ref={forwardedRef}
      >
        <Select.ItemText>{children}</Select.ItemText>
        <Select.ItemIndicator className="absolute left-0 w-6 inline-flex items-center justify-center">
          <CheckIcon className="w-4 h-4" />
        </Select.ItemIndicator>
      </Select.Item>
    );
  });
SelectItem.displayName = 'SelectItem';

export default SelectItem;