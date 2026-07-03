/**
 * RAVO OS — Form Component
 * Componente Form reutilizável com integração Zod
 */

import React, { ReactNode } from 'react';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={`space-y-6 ${className || ''}`}
        {...props}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = 'Form';

export const FormGroup = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`space-y-4 ${className || ''}`}>{children}</div>
);

export const FormRow = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`grid grid-cols-2 gap-4 ${className || ''}`}>{children}</div>
);

export const FormActions = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`flex gap-3 pt-4 ${className || ''}`}>{children}</div>
);
