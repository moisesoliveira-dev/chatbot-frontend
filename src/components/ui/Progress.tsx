'use client';

import React from 'react';
import { clsx } from 'clsx';

interface ProgressProps {
    value: number;
    max?: number;
    variant?: 'default' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
    showPercentage?: boolean;
    showValue?: boolean;
    label?: string;
    className?: string;
    animated?: boolean;
    striped?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
    value,
    max = 100,
    variant = 'default',
    size = 'md',
    showPercentage = false,
    showValue = false,
    label,
    className,
    animated = false,
    striped = false,
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const getSizeClasses = () => {
        const sizes = {
            sm: 'h-2',
            md: 'h-3',
            lg: 'h-4',
        };
        return sizes[size];
    };

    const getVariantClasses = () => {
        const variants = {
            default: 'bg-blue-500',
            success: 'bg-green-500',
            warning: 'bg-yellow-500',
            error: 'bg-red-500',
        };
        return variants[variant];
    };

    const getStripedPattern = () => {
        if (!striped) return '';
        return 'bg-gradient-to-r from-transparent via-white via-50% to-transparent bg-[length:1rem_1rem]';
    };

    const getAnimationClass = () => {
        if (!animated) return '';
        return 'animate-pulse';
    };

    return (
        <div className={clsx('w-full', className)}>
            {/* Label and percentage */}
            {(label || showPercentage || showValue) && (
                <div className="flex justify-between items-center mb-2 text-sm">
                    {label && <span className="text-gray-700">{label}</span>}
                    <div className="flex items-center space-x-2">
                        {showValue && (
                            <span className="text-gray-600">
                                {value}/{max}
                            </span>
                        )}
                        {showPercentage && (
                            <span className="text-gray-600">{Math.round(percentage)}%</span>
                        )}
                    </div>
                </div>
            )}

            {/* Progress bar */}
            <div
                className={clsx(
                    'w-full bg-gray-200 rounded-full overflow-hidden',
                    getSizeClasses()
                )}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={label}
            >
                <div
                    className={clsx(
                        'h-full transition-all duration-300 ease-out rounded-full',
                        getVariantClasses(),
                        getStripedPattern(),
                        getAnimationClass(),
                        {
                            'bg-opacity-20': striped,
                        }
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

// Circular Progress Component
interface CircularProgressProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    variant?: 'default' | 'success' | 'warning' | 'error';
    showPercentage?: boolean;
    showValue?: boolean;
    label?: string;
    className?: string;
    animated?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    value,
    max = 100,
    size = 120,
    strokeWidth = 8,
    variant = 'default',
    showPercentage = true,
    showValue = false,
    label,
    className,
    animated = false,
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getVariantColor = () => {
        const variants = {
            default: '#3b82f6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
        };
        return variants[variant];
    };

    return (
        <div className={clsx('inline-flex flex-col items-center', className)}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90"
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={max}
                    aria-label={label}
                >
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={getVariantColor()}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className={clsx('transition-all duration-500 ease-out', {
                            'animate-pulse': animated,
                        })}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        {showPercentage && (
                            <div className="text-lg font-semibold text-gray-900">
                                {Math.round(percentage)}%
                            </div>
                        )}
                        {showValue && (
                            <div className="text-xs text-gray-500">
                                {value}/{max}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Label */}
            {label && (
                <div className="mt-2 text-sm text-gray-600 text-center">{label}</div>
            )}
        </div>
    );
};

// Step Progress Component
interface Step {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'current' | 'completed' | 'error';
}

interface StepProgressProps {
    steps: Step[];
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
    steps,
    orientation = 'horizontal',
    className,
}) => {
    const getStatusIcon = (status: Step['status']) => {
        switch (status) {
            case 'completed':
                return (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                );
            case 'current':
                return (
                    <span className="w-2.5 h-2.5 bg-white rounded-full" />
                );
            default:
                return null;
        }
    };

    const getStepClasses = (status: Step['status']) => {
        const classes = {
            pending: 'bg-gray-300 text-gray-500',
            current: 'bg-blue-500 text-blue-500',
            completed: 'bg-green-500 text-green-500',
            error: 'bg-red-500 text-red-500',
        };
        return classes[status];
    };

    if (orientation === 'vertical') {
        return (
            <div className={clsx('space-y-4', className)}>
                {steps.map((step, index) => (
                    <div key={step.id} className="flex">
                        <div className="flex flex-col items-center mr-4">
                            <div
                                className={clsx(
                                    'w-8 h-8 rounded-full flex items-center justify-center',
                                    getStepClasses(step.status)
                                )}
                            >
                                {getStatusIcon(step.status) || (
                                    <span className="text-sm font-medium text-white">
                                        {index + 1}
                                    </span>
                                )}
                            </div>
                            {index < steps.length - 1 && (
                                <div className="w-0.5 h-8 bg-gray-300 mt-2" />
                            )}
                        </div>
                        <div className="flex-1 pb-8">
                            <h3 className="text-sm font-medium text-gray-900">{step.title}</h3>
                            {step.description && (
                                <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={clsx('flex items-center', className)}>
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                        <div
                            className={clsx(
                                'w-8 h-8 rounded-full flex items-center justify-center',
                                getStepClasses(step.status)
                            )}
                        >
                            {getStatusIcon(step.status) || (
                                <span className="text-sm font-medium text-white">
                                    {index + 1}
                                </span>
                            )}
                        </div>
                        <div className="mt-2 text-center">
                            <h3 className="text-sm font-medium text-gray-900">{step.title}</h3>
                            {step.description && (
                                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                            )}
                        </div>
                    </div>
                    {index < steps.length - 1 && (
                        <div className="flex-1 h-0.5 bg-gray-300 mx-4" />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};
