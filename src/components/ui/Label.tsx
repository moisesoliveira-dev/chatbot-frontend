'use client';

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
    ({
        children,
        required = false,
        disabled = false,
        size = 'md',
        className,
        ...props
    }, ref) => {
        return (
            <label
                ref={ref}
                className={clsx(
                    'block font-medium',
                    {
                        'text-xs': size === 'sm',
                        'text-sm': size === 'md',
                        'text-base': size === 'lg',
                        'text-gray-700': !disabled,
                        'text-gray-400 cursor-not-allowed': disabled,
                    },
                    className
                )}
                {...props}
            >
                {children}
                {required && (
                    <span className="text-red-500 ml-1">*</span>
                )}
            </label>
        );
    }
);

Label.displayName = 'Label';
