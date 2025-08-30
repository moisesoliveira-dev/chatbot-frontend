'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

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
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    change,
    icon,
    loading = false,
}) => {
    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                        <p className="text-2xl font-bold text-gray-900 mb-2">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                        {change && (
                            <div className="flex items-center space-x-1">
                                <Badge
                                    variant={change.type === 'increase' ? 'success' : 'danger'}
                                    className="text-xs"
                                >
                                    {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
                                </Badge>
                                <span className="text-xs text-gray-500">vs {change.period}</span>
                            </div>
                        )}
                    </div>
                    {icon && (
                        <div className="flex-shrink-0 text-gray-400">
                            {icon}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
