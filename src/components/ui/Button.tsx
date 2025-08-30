// Componente Button reutilizável com variantes e estados

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

const buttonVariants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-transparent',
    success: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent',
    outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300',
};

const buttonSizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
};

const disabledStyles = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            className,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || loading;

        return (
            <button
                ref={ref}
                disabled={isDisabled}
                className={clsx(
                    // Base styles
                    'inline-flex items-center justify-center font-medium rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',

                    // Variant styles
                    buttonVariants[variant],

                    // Size styles
                    buttonSizes[size],

                    // Width styles
                    fullWidth && 'w-full',

                    // Disabled styles
                    disabledStyles,

                    // Custom className
                    className
                )}
                {...props}
            >
                {/* Left Icon or Loading */}
                {loading ? (
                    <svg
                        className={clsx(
                            'animate-spin h-4 w-4',
                            children && 'mr-2'
                        )}
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
                ) : leftIcon ? (
                    <span className={clsx('flex items-center', children && 'mr-2')}>
                        {leftIcon}
                    </span>
                ) : null}

                {/* Button Text */}
                {children}

                {/* Right Icon */}
                {rightIcon && !loading && (
                    <span className={clsx('flex items-center', children && 'ml-2')}>
                        {rightIcon}
                    </span>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

// Button groups for related actions
export interface ButtonGroupProps {
    children: React.ReactNode;
    className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className }) => {
    return (
        <div className={clsx('inline-flex rounded-md shadow-sm', className)} role="group">
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement<ButtonProps>(child) && child.type === Button) {
                    const isFirst = index === 0;
                    const isLast = index === React.Children.count(children) - 1;

                    return React.cloneElement(child, {
                        ...child.props,
                        className: clsx(
                            child.props.className,
                            !isFirst && '-ml-px',
                            isFirst && 'rounded-r-none',
                            isLast && 'rounded-l-none',
                            !isFirst && !isLast && 'rounded-none'
                        ),
                    } as ButtonProps);
                }
                return child;
            })}
        </div>
    );
};
