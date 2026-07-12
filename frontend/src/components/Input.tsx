'use client';

import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      size = 'md',
      icon,
      className,
      disabled,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    };

    const inputStyles = clsx(
      'border rounded-lg transition-colors focus:outline-none focus:ring-2',
      'bg-white dark:bg-dark-700 dark:text-white',
      'border-gray-300 dark:border-dark-600',
      'focus:ring-primary-500 focus:border-primary-500',
      'disabled:bg-gray-100 dark:disabled:bg-dark-800 disabled:cursor-not-allowed',
      error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
      sizes[size],
      icon && 'pl-10',
      fullWidth && 'w-full',
      className
    );

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-dark-900 dark:text-white mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={inputStyles}
            disabled={disabled}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
