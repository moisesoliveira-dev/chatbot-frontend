// Componente Input reutilizável com validação visual

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'filled' | 'flushed';
    loading?: boolean;
}

const inputSizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
};

const inputVariants = {
    default: 'border border-gray-300 rounded-md',
    filled: 'border-0 bg-gray-50 rounded-md',
    flushed: 'border-0 border-b-2 border-gray-200 rounded-none bg-transparent',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            size = 'md',
            variant = 'default',
            loading = false,
            className,
            disabled,
            ...props
        },
        ref
    ) => {
        const hasError = !!error;
        const inputId = props.id || `input-${Math.random().toString(36).substring(2, 9)}`;

        return (
            <div className="w-full">
                {/* Label */}
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        {label}
                    </label>
                )}

                {/* Input Container */}
                <div className="relative">
                    {/* Left Icon */}
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-sm">{leftIcon}</span>
                        </div>
                    )}

                    {/* Input Field */}
                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled || loading}
                        className={clsx(
                            // Base styles
                            'block w-full transition-colors duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500',
                            'placeholder-gray-400',

                            // Size styles
                            inputSizes[size],

                            // Variant styles
                            inputVariants[variant],

                            // Icon padding
                            leftIcon && 'pl-10',
                            (rightIcon || loading) && 'pr-10',

                            // Error styles
                            hasError && variant === 'default' && 'border-red-300 focus:ring-red-500',
                            hasError && variant === 'filled' && 'bg-red-50',
                            hasError && variant === 'flushed' && 'border-red-300',

                            // Success styles (when no error and value exists)
                            !hasError && props.value && variant === 'default' && 'border-green-300',

                            // Disabled styles
                            (disabled || loading) && 'opacity-50 cursor-not-allowed bg-gray-50',

                            // Custom className
                            className
                        )}
                        {...props}
                    />

                    {/* Right Icon or Loading */}
                    {(rightIcon || loading) && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            {loading ? (
                                <svg
                                    className="animate-spin h-4 w-4 text-gray-400"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            ) : rightIcon ? (
                                <span className="text-gray-400 text-sm">{rightIcon}</span>
                            ) : null}
                        </div>
                    )}
                </div>

                {/* Helper Text or Error */}
                {(error || helperText) && (
                    <p className={clsx(
                        'mt-1 text-xs',
                        hasError ? 'text-red-600' : 'text-gray-500'
                    )}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// Input Group for compound inputs
export interface InputGroupProps {
    children: React.ReactNode;
    className?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({ children, className }) => {
    return (
        <div className={clsx('flex', className)}>
            {children}
        </div>
    );
};

// Addon components for InputGroup
export interface InputAddonProps {
    children: React.ReactNode;
    className?: string;
}

export const InputLeftAddon: React.FC<InputAddonProps> = ({ children, className }) => {
    return (
        <span className={clsx(
            'inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm',
            className
        )}>
            {children}
        </span>
    );
};

export const InputRightAddon: React.FC<InputAddonProps> = ({ children, className }) => {
    return (
        <span className={clsx(
            'inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm',
            className
        )}>
            {children}
        </span>
    );
};
