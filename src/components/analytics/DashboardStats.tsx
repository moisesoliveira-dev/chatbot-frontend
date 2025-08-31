'use client';

import React from 'react';
import { MetricCard } from './MetricCard';
import { useDashboardData } from '@/lib/hooks/useAnalytics';

interface DashboardStatsProps {
    refreshInterval?: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
    refreshInterval = 30000
}) => {
    const {
        dashboard: analytics,
        isLoading,
        error
    } = useDashboardData();

    // Icons for each metric
    const conversationsIcon = (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    );

    const messagesIcon = (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m-7 8l4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
    );

    const filesIcon = (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );

    const activeIcon = (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    );

    if (error) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="text-red-600 text-center">
                            <p className="text-sm font-medium">Erro ao carregar dados</p>
                            <p className="text-xs mt-1">Verifique a conexão com o backend</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const stats = analytics ? [
        {
            title: 'Conversas Ativas',
            value: analytics.activeConversations || 0,
            change: analytics.conversationsChange ? {
                value: analytics.conversationsChange.percentage,
                type: analytics.conversationsChange.type as 'increase' | 'decrease',
                period: 'última semana'
            } : undefined,
            icon: conversationsIcon,
            color: 'blue' as 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo',
            trend: analytics.conversationsChange?.type === 'increase' ? 'up' as const :
                analytics.conversationsChange?.type === 'decrease' ? 'down' as const : 'neutral' as const,
            subtitle: 'Usuários conversando agora'
        },
        {
            title: 'Mensagens Hoje',
            value: analytics.todayMessages || 0,
            change: analytics.messagesChange ? {
                value: analytics.messagesChange.percentage,
                type: analytics.messagesChange.type as 'increase' | 'decrease',
                period: 'ontem'
            } : undefined,
            icon: messagesIcon,
            color: 'green' as 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo',
            trend: analytics.messagesChange?.type === 'increase' ? 'up' as const :
                analytics.messagesChange?.type === 'decrease' ? 'down' as const : 'neutral' as const,
            subtitle: 'Total de mensagens processadas'
        },
        {
            title: 'Arquivos Recebidos',
            value: analytics.todayFiles || 0,
            change: analytics.filesChange ? {
                value: analytics.filesChange.percentage,
                type: analytics.filesChange.type as 'increase' | 'decrease',
                period: 'ontem'
            } : undefined,
            icon: filesIcon,
            color: 'purple' as 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo',
            trend: analytics.filesChange?.type === 'increase' ? 'up' as const :
                analytics.filesChange?.type === 'decrease' ? 'down' as const : 'neutral' as const,
            subtitle: 'Arquivos processados hoje'
        },
        {
            title: 'Taxa de Sucesso',
            value: analytics.successRate ? `${analytics.successRate}%` : '0%',
            change: analytics.successRateChange ? {
                value: analytics.successRateChange.percentage,
                type: analytics.successRateChange.type as 'increase' | 'decrease',
                period: 'última semana'
            } : undefined,
            icon: activeIcon,
            color: (analytics.successRate && analytics.successRate > 90 ? 'green' :
                analytics.successRate && analytics.successRate > 70 ? 'yellow' : 'red') as 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo',
            trend: analytics.successRateChange?.type === 'increase' ? 'up' as const :
                analytics.successRateChange?.type === 'decrease' ? 'down' as const : 'neutral' as const,
            subtitle: 'Conversas concluídas com sucesso'
        }
    ] : [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <MetricCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    change={stat.change}
                    icon={stat.icon}
                    loading={isLoading}
                    subtitle={stat.subtitle}
                    trend={stat.trend}
                    color={stat.color}
                />
            ))}
        </div>
    );
};
