'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { useConversation, useConversationHistory, useConversations } from '@/lib/hooks/useConversations';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    UserIcon,
    ChatBubbleLeftRightIcon,
    DocumentIcon,
    ClockIcon,
    PlayIcon,
    StopIcon,
    ArrowPathIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ConversationDetailProps {
    conversationId: string;
    onClose: () => void;
    className?: string;
}

export const ConversationDetail: React.FC<ConversationDetailProps> = ({
    conversationId,
    onClose,
    className = ''
}) => {
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const {
        conversation,
        isLoading: conversationLoading,
        error: conversationError,
        refreshConversation
    } = useConversation(conversationId ? Number(conversationId) : null);

    const {
        history: messageHistory,
        isLoading: historyLoading,
        error: historyError,
        refreshHistory
    } = useConversationHistory(conversationId ? Number(conversationId) : null);

    const {
        endConversation,
        restartConversation
    } = useConversations();

    const isLoading = conversationLoading || historyLoading;
    const error = conversationError || historyError;

    const refreshDetail = async () => {
        await refreshConversation();
        await refreshHistory();
    };

    const handleAction = async (action: string) => {
        setActionLoading(action);
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
            await refreshDetail();
        } catch (error) {
            console.error('Erro ao executar ação:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusInfo = (status: string) => {
        const statusConfig = {
            'active': {
                label: 'Ativo',
                variant: 'success',
                icon: CheckCircleIcon,
                description: 'Conversa em andamento'
            },
            'waiting_file': {
                label: 'Aguardando Arquivo',
                variant: 'warning',
                icon: DocumentIcon,
                description: 'Aguardando o usuário enviar um arquivo'
            },
            'completed': {
                label: 'Concluído',
                variant: 'info',
                icon: CheckCircleIcon,
                description: 'Conversa finalizada com sucesso'
            },
            'error': {
                label: 'Erro',
                variant: 'error',
                icon: ExclamationTriangleIcon,
                description: 'Ocorreu um erro na conversa'
            },
            'paused': {
                label: 'Pausado',
                variant: 'secondary',
                icon: InformationCircleIcon,
                description: 'Conversa pausada pelo sistema'
            }
        } as const;

        return statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    };

    const exportHistory = () => {
        if (!messageHistory || messageHistory.length === 0) return;

        const content = messageHistory.map((msg: any) =>
            `[${format(new Date(msg.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}] ` +
            `${msg.is_from_bot ? 'Bot' : 'Usuário'}: ${msg.message_text || msg.file_url || 'Arquivo'}`
        ).join('\n');

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversa_${conversationId}_historico.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (error) {
        return (
            <Modal isOpen onClose={onClose} size="lg">
                <div className="p-6">
                    <Alert variant="error">
                        <p>Erro ao carregar detalhes da conversa: {error}</p>
                        <Button
                            size="sm"
                            onClick={refreshDetail}
                            className="mt-2"
                        >
                            <ArrowPathIcon className="h-4 w-4 mr-2" />
                            Tentar novamente
                        </Button>
                    </Alert>
                </div>
            </Modal>
        );
    }

    const statusInfo = conversation ? getStatusInfo(conversation.status) : null;
    const StatusIcon = statusInfo?.icon || InformationCircleIcon;

    return (
        <Modal isOpen onClose={onClose} size="xl">
            <div className="flex flex-col h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                        <div>
                            <h2 className="text-xl font-semibold">
                                Detalhes da Conversa
                            </h2>
                            <p className="text-sm text-gray-600">
                                {conversation ? `Contato: ${conversation.contact_id}` : 'Carregando...'}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loading size="lg" text="Carregando detalhes..." />
                        </div>
                    ) : conversation ? (
                        <div className="h-full flex">
                            {/* Sidebar com informações */}
                            <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto">
                                <div className="space-y-6">
                                    {/* Status */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Status</h3>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <StatusIcon className="h-5 w-5 text-current" />
                                            <Badge variant={statusInfo?.variant as any}>
                                                {statusInfo?.label}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {statusInfo?.description}
                                        </p>
                                    </div>

                                    {/* Informações básicas */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Informações</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Contato:</span>
                                                <span className="font-medium">{conversation.contact_id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Template:</span>
                                                <span className="font-medium">{conversation.template_name || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Fluxo:</span>
                                                <span className="font-medium">{conversation.flow_name || 'Principal'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Etapa:</span>
                                                <span className="font-medium">
                                                    {conversation.current_step || 0} / {conversation.total_steps || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timestamps */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Cronologia</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <ClockIcon className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <div className="text-gray-600">Iniciado</div>
                                                    <div className="font-medium">
                                                        {format(new Date(conversation.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatDistanceToNow(new Date(conversation.created_at), {
                                                            addSuffix: true,
                                                            locale: ptBR
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {conversation.updated_at && (
                                                <div className="flex items-center space-x-2">
                                                    <ArrowPathIcon className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <div className="text-gray-600">Última atividade</div>
                                                        <div className="font-medium">
                                                            {format(new Date(conversation.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {formatDistanceToNow(new Date(conversation.updated_at), {
                                                                addSuffix: true,
                                                                locale: ptBR
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ações */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Ações</h3>
                                        <div className="space-y-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={refreshDetail}
                                                disabled={isLoading}
                                                className="w-full"
                                            >
                                                <ArrowPathIcon className="h-4 w-4 mr-2" />
                                                Atualizar
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={exportHistory}
                                                disabled={!messageHistory || messageHistory.length === 0}
                                                className="w-full"
                                            >
                                                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                                Exportar Histórico
                                            </Button>

                                            {conversation.status === 'active' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAction('finish')}
                                                    disabled={actionLoading !== null}
                                                    className="w-full"
                                                >
                                                    {actionLoading === 'finish' ? (
                                                        <Loading size="sm" />
                                                    ) : (
                                                        <>
                                                            <StopIcon className="h-4 w-4 mr-2" />
                                                            Finalizar
                                                        </>
                                                    )}
                                                </Button>
                                            )}

                                            {['completed', 'error'].includes(conversation.status) && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAction('restart')}
                                                    disabled={actionLoading !== null}
                                                    className="w-full"
                                                >
                                                    {actionLoading === 'restart' ? (
                                                        <Loading size="sm" />
                                                    ) : (
                                                        <>
                                                            <PlayIcon className="h-4 w-4 mr-2" />
                                                            Reiniciar
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Área principal - Histórico de mensagens */}
                            <div className="flex-1 flex flex-col">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold">Histórico de Mensagens</h3>
                                    <p className="text-sm text-gray-600">
                                        {messageHistory?.length || 0} mensagens
                                    </p>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4">
                                    {messageHistory && messageHistory.length > 0 ? (
                                        <div className="space-y-4">
                                            {messageHistory.map((message: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className={`flex ${message.is_from_bot ? 'justify-start' : 'justify-end'}`}
                                                >
                                                    <div
                                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.is_from_bot
                                                                ? 'bg-gray-100 text-gray-900'
                                                                : 'bg-blue-600 text-white'
                                                            }`}
                                                    >
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            {message.is_from_bot ? (
                                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                                    <span className="text-white text-xs font-bold">B</span>
                                                                </div>
                                                            ) : (
                                                                <UserIcon className="h-5 w-5" />
                                                            )}
                                                            <span className="text-xs opacity-75">
                                                                {format(new Date(message.created_at), 'HH:mm', { locale: ptBR })}
                                                            </span>
                                                        </div>

                                                        {message.message_text && (
                                                            <p className="text-sm">{message.message_text}</p>
                                                        )}

                                                        {message.file_url && (
                                                            <div className="flex items-center space-x-2 mt-2">
                                                                <DocumentIcon className="h-4 w-4" />
                                                                <a
                                                                    href={message.file_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm underline hover:no-underline"
                                                                >
                                                                    Arquivo anexo
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">
                                                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-sm font-medium text-gray-900">
                                                    Nenhuma mensagem encontrada
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    O histórico de mensagens desta conversa está vazio.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
};
