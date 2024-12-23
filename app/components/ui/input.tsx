'use client';

// biome-ignore lint/style/useImportType: This import is used for both types and runtime, not just types
import * as React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={`border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
};
