'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';

type CheckboxProps = React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> & {
  onCheckedChange?: (checked: boolean) => void;
};

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, onCheckedChange, checked, ...props }, ref) => {
  const handleCheckedChange = (newChecked: boolean | 'indeterminate') => {
    console.log('Checkbox state changed:', newChecked);
    if (onCheckedChange) {
      onCheckedChange(newChecked === true);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <CheckboxPrimitive.Root
        ref={ref}
        className={`flex h-6 w-6 items-center justify-center rounded border-2 border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${
          checked ? 'bg-green-100 border-green-500' : ''
        } ${className}`}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="text-green-500">
          <CheckIcon className="h-5 w-5" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span className="text-sm">
        {checked ? 'Checked' : 'Unchecked'}
      </span>
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
