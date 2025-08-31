'use client';

import React from 'react';
import {
    MetricCard,
    ConversationChart,
    FlowUsageChart,
    FileAnalyticsChart,
    ActivityHeatmap,
    RealTimeUpdates
} from '@/components/analytics';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function AnalyticsPage() {
    const {
        conversationAnalytics,
        fileAnalytics,
        dashboard,
        isLoading,
        error,
        refreshDashboard
    } = useAnalytics();

    // Transform data for metrics
    const mockMetrics = {
        totalConversations: dashboard?.totalConversations || 0,
        messagesTotal: dashboard?.messagesTotal || 0,
        resolutionRate: dashboard?.resolutionRate || 0,
        filesProcessed: 42 // Mock value
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <Loading variant="spinner" size="lg" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-red-600 mb-4">Erro ao carregar analytics: {error}</p>
                        <Button onClick={refreshDashboard} variant="outline">
                            Tentar Novamente
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Avançado</h1>
                    <p className="text-gray-600">
                        Análise detalhada do desempenho do chatbot com gráficos interativos
                    </p>
                </div>
                <Button onClick={refreshDashboard} variant="outline">
                    Atualizar Dados
                </Button>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total de Conversas"
                    value={mockMetrics.totalConversations}
                    change={{ value: 12, type: 'increase', period: 'último mês' }}
                    color="blue"
                />
                <MetricCard
                    title="Mensagens Hoje"
                    value={mockMetrics.messagesTotal}
                    change={{ value: 8, type: 'increase', period: 'hoje' }}
                    color="green"
                />
                <MetricCard
                    title="Taxa de Resolução"
                    value={`${mockMetrics.resolutionRate}%`}
                    change={{ value: 5, type: 'increase', period: 'esta semana' }}
                    color="purple"
                />
                <MetricCard
                    title="Arquivos Processados"
                    value={mockMetrics.filesProcessed}
                    change={{ value: 3, type: 'decrease', period: 'hoje' }}
                    color="red"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ConversationChart
                    loading={isLoading}
                />
                <FlowUsageChart
                    loading={isLoading}
                />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FileAnalyticsChart
                    loading={isLoading}
                />
                <ActivityHeatmap
                    loading={isLoading}
                />
            </div>

            {/* Real-time Updates */}
            <RealTimeUpdates />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Resumo de Conversas
                        </h3>
                        <p className="text-sm text-gray-600">
                            Últimas 24 horas
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Iniciadas:</span>
                                <span className="font-semibold text-blue-600">45</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Finalizadas:</span>
                                <span className="font-semibold text-green-600">38</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Em andamento:</span>
                                <span className="font-semibold text-orange-600">7</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Taxa de conclusão:</span>
                                <span className="font-semibold text-purple-600">84%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Performance de Fluxos
                        </h3>
                        <p className="text-sm text-gray-600">
                            Top 3 mais usados
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-medium">Atendimento</span>
                                </div>
                                <span className="text-sm text-gray-600">45%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium">Suporte</span>
                                </div>
                                <span className="text-sm text-gray-600">32%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <span className="text-sm font-medium">Vendas</span>
                                </div>
                                <span className="text-sm text-gray-600">23%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Status do Sistema
                        </h3>
                        <p className="text-sm text-gray-600">
                            Monitoramento em tempo real
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Bot Status:</span>
                                <span className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-sm font-semibold text-green-600">Online</span>
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Conexões ativas:</span>
                                <span className="font-semibold text-blue-600">12</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Uptime:</span>
                                <span className="font-semibold text-purple-600">99.8%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Latência média:</span>
                                <span className="font-semibold text-green-600">124ms</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
