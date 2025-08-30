'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';

interface AlertProps {
    variant?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    children: React.ReactNode;
    closable?: boolean;
    onClose?: () => void;
    icon?: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
    variant = 'info',
    title,
    children,
    closable = false,
    onClose,
    icon,
    className,
    actions,
}) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    const getVariantStyles = () => {
        const variants = {
            info: {
                container: 'bg-blue-50 border-blue-200 text-blue-800',
                icon: 'text-blue-400',
                defaultIcon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                ),
            },
            success: {
                container: 'bg-green-50 border-green-200 text-green-800',
                icon: 'text-green-400',
                defaultIcon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                ),
            },
            warning: {
                container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                icon: 'text-yellow-400',
                defaultIcon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                ),
            },
            error: {
                container: 'bg-red-50 border-red-200 text-red-800',
                icon: 'text-red-400',
                defaultIcon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                ),
            },
        };
        return variants[variant];
    };

    const variantStyles = getVariantStyles();

    if (!isVisible) return null;

    return (
        <div
            className={clsx(
                'border rounded-md p-4',
                variantStyles.container,
                className
            )}
            role="alert"
        >
            <div className="flex items-start">
                {/* Icon */}
                <div className={clsx('flex-shrink-0', variantStyles.icon)}>
                    {icon || variantStyles.defaultIcon}
                </div>

                {/* Content */}
                <div className="ml-3 flex-1">
                    {title && (
                        <h3 className="text-sm font-medium mb-1">
                            {title}
                        </h3>
                    )}
                    <div className="text-sm">
                        {children}
                    </div>
                    {actions && (
                        <div className="mt-3">
                            {actions}
                        </div>
                    )}
                </div>

                {/* Close button */}
                {closable && (
                    <div className="ml-auto pl-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className={clsx(
                                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                                'hover:bg-black hover:bg-opacity-10',
                                variantStyles.icon
                            )}
                        >
                            <span className="sr-only">Fechar</span>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Toast notification component
interface ToastProps extends Omit<AlertProps, 'closable'> {
    duration?: number;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const Toast: React.FC<ToastProps> = ({
    duration = 5000,
    position = 'top-right',
    onClose,
    ...alertProps
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose?.();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    const getPositionClasses = () => {
        const positions = {
            'top-right': 'top-4 right-4',
            'top-left': 'top-4 left-4',
            'bottom-right': 'bottom-4 right-4',
            'bottom-left': 'bottom-4 left-4',
            'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
            'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
        };
        return positions[position];
    };

    if (!isVisible) return null;

    return (
        <div
            className={clsx(
                'fixed z-50 max-w-sm w-full',
                'animate-in slide-in-from-top-2 fade-in-0 duration-300',
                getPositionClasses()
            )}
        >
            <Alert
                {...alertProps}
                closable
                onClose={handleClose}
                className="shadow-lg"
            />
        </div>
    );
};

// Toast container for managing multiple toasts
interface ToastContainerProps {
    position?: ToastProps['position'];
    maxToasts?: number;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
    position = 'top-right',
    maxToasts = 5,
}) => {
    // This would typically be managed by a toast provider/context
    // For now, it's a placeholder implementation
    return (
        <div
            className={clsx(
                'fixed z-50 pointer-events-none',
                {
                    'top-4 right-4': position === 'top-right',
                    'top-4 left-4': position === 'top-left',
                    'bottom-4 right-4': position === 'bottom-right',
                    'bottom-4 left-4': position === 'bottom-left',
                    'top-4 left-1/2 transform -translate-x-1/2': position === 'top-center',
                    'bottom-4 left-1/2 transform -translate-x-1/2': position === 'bottom-center',
                }
            )}
        >
            <div className="space-y-2">
                {/* Toast items would be rendered here */}
            </div>
        </div>
    );
};
