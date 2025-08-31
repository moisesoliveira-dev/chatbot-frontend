'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: {
        value: number;
        type: 'increase' | 'decrease';
        period: string;
    };
    icon?: React.ReactNode;
    loading?: boolean;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    change,
    icon,
    loading = false,
    subtitle,
    trend = 'neutral',
    color = 'blue',
}) => {
    if (loading) {
        return (
            <Card className="h-full">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <Loading variant="skeleton" className="h-4 w-24 mb-3" />
                            <Loading variant="skeleton" className="h-8 w-32 mb-2" />
                            <Loading variant="skeleton" className="h-3 w-20" />
                        </div>
                        <Loading variant="skeleton" className="h-8 w-8 rounded-lg" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50 border-blue-200',
        green: 'text-green-600 bg-green-50 border-green-200',
        yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        red: 'text-red-600 bg-red-50 border-red-200',
        purple: 'text-purple-600 bg-purple-50 border-purple-200',
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    };

    const trendIcons = {
        up: (
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
        ),
        down: (
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7h10v10" />
            </svg>
        ),
        neutral: null,
    };

    return (
        <Card className={`h-full transition-all duration-200 hover:shadow-lg border-l-4 ${colorClasses[color]}`}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium text-gray-600">{title}</p>
                            {trendIcons[trend]}
                        </div>

                        <div className="flex items-baseline space-x-2 mb-2">
                            <p className="text-3xl font-bold text-gray-900">
                                {typeof value === 'number' ? value.toLocaleString() : value}
                            </p>
                        </div>

                        {subtitle && (
                            <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
                        )}

                        {change && (
                            <div className="flex items-center space-x-1">
                                <Badge
                                    variant={change.type === 'increase' ? 'success' : 'danger'}
                                    size="sm"
                                >
                                    {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
                                </Badge>
                                <span className="text-xs text-gray-500">vs {change.period}</span>
                            </div>
                        )}
                    </div>

                    {icon && (
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${colorClasses[color]}`}>
                            {icon}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
