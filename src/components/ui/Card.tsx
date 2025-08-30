// Componente Card reutilizável para layouts

import React from 'react';
import { clsx } from 'clsx';

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    border?: boolean;
    hover?: boolean;
}

const paddingVariants = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
};

const shadowVariants = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
};

export const Card: React.FC<CardProps> = ({
    children,
    className,
    padding = 'md',
    shadow = 'sm',
    border = true,
    hover = false,
}) => {
    return (
        <div
            className={clsx(
                // Base styles
                'bg-white rounded-lg',

                // Padding
                paddingVariants[padding],

                // Shadow
                shadowVariants[shadow],

                // Border
                border && 'border border-gray-200',

                // Hover effect
                hover && 'transition-shadow duration-200 hover:shadow-md',

                // Custom className
                className
            )}
        >
            {children}
        </div>
    );
};

// Card sub-components
export interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
    return (
        <div className={clsx('border-b border-gray-200 pb-4 mb-4', className)}>
            {children}
        </div>
    );
};

export interface CardBodyProps {
    children: React.ReactNode;
    className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className }) => {
    return (
        <div className={clsx(className)}>
            {children}
        </div>
    );
};

export interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
    return (
        <div className={clsx('border-t border-gray-200 pt-4 mt-4', className)}>
            {children}
        </div>
    );
};

export interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
    return (
        <div className={clsx('p-6', className)}>
            {children}
        </div>
    );
};

export interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle: React.FC<CardTitleProps> = ({
    children,
    className,
    as: Component = 'h3'
}) => {
    return (
        <Component className={clsx(
            'text-lg font-semibold text-gray-900',
            className
        )}>
            {children}
        </Component>
    );
};

export interface CardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className }) => {
    return (
        <p className={clsx('text-sm text-gray-600 mt-1', className)}>
            {children}
        </p>
    );
};
