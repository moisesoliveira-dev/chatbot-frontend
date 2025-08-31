'use client';

import React from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';

interface ConversationChartProps {
    data?: Array<{
        date: string;
        conversations: number;
        messages: number;
    }>;
    loading?: boolean;
    className?: string;
}

export const ConversationChart: React.FC<ConversationChartProps> = ({
    data,
    loading = false,
    className
}) => {
    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Conversas por Período
                    </h3>
                </CardHeader>
                <CardContent>
                    <div className="h-80 flex items-center justify-center">
                        <Loading variant="spinner" size="lg" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const chartData = data || [
        { date: '01/08', conversations: 12, messages: 45 },
        { date: '02/08', conversations: 15, messages: 62 },
        { date: '03/08', conversations: 8, messages: 28 },
        { date: '04/08', conversations: 22, messages: 89 },
        { date: '05/08', conversations: 18, messages: 74 },
        { date: '06/08', conversations: 25, messages: 105 },
        { date: '07/08', conversations: 30, messages: 128 }
    ];

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Conversas por Período
                        </h3>
                        <p className="text-sm text-gray-600">
                            Últimos 7 dias - Conversas e mensagens
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Conversas</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">Mensagens</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="conversations"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="messages"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

interface FlowUsageChartProps {
    data?: Array<{
        name: string;
        usage: number;
        color: string;
    }>;
    loading?: boolean;
    className?: string;
}

export const FlowUsageChart: React.FC<FlowUsageChartProps> = ({
    data,
    loading = false,
    className
}) => {
    const chartData = data || [
        { name: 'Atendimento Geral', usage: 45, color: '#3b82f6' },
        { name: 'Suporte Técnico', usage: 32, color: '#10b981' },
        { name: 'Vendas', usage: 28, color: '#f59e0b' },
        { name: 'Upload Documentos', usage: 15, color: '#8b5cf6' },
        { name: 'Informações', usage: 8, color: '#ef4444' }
    ];

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Uso de Fluxos
                    </h3>
                </CardHeader>
                <CardContent>
                    <div className="h-80 flex items-center justify-center">
                        <Loading variant="spinner" size="lg" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Uso de Fluxos
                    </h3>
                    <p className="text-sm text-gray-600">
                        Distribuição de conversas por fluxo
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fontSize: 12 }}
                                width={120}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Bar
                                dataKey="usage"
                                fill="#3b82f6"
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

interface FileAnalyticsChartProps {
    data?: Array<{
        type: string;
        count: number;
        size: string;
    }>;
    loading?: boolean;
    className?: string;
}

export const FileAnalyticsChart: React.FC<FileAnalyticsChartProps> = ({
    data,
    loading = false,
    className
}) => {
    const chartData = data || [
        { type: 'PDF', count: 45, size: '2.3 MB' },
        { type: 'Imagens', count: 32, size: '1.8 MB' },
        { type: 'Documentos', count: 28, size: '1.2 MB' },
        { type: 'Planilhas', count: 15, size: '0.9 MB' },
        { type: 'Outros', count: 8, size: '0.4 MB' }
    ];

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Análise de Arquivos
                    </h3>
                </CardHeader>
                <CardContent>
                    <div className="h-80 flex items-center justify-center">
                        <Loading variant="spinner" size="lg" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Análise de Arquivos
                    </h3>
                    <p className="text-sm text-gray-600">
                        Distribuição por tipo de arquivo
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pie Chart */}
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    label={({ type, count }) => `${type}: ${count}`}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend and Stats */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 text-sm">
                            Detalhes por Tipo
                        </h4>
                        {chartData.map((item, index) => (
                            <div key={item.type} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    ></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {item.type}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {item.count} arquivos
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {item.size}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

interface ActivityHeatmapProps {
    data?: Array<{
        hour: number;
        day: string;
        activity: number;
    }>;
    loading?: boolean;
    className?: string;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
    data,
    loading = false,
    className
}) => {
    // Mock data for heatmap
    const generateHeatmapData = () => {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const heatmapData: { day: string; hour: number; activity: number }[] = [];

        days.forEach(day => {
            hours.forEach(hour => {
                heatmapData.push({
                    day,
                    hour,
                    activity: Math.floor(Math.random() * 50) + 1
                });
            });
        });

        return heatmapData;
    };

    const heatmapData = data || generateHeatmapData();

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Mapa de Atividade
                    </h3>
                </CardHeader>
                <CardContent>
                    <div className="h-80 flex items-center justify-center">
                        <Loading variant="spinner" size="lg" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getIntensityColor = (activity: number) => {
        if (activity < 10) return '#f3f4f6';
        if (activity < 20) return '#bfdbfe';
        if (activity < 30) return '#60a5fa';
        if (activity < 40) return '#3b82f6';
        return '#1d4ed8';
    };

    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <Card className={className}>
            <CardHeader>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Mapa de Atividade
                    </h3>
                    <p className="text-sm text-gray-600">
                        Atividade por hora do dia e dia da semana
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Heatmap Grid */}
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full">
                            {/* Hour labels */}
                            <div className="flex">
                                <div className="w-12"></div>
                                {hours.map(hour => (
                                    <div
                                        key={hour}
                                        className="w-4 h-4 text-xs text-gray-500 flex items-center justify-center"
                                    >
                                        {hour % 6 === 0 ? hour : ''}
                                    </div>
                                ))}
                            </div>

                            {/* Heatmap rows */}
                            {days.map(day => (
                                <div key={day} className="flex items-center">
                                    <div className="w-12 text-xs text-gray-500 text-right pr-2">
                                        {day}
                                    </div>
                                    {hours.map(hour => {
                                        const dataPoint = heatmapData.find(
                                            d => d.day === day && d.hour === hour
                                        );
                                        const activity = dataPoint?.activity || 0;

                                        return (
                                            <div
                                                key={`${day}-${hour}`}
                                                className="w-4 h-4 m-0.5 rounded-sm cursor-pointer transition-opacity hover:opacity-75"
                                                style={{ backgroundColor: getIntensityColor(activity) }}
                                                title={`${day} ${hour}:00 - ${activity} atividades`}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Menos ativo</span>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map(level => (
                                <div
                                    key={level}
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: getIntensityColor(level * 10) }}
                                />
                            ))}
                        </div>
                        <span>Mais ativo</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
