// Componente Badge para status e labels

import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gray';
    size?: 'sm' | 'md' | 'lg';
    dot?: boolean;
    className?: string;
}

const badgeVariants = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-cyan-100 text-cyan-800',
    gray: 'bg-gray-100 text-gray-800',
};

const badgeSizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm',
};

const dotVariants = {
    primary: 'bg-blue-500',
    secondary: 'bg-gray-500',
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-cyan-500',
    gray: 'bg-gray-500',
};

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'secondary',
    size = 'md',
    dot = false,
    className,
}) => {
    return (
        <span
            className={clsx(
                // Base styles
                'inline-flex items-center font-medium rounded-full',

                // Variant styles
                badgeVariants[variant],

                // Size styles
                badgeSizes[size],

                // Custom className
                className
            )}
        >
            {/* Dot indicator */}
            {dot && (
                <span
                    className={clsx(
                        'w-2 h-2 rounded-full mr-1.5',
                        dotVariants[variant]
                    )}
                />
            )}

            {children}
        </span>
    );
};

// Status Badge variants for common use cases
export interface StatusBadgeProps {
    status: 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'processing';
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
    const statusConfig = {
        active: { variant: 'success' as const, label: 'Ativo', dot: true },
        inactive: { variant: 'gray' as const, label: 'Inativo', dot: true },
        pending: { variant: 'warning' as const, label: 'Pendente', dot: true },
        completed: { variant: 'success' as const, label: 'Completo', dot: false },
        failed: { variant: 'danger' as const, label: 'Falhou', dot: true },
        processing: { variant: 'info' as const, label: 'Processando', dot: true },
    };

    const config = statusConfig[status];

    return (
        <Badge
            variant={config.variant}
            dot={config.dot}
            className={className}
        >
            {config.label}
        </Badge>
    );
};

// Bot Status Badge specifically for bot control
export interface BotStatusBadgeProps {
    enabled: boolean;
    testMode?: boolean;
    className?: string;
}

export const BotStatusBadge: React.FC<BotStatusBadgeProps> = ({
    enabled,
    testMode = false,
    className
}) => {
    if (testMode) {
        return (
            <Badge variant="warning" dot className={className}>
                Modo Teste
            </Badge>
        );
    }

    return (
        <Badge
            variant={enabled ? 'success' : 'gray'}
            dot
            className={className}
        >
            {enabled ? 'Ativo' : 'Inativo'}
        </Badge>
    );
};
