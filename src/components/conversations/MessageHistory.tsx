'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    UserIcon,
    DocumentIcon,
    ChatBubbleLeftRightIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface MessageHistoryProps {
    conversationId: string;
    messages: any[];
    isLoading?: boolean;
    onExport?: () => void;
    className?: string;
}

export const MessageHistory: React.FC<MessageHistoryProps> = ({
    conversationId,
    messages,
    isLoading = false,
    onExport,
    className = ''
}) => {
    if (isLoading) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center py-12">
                    <Loading size="lg" text="Carregando histórico..." />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Histórico de Mensagens</h3>
                    <p className="text-sm text-gray-600">
                        {messages.length} mensagens na conversa
                    </p>
                </div>

                {onExport && messages.length > 0 && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onExport}
                    >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                )}
            </CardHeader>

            <CardContent>
                {messages.length === 0 ? (
                    <div className="text-center py-8">
                        <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-sm font-medium text-gray-900">
                            Nenhuma mensagem encontrada
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            O histórico de mensagens desta conversa está vazio.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {messages.map((message: any, index: number) => (
                            <div key={index} className="flex items-start space-x-3">
                                {/* Avatar */}
                                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${message.is_from_bot
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-gray-100 text-gray-600'
                                    }
                `}>
                                    {message.is_from_bot ? (
                                        <span className="text-xs font-bold">B</span>
                                    ) : (
                                        <UserIcon className="h-4 w-4" />
                                    )}
                                </div>

                                {/* Conteúdo da mensagem */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-sm font-medium text-gray-900">
                                            {message.is_from_bot ? 'Bot' : 'Usuário'}
                                        </span>

                                        <Badge variant="secondary" size="sm">
                                            {format(new Date(message.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                                        </Badge>

                                        {message.message_type && (
                                            <Badge variant="secondary" size="sm">
                                                {message.message_type}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Texto da mensagem */}
                                    {message.message_text && (
                                        <div className={`
                      p-3 rounded-lg text-sm
                      ${message.is_from_bot
                                                ? 'bg-blue-50 border border-blue-100'
                                                : 'bg-gray-50 border border-gray-100'
                                            }
                    `}>
                                            <p className="whitespace-pre-wrap">{message.message_text}</p>
                                        </div>
                                    )}

                                    {/* Arquivo anexo */}
                                    {message.file_url && (
                                        <div className={`
                      p-3 rounded-lg text-sm mt-2 flex items-center space-x-2
                      ${message.is_from_bot
                                                ? 'bg-blue-50 border border-blue-100'
                                                : 'bg-gray-50 border border-gray-100'
                                            }
                    `}>
                                            <DocumentIcon className="h-5 w-5 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="font-medium">Arquivo anexado</p>
                                                <a
                                                    href={message.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 underline text-xs"
                                                >
                                                    Visualizar arquivo
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Metadados adicionais */}
                                    {message.metadata && Object.keys(message.metadata).length > 0 && (
                                        <div className="mt-2">
                                            <details className="text-xs text-gray-500">
                                                <summary className="cursor-pointer hover:text-gray-700">
                                                    Metadados
                                                </summary>
                                                <pre className="mt-1 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                                                    {JSON.stringify(message.metadata, null, 2)}
                                                </pre>
                                            </details>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
