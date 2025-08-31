'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
    ConversationList,
    ConversationFilters,
    ConversationDetail
} from '@/components/conversations';
import {
    ChatBubbleLeftRightIcon,
    ChartBarIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

export default function ConversationsPage() {
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        template_id: '',
        contact_id: '',
        dateFrom: '',
        dateTo: '',
        sortBy: 'created_at',
        sortOrder: 'desc'
    });

    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

    const handleFiltersChange = (newFilters: any) => {
        setFilters(newFilters);
    };

    const handleClearFilters = () => {
        setFilters({
            search: '',
            status: '',
            template_id: '',
            contact_id: '',
            dateFrom: '',
            dateTo: '',
            sortBy: 'created_at',
            sortOrder: 'desc'
        });
    };

    const handleViewConversation = (conversation: any) => {
        setSelectedConversation(conversation.id);
    };

    const handleCloseDetail = () => {
        setSelectedConversation(null);
    };

    // Mock statistics (in a real app, this would come from an API)
    const statistics = {
        totalActive: 23,
        waitingFile: 5,
        completed: 147,
        avgResponseTime: '2.3 min'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Monitoramento de Conversas
                    </h1>
                    <p className="text-gray-600">
                        Visualize e gerencie todas as conversas ativas do chatbot
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                        Última atualização: {new Date().toLocaleTimeString('pt-BR')}
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Conversas Ativas
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {statistics.totalActive}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Aguardando Arquivo
                                </p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {statistics.waitingFile}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <ClockIcon className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Concluídas Hoje
                                </p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {statistics.completed}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ChartBarIcon className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Tempo Médio de Resposta
                                </p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {statistics.avgResponseTime}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <ClockIcon className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar with Filters */}
                <div className="lg:col-span-1">
                    <ConversationFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onClearFilters={handleClearFilters}
                    />

                    <Card className="mt-4">
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Estatísticas Detalhadas</h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Taxa de conclusão</span>
                                    <Badge variant="success">94.2%</Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Tempo médio por conversa</span>
                                    <Badge variant="info">4.7 min</Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Arquivos processados</span>
                                    <Badge variant="secondary">42 hoje</Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Erros encontrados</span>
                                    <Badge variant="warning">3 hoje</Badge>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                    Templates mais usados
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Atendimento Geral</span>
                                        <span className="font-medium">67%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Suporte Técnico</span>
                                        <span className="font-medium">23%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Vendas</span>
                                        <span className="font-medium">10%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <ConversationList
                        filters={filters}
                        onViewConversation={handleViewConversation}
                    />
                </div>
            </div>

            {/* Conversation Detail Modal */}
            {selectedConversation && (
                <ConversationDetail
                    conversationId={selectedConversation}
                    onClose={handleCloseDetail}
                />
            )}
        </div>
    );
}
