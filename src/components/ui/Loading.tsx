// Componente Loading para estados de carregamento

import React from 'react';
import { clsx } from 'clsx';

export interface LoadingProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
    color?: 'primary' | 'secondary' | 'gray';
    text?: string;
    className?: string;
}

const sizeVariants = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
};

const colorVariants = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    gray: 'text-gray-400',
};

// Spinner Loading
export const LoadingSpinner: React.FC<LoadingProps> = ({
    size = 'md',
    color = 'primary',
    text,
    className,
}) => {
    return (
        <div className={clsx('flex items-center justify-center', className)}>
            <div className="flex flex-col items-center space-y-2">
                <svg
                    className={clsx(
                        'animate-spin',
                        sizeVariants[size],
                        colorVariants[color]
                    )}
                    fill="none"
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
                {text && (
                    <span className={clsx('text-sm', colorVariants[color])}>
                        {text}
                    </span>
                )}
            </div>
        </div>
    );
};

// Dots Loading
export const LoadingDots: React.FC<LoadingProps> = ({
    size = 'md',
    color = 'primary',
    className,
}) => {
    const dotSize = {
        xs: 'w-1 h-1',
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-3 h-3',
        xl: 'w-4 h-4',
    };

    return (
        <div className={clsx('flex items-center justify-center space-x-1', className)}>
            {[0, 1, 2].map((index) => (
                <div
                    key={index}
                    className={clsx(
                        'rounded-full animate-pulse',
                        dotSize[size],
                        color === 'primary' && 'bg-blue-600',
                        color === 'secondary' && 'bg-gray-600',
                        color === 'gray' && 'bg-gray-400'
                    )}
                    style={{
                        animationDelay: `${index * 0.1}s`,
                        animationDuration: '1s',
                    }}
                />
            ))}
        </div>
    );
};

// Pulse Loading
export const LoadingPulse: React.FC<LoadingProps> = ({
    size = 'md',
    color = 'primary',
    className,
}) => {
    return (
        <div className={clsx('flex items-center justify-center', className)}>
            <div
                className={clsx(
                    'rounded-full animate-pulse',
                    sizeVariants[size],
                    color === 'primary' && 'bg-blue-600',
                    color === 'secondary' && 'bg-gray-600',
                    color === 'gray' && 'bg-gray-400'
                )}
            />
        </div>
    );
};

// Skeleton Loading for content
export interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circular' | 'rectangular';
    animation?: 'pulse' | 'wave';
}

export const LoadingSkeleton: React.FC<SkeletonProps> = ({
    className,
    width,
    height,
    variant = 'rectangular',
    animation = 'pulse',
}) => {
    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-md',
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'animate-pulse', // Could be enhanced with wave animation
    };

    return (
        <div
            className={clsx(
                'bg-gray-200',
                variantClasses[variant],
                animationClasses[animation],
                className
            )}
            style={{ width, height }}
        />
    );
};

// Main Loading component that switches between variants
export const Loading: React.FC<LoadingProps> = ({
    variant = 'spinner',
    ...props
}) => {
    switch (variant) {
        case 'dots':
            return <LoadingDots {...props} />;
        case 'pulse':
            return <LoadingPulse {...props} />;
        case 'skeleton':
            return <LoadingSkeleton {...props} />;
        default:
            return <LoadingSpinner {...props} />;
    }
};

// Page Loading component for full page loading
export interface PageLoadingProps {
    text?: string;
    className?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
    text = 'Carregando...',
    className
}) => {
    return (
        <div className={clsx(
            'flex items-center justify-center min-h-screen bg-gray-50',
            className
        )}>
            <div className="text-center">
                <LoadingSpinner size="lg" text={text} />
            </div>
        </div>
    );
};

// Inline Loading for buttons and small areas
export const InlineLoading: React.FC<{ text?: string; className?: string }> = ({
    text,
    className
}) => {
    return (
        <div className={clsx('flex items-center space-x-2', className)}>
            <LoadingSpinner size="sm" />
            {text && <span className="text-sm text-gray-600">{text}</span>}
        </div>
    );
};
