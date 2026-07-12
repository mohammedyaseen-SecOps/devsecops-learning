'use client';

import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  children: React.ReactNode;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={clsx('border-b border-gray-200 dark:border-dark-700 pb-4', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardBody: React.FC<CardBodyProps> = ({
  className,
  children,
  ...props
}) => (
  <div className={clsx('py-4', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardFooterProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={clsx('border-t border-gray-200 dark:border-dark-700 pt-4', className)}
    {...props}
  >
    {children}
  </div>
);

export const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
} = ({ variant = 'default', className, children, ...props }) => {
  const variants = {
    default:
      'bg-white dark:bg-dark-800 rounded-lg p-6 border border-gray-100 dark:border-dark-700',
    elevated:
      'bg-white dark:bg-dark-800 rounded-lg p-6 shadow-lg border border-gray-100 dark:border-dark-700',
    outlined:
      'bg-transparent rounded-lg p-6 border-2 border-gray-300 dark:border-dark-600',
  };

  return (
    <div className={clsx(variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
