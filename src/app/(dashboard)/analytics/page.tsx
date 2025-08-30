'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { MetricCard } from '@/components/analytics/MetricCard';
import { SimpleChart } from '@/components/analytics/SimpleChart';
import { DataTable } from '@/components/analytics/DataTable';

// Mock data for demonstration
const mockMetrics = [
    {
        title: 'Total de Conversas',
        value: 2847,
        change: { value: 12.5, type: 'increase' as const, period: 'último mês' },
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        ),
    },
    {
        title: 'Taxa de Satisfação',
        value: '94.2%',
        change: { value: 2.1, type: 'increase' as const, period: 'último mês' },
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        title: 'Tempo Médio de Resposta',
        value: '2.3s',
        change: { value: 8.7, type: 'decrease' as const, period: 'último mês' },
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        title: 'Usuários Ativos',
        value: 1248,
        change: { value: 18.3, type: 'increase' as const, period: 'último mês' },
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
        ),
    },
];

const mockChartData = [
    { label: 'Jan', value: 1200, color: '#3b82f6' },
    { label: 'Fev', value: 1900, color: '#3b82f6' },
    { label: 'Mar', value: 1500, color: '#3b82f6' },
    { label: 'Abr', value: 2200, color: '#3b82f6' },
    { label: 'Mai', value: 2800, color: '#3b82f6' },
    { label: 'Jun', value: 2400, color: '#3b82f6' },
];

const mockTopicData = [
    { label: 'Suporte Técnico', value: 35, color: '#3b82f6' },
    { label: 'Vendas', value: 28, color: '#ef4444' },
    { label: 'Informações', value: 20, color: '#10b981' },
    { label: 'Reclamações', value: 12, color: '#f59e0b' },
    { label: 'Outros', value: 5, color: '#8b5cf6' },
];

const mockTableData = [
    {
        user: 'João Silva',
        conversations: 45,
        satisfaction: 4.8,
        avgResponse: '2.1s',
        lastActivity: '2 horas atrás',
        status: 'Ativo'
    },
    {
        user: 'Maria Santos',
        conversations: 38,
        satisfaction: 4.9,
        avgResponse: '1.8s',
        lastActivity: '1 hora atrás',
        status: 'Ativo'
    },
    {
        user: 'Pedro Costa',
        conversations: 52,
        satisfaction: 4.6,
        avgResponse: '2.4s',
        lastActivity: '30 min atrás',
        status: 'Ativo'
    },
    {
        user: 'Ana Lima',
        conversations: 29,
        satisfaction: 4.7,
        avgResponse: '2.0s',
        lastActivity: '5 horas atrás',
        status: 'Inativo'
    },
    {
        user: 'Carlos Oliveira',
        conversations: 41,
        satisfaction: 4.5,
        avgResponse: '2.6s',
        lastActivity: '1 dia atrás',
        status: 'Inativo'
    },
];

const tableColumns = [
    { key: 'user', title: 'Usuário', sortable: true },
    { key: 'conversations', title: 'Conversas', sortable: true },
    {
        key: 'satisfaction',
        title: 'Satisfação',
        sortable: true,
        render: (value: number) => (
            <div className="flex items-center space-x-1">
                <span>{value}</span>
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            </div>
        )
    },
    { key: 'avgResponse', title: 'Tempo Resp.', sortable: true },
    { key: 'lastActivity', title: 'Última Atividade', sortable: false },
    {
        key: 'status',
        title: 'Status',
        sortable: true,
        render: (value: string) => (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${value === 'Ativo'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
                }`}>
                {value}
            </span>
        )
    },
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Acompanhe o desempenho do seu chatbot em tempo real</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockMetrics.map((metric, index) => (
                    <MetricCard
                        key={index}
                        title={metric.title}
                        value={metric.value}
                        change={metric.change}
                        icon={metric.icon}
                    />
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimpleChart
                    title="Conversas por Mês"
                    data={mockChartData}
                    type="line"
                    height={300}
                />

                <SimpleChart
                    title="Tópicos Mais Discutidos"
                    data={mockTopicData}
                    type="doughnut"
                    height={300}
                />
            </div>

            {/* Performance Chart */}
            <SimpleChart
                title="Volume de Conversas Diárias"
                data={[
                    { label: 'Seg', value: 320 },
                    { label: 'Ter', value: 425 },
                    { label: 'Qua', value: 380 },
                    { label: 'Qui', value: 490 },
                    { label: 'Sex', value: 520 },
                    { label: 'Sáb', value: 280 },
                    { label: 'Dom', value: 190 },
                ]}
                type="bar"
                height={300}
            />

            {/* Data Table */}
            <DataTable
                title="Top Usuários por Atividade"
                columns={tableColumns}
                data={mockTableData}
                pageSize={5}
                searchable={true}
            />

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">Resolução de Problemas</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Resolvidos automaticamente</span>
                                <span className="text-sm font-medium">78%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Transferidos para humano</span>
                                <span className="text-sm font-medium">22%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">Horários de Pico</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                <span className="text-sm font-medium">14:00 - 16:00</span>
                                <span className="text-xs text-blue-600">Maior volume</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm font-medium">09:00 - 11:00</span>
                                <span className="text-xs text-gray-600">Alto volume</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm font-medium">20:00 - 22:00</span>
                                <span className="text-xs text-gray-600">Médio volume</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">Canais de Comunicação</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { name: 'Website Chat', percent: 45, color: 'bg-blue-500' },
                                { name: 'WhatsApp', percent: 30, color: 'bg-green-500' },
                                { name: 'Facebook', percent: 15, color: 'bg-purple-500' },
                                { name: 'Telegram', percent: 10, color: 'bg-cyan-500' },
                            ].map((channel, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-700">{channel.name}</span>
                                        <span className="font-medium">{channel.percent}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`${channel.color} h-2 rounded-full`}
                                            style={{ width: `${channel.percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
