'use client';

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({
        label,
        error,
        helperText,
        resize = 'vertical',
        className,
        disabled,
        ...props
    }, ref) => {
        const hasError = Boolean(error);

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}

                <textarea
                    ref={ref}
                    disabled={disabled}
                    className={clsx(
                        'w-full px-3 py-2 border rounded-md text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'transition-colors duration-200',
                        'min-h-[80px]',
                        {
                            'border-gray-300': !hasError && !disabled,
                            'border-red-500': hasError,
                            'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-400': disabled,
                            'resize-none': resize === 'none',
                            'resize-y': resize === 'vertical',
                            'resize-x': resize === 'horizontal',
                            'resize': resize === 'both',
                        },
                        className
                    )}
                    {...props}
                />

                {(error || helperText) && (
                    <p className={clsx(
                        'mt-1 text-xs',
                        {
                            'text-red-500': hasError,
                            'text-gray-500': !hasError,
                        }
                    )}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
