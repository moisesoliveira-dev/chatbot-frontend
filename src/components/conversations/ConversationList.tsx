'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { useConversations } from '@/lib/hooks/useConversations';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    ChatBubbleLeftIcon,
    ClockIcon,
    UserIcon,
    EyeIcon,
    PlayIcon,
    StopIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ConversationListProps {
    filters?: any;
    onViewConversation: (conversation: any) => void;
    className?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
    filters = {},
    onViewConversation,
    className = ''
}) => {
    const [page, setPage] = useState(1);

    const {
        conversations,
        isLoading,
        error,
        refreshConversations,
        endConversation,
        restartConversation
    } = useConversations({
        ...filters,
        page,
        per_page: 10
    });

    const getStatusBadge = (status: string) => {
        const statusColors = {
            'active': 'success',
            'waiting_file': 'warning',
            'completed': 'info',
            'error': 'danger',
            'paused': 'gray'
        } as const;

        const statusLabels = {
            'active': 'Ativo',
            'waiting_file': 'Aguardando Arquivo',
            'completed': 'Concluído',
            'error': 'Erro',
            'paused': 'Pausado'
        } as const;

        return (
            <Badge
                variant={statusColors[status as keyof typeof statusColors] || 'secondary'}
                size="sm"
            >
                {statusLabels[status as keyof typeof statusLabels] || status}
            </Badge>
        );
    };

    const handleAction = async (action: string, conversationId: string) => {
        try {
            switch (action) {
                case 'finish':
                    await endConversation(Number(conversationId));
                    break;
                case 'restart':
                    await restartConversation(Number(conversationId));
                    break;
                default:
                    break;
            }
            await refreshConversations();
        } catch (error) {
            console.error('Erro ao executar ação:', error);
        }
    };

    const columns = [
        {
            key: 'contact_id',
            header: 'Contato',
            render: (conversation: any) => (
                <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{conversation.contact_id}</span>
                </div>
            )
        },
        {
            key: 'template_name',
            header: 'Template',
            render: (conversation: any) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                        {conversation.template_name || 'N/A'}
                    </span>
                    <span className="text-sm text-gray-500">
                        {conversation.flow_name || 'Fluxo principal'}
                    </span>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (conversation: any) => getStatusBadge(conversation.status)
        },
        {
            key: 'current_step',
            header: 'Etapa Atual',
            render: (conversation: any) => (
                <div className="flex items-center space-x-1">
                    <ChatBubbleLeftIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                        {conversation.current_step || 0} / {conversation.total_steps || 0}
                    </span>
                </div>
            )
        },
        {
            key: 'created_at',
            header: 'Iniciado',
            render: (conversation: any) => (
                <div className="flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(conversation.created_at), {
                            addSuffix: true,
                            locale: ptBR
                        })}
                    </span>
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Ações',
            render: (conversation: any) => (
                <div className="flex items-center space-x-1">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewConversation(conversation)}
                        className="h-8 w-8 p-0"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Button>

                    {conversation.status === 'active' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction('finish', conversation.id)}
                            className="h-8 w-8 p-0"
                        >
                            <StopIcon className="h-4 w-4" />
                        </Button>
                    )}

                    {['completed', 'error'].includes(conversation.status) && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction('restart', conversation.id)}
                            className="h-8 w-8 p-0"
                        >
                            <PlayIcon className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )
        }
    ];

    if (error) {
        return (
            <Alert variant="error" className={className}>
                <p>Erro ao carregar conversas: {error}</p>
                <Button
                    size="sm"
                    onClick={refreshConversations}
                    className="mt-2"
                >
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Tentar novamente
                </Button>
            </Alert>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Conversas Ativas</h3>
                    <p className="text-sm text-gray-600">
                        {conversations?.length || 0} conversas encontradas
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={refreshConversations}
                        disabled={isLoading}
                    >
                        <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Atualizar
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <Loading size="lg" text="Carregando conversas..." />
                ) : conversations?.length === 0 ? (
                    <div className="text-center py-8">
                        <ChatBubbleLeftIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-sm font-medium text-gray-900">Nenhuma conversa encontrada</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Não há conversas que correspondem aos filtros selecionados.
                        </p>
                    </div>
                ) : (
                    <>
                        <Table
                            data={conversations || []}
                            columns={columns}
                            className="mb-4"
                        />

                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil((conversations?.length || 0) / 10)}
                            onPageChange={setPage}
                            totalItems={conversations?.length || 0}
                        />
                    </>
                )}
            </CardContent>
        </Card>
    );
};
