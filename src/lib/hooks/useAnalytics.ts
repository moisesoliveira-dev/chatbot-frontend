// Hook for managing analytics and dashboard data

import useSWR, { mutate } from 'swr';
import { analyticsApi } from '@/lib/api';
import { ConversationAnalytics, FileAnalytics } from '@/lib/types';

export function useConversationAnalytics(dateRange?: { start: string; end: string }) {
    const { data: analytics, error, isLoading } = useSWR(
        ['/analytics/conversations', dateRange],
        () => analyticsApi.conversations(dateRange),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 30000, // Cache for 30 seconds
            refreshInterval: 60000, // Refresh every minute
        }
    );

    return {
        analytics: analytics as ConversationAnalytics | undefined,
        isLoading,
        error,
        refreshAnalytics: () => mutate(['/analytics/conversations', dateRange]),
    };
}

export function useFileAnalytics(dateRange?: { start: string; end: string }) {
    const { data: analytics, error, isLoading } = useSWR(
        ['/analytics/files', dateRange],
        () => analyticsApi.files(dateRange),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 30000, // Cache for 30 seconds
            refreshInterval: 60000, // Refresh every minute
        }
    );

    return {
        analytics: analytics as FileAnalytics | undefined,
        isLoading,
        error,
        refreshAnalytics: () => mutate(['/analytics/files', dateRange]),
    };
}

export function useDashboardData() {
    const { data: dashboard, error, isLoading } = useSWR(
        '/analytics/dashboard',
        analyticsApi.dashboard,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 15000, // Cache for 15 seconds
            refreshInterval: 30000, // Refresh every 30 seconds for real-time dashboard
        }
    );

    return {
        dashboard,
        isLoading,
        error,
        refreshDashboard: () => mutate('/analytics/dashboard'),
    };
}

// Combined hook for full analytics suite
export function useAnalytics(dateRange?: { start: string; end: string }) {
    const conversationAnalytics = useConversationAnalytics(dateRange);
    const fileAnalytics = useFileAnalytics(dateRange);
    const dashboardData = useDashboardData();

    const isLoading = conversationAnalytics.isLoading || fileAnalytics.isLoading || dashboardData.isLoading;
    const hasError = conversationAnalytics.error || fileAnalytics.error || dashboardData.error;

    const refreshAll = () => {
        conversationAnalytics.refreshAnalytics();
        fileAnalytics.refreshAnalytics();
        dashboardData.refreshDashboard();
    };

    return {
        // Individual analytics data
        conversationAnalytics: conversationAnalytics.analytics,
        fileAnalytics: fileAnalytics.analytics,
        dashboard: dashboardData.dashboard,

        // Loading and error states
        isLoading,
        error: hasError,

        // Individual loading states
        isLoadingConversations: conversationAnalytics.isLoading,
        isLoadingFiles: fileAnalytics.isLoading,
        isLoadingDashboard: dashboardData.isLoading,

        // Individual errors
        conversationError: conversationAnalytics.error,
        fileError: fileAnalytics.error,
        dashboardError: dashboardData.error,

        // Refresh functions
        refreshAll,
        refreshConversations: conversationAnalytics.refreshAnalytics,
        refreshFiles: fileAnalytics.refreshAnalytics,
        refreshDashboard: dashboardData.refreshDashboard,
    };
}