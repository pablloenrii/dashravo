/**
 * RAVO OS — FormField Component
 * Componente FormField reutilizável
 */

import React, { ReactNode } from 'react';
import { Input } from '@/components/Input';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children?: ReactNode;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      children,
      className,
      ...props
    },
    _ref
  ) => {
    return (
      <div className={`w-full ${className || ''}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {children || (
          <Input
            error={error || helperText}
            required={required}
            {...props}
          />
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
