import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5
          bg-[#0D0D0D]
          border border-[rgba(255,255,255,0.06)]
          text-white
          rounded-lg
          transition-colors duration-200
          focus:outline-none focus:border-[#EDEDED] focus:ring-2 focus:ring-[rgba(255,255,255,0.1)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-[#EF4444]' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-[#EF4444]">{error}</p>
      )}
    </div>
  );
}
