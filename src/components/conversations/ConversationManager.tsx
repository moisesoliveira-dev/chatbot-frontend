'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { useConversations } from '@/lib/hooks/useConversations';
import { ConversationFilters, ConversationState } from '@/lib/types';

interface ConversationManagerProps {
    className?: string;
}

export const ConversationManager: React.FC<ConversationManagerProps> = ({ className }) => {
    const [filters, setFilters] = useState<ConversationFilters>({
        page: 1,
        per_page: 10,
        status: undefined,
        contact_id: undefined,
        flow_id: undefined
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const {
        conversations,
        isLoading,
        error,
        refreshConversations
    } = useConversations(filters);

    // Mock data for pagination until backend implements it
    const totalPages = Math.ceil((conversations?.length || 0) / (filters.per_page || 10));
    const totalCount = conversations?.length || 0;

    // Filter conversations based on search term
    const filteredConversations = useMemo(() => {
        if (!conversations || !searchTerm.trim()) return conversations;

        return conversations.filter((conv: any) =>
            conv.template_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.flow_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.contact_id.toString().includes(searchTerm)
        );
    }, [conversations, searchTerm]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const handleFilterChange = (key: keyof ConversationFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filter changes
        }));
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleViewConversation = (conversation: any) => {
        setSelectedConversation(conversation);
        setIsViewerOpen(true);
    };

    const handleExportConversations = () => {
        // TODO: Implement export functionality
        console.log('Exporting conversations...');
    };

    const getStatusBadge = (isActive: boolean, isCompleted: boolean) => {
        if (isCompleted) {
            return <Badge variant="success" size="sm">Concluída</Badge>;
        }
        if (isActive) {
            return <Badge variant="primary" size="sm">Ativa</Badge>;
        }
        return <Badge variant="secondary" size="sm">Pausada</Badge>;
    };

    const columns = [
        {
            key: 'contact_id',
            header: 'Contato',
            accessor: 'contact_id',
            render: (value: number) => (
                <span className="font-mono text-sm">#{value}</span>
            )
        },
        {
            key: 'template_name',
            header: 'Template',
            accessor: 'template_name',
            render: (value: string) => (
                <span className="font-medium text-gray-900">{value || 'N/A'}</span>
            )
        },
        {
            key: 'flow_name',
            header: 'Fluxo Atual',
            accessor: 'flow_name',
            render: (value: string) => (
                <span className="text-sm text-gray-600">{value || 'N/A'}</span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (value: any, item: any) => getStatusBadge(item.is_active, item.is_completed)
        },
        {
            key: 'started_at',
            header: 'Iniciada',
            accessor: 'started_at',
            render: (value: string) => (
                <span className="text-sm text-gray-500">
                    {new Date(value).toLocaleDateString('pt-BR')}
                </span>
            )
        },
        {
            key: 'last_interaction',
            header: 'Última Interação',
            accessor: 'last_interaction',
            render: (value: string) => (
                <span className="text-sm text-gray-500">
                    {new Date(value).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Ações',
            render: (value: any, item: any) => (
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleViewConversation(item)}
                    >
                        Ver
                    </Button>
                </div>
            )
        }
    ];

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="p-6">
                    <div className="text-center">
                        <div className="text-red-600 mb-2">
                            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-600">Erro ao carregar conversas</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshConversations}
                            className="mt-3"
                        >
                            Tentar novamente
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className={className}>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Gerenciamento de Conversas
                            </h3>
                            <p className="text-sm text-gray-600">
                                {totalCount > 0 ? `${totalCount} conversas encontradas` : 'Nenhuma conversa encontrada'}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportConversations}
                                disabled={!conversations?.length}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Exportar
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={refreshConversations}
                                loading={isLoading}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Atualizar
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Filters and Search */}
                    <div className="mb-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input
                                placeholder="Buscar conversas..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="md:col-span-2"
                            />

                            <Select
                                placeholder="Status"
                                value={filters.status || ''}
                                onValueChange={(value: string) => handleFilterChange('status', value || undefined)}
                                options={[
                                    { value: '', label: 'Todos os status' },
                                    { value: 'active', label: 'Ativas' },
                                    { value: 'completed', label: 'Concluídas' },
                                    { value: 'paused', label: 'Pausadas' }
                                ]}
                            />

                            <Input
                                type="number"
                                placeholder="ID do Contato"
                                value={filters.contact_id?.toString() || ''}
                                onChange={(e) => handleFilterChange('contact_id', e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <Table
                        data={filteredConversations || []}
                        columns={columns}
                        loading={isLoading}
                        empty={
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-gray-500">Nenhuma conversa encontrada</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Ajuste os filtros ou aguarde novas conversas
                                </p>
                            </div>
                        }
                    />

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={filters.page || 1}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Conversation Viewer Modal */}
            <Modal
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                title="Detalhes da Conversa"
                size="lg"
            >
                {selectedConversation && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Contato</label>
                                <p className="text-sm text-gray-900">#{selectedConversation.contact_id}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Template</label>
                                <p className="text-sm text-gray-900">{selectedConversation.template_name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Fluxo Atual</label>
                                <p className="text-sm text-gray-900">{selectedConversation.flow_name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <div className="mt-1">
                                    {getStatusBadge(selectedConversation.is_active, selectedConversation.is_completed)}
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <label className="text-sm font-medium text-gray-700">Variáveis da Conversa</label>
                            <div className="mt-2 bg-gray-50 rounded-lg p-3">
                                <pre className="text-xs text-gray-700 overflow-auto">
                                    {JSON.stringify(selectedConversation.variables, null, 2)}
                                </pre>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setIsViewerOpen(false)}
                            >
                                Fechar
                            </Button>
                            <Button variant="primary">
                                Ver Histórico Completo
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};
