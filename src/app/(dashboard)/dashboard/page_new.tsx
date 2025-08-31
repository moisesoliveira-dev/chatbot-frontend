'use client';

import React from 'react';
import { DashboardStats, BotControls } from '@/components/analytics';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Visão geral do sistema de chatbot
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Sistema Online</span>
                    </div>
                </div>
            </div>

            {/* Estatísticas Principais */}
            <DashboardStats refreshInterval={30000} />

            {/* Layout de duas colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Controles do Bot */}
                <div className="lg:col-span-1">
                    <BotControls />
                </div>

                {/* Atividade Recente */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Atividade Recente
                            </h3>
                            <p className="text-sm text-gray-600">
                                Últimas interações do chatbot
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Item de atividade */}
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-900">
                                                Nova conversa iniciada
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                há 2 minutos
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Usuário iniciou conversa no fluxo &quot;Atendimento Geral&quot;
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-900">
                                                Conversa finalizada com sucesso
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                há 5 minutos
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Fluxo &quot;Suporte Técnico&quot; concluído em 3 minutos
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-900">
                                                Arquivo recebido
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                há 8 minutos
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Documento PDF processado no fluxo &quot;Upload de Documentos&quot;
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center pt-4 border-t border-gray-100">
                                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                        Ver toda atividade
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Gráficos e Análises */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Conversas */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Conversas por Dia
                        </h3>
                        <p className="text-sm text-gray-600">
                            Últimos 7 dias
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <p className="text-sm text-gray-500">
                                    Gráfico em desenvolvimento
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Análise de Fluxos */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Fluxos Mais Usados
                        </h3>
                        <p className="text-sm text-gray-600">
                            Top 5 desta semana
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: 'Atendimento Geral', count: 45, percentage: 35 },
                                { name: 'Suporte Técnico', count: 32, percentage: 25 },
                                { name: 'Vendas', count: 28, percentage: 22 },
                                { name: 'Upload de Documentos', count: 15, percentage: 12 },
                                { name: 'Informações', count: 8, percentage: 6 },
                            ].map((flow, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' :
                                            index === 1 ? 'bg-green-500' :
                                                index === 2 ? 'bg-yellow-500' :
                                                    index === 3 ? 'bg-purple-500' :
                                                        'bg-gray-400'
                                            }`}></div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {flow.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${index === 0 ? 'bg-blue-500' :
                                                    index === 1 ? 'bg-green-500' :
                                                        index === 2 ? 'bg-yellow-500' :
                                                            index === 3 ? 'bg-purple-500' :
                                                                'bg-gray-400'
                                                    }`}
                                                style={{ width: `${flow.percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-8 text-right">
                                            {flow.count}
                                        </span>
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
