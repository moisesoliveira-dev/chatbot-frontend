'use client';

import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';

interface RealTimeEvent {
    id: string;
    type: 'message' | 'conversation_start' | 'conversation_end' | 'bot_status' | 'file_upload';
    timestamp: string;
    data: any;
    user?: {
        id: string;
        name: string;
    };
}

interface ConnectionStatus {
    connected: boolean;
    reconnecting: boolean;
    error?: string;
}

interface RealTimeUpdatesProps {
    serverUrl?: string;
    className?: string;
    maxEvents?: number;
}

export const RealTimeUpdates: React.FC<RealTimeUpdatesProps> = ({
    serverUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
    className,
    maxEvents = 50
}) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [events, setEvents] = useState<RealTimeEvent[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        connected: false,
        reconnecting: false
    });
    const [isEnabled, setIsEnabled] = useState(true);

    useEffect(() => {
        if (!isEnabled) return;

        const newSocket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        const handleEvent = (event: RealTimeEvent) => {
            setEvents(prevEvents => {
                const newEvents = [event, ...prevEvents];
                return newEvents.slice(0, maxEvents);
            });
        };

        // Connection event handlers
        newSocket.on('connect', () => {
            setConnectionStatus({ connected: true, reconnecting: false });
        });

        newSocket.on('disconnect', () => {
            setConnectionStatus({ connected: false, reconnecting: false });
        });

        newSocket.on('connect_error', (error: any) => {
            setConnectionStatus({
                connected: false,
                reconnecting: false,
                error: error.message
            });
        });

        newSocket.on('reconnect', () => {
            setConnectionStatus({ connected: true, reconnecting: false });
        });

        newSocket.on('reconnecting', () => {
            setConnectionStatus({ connected: false, reconnecting: true });
        });

        // Event handlers
        newSocket.on('new_message', (data: any) => {
            handleEvent({
                id: `msg_${Date.now()}_${Math.random()}`,
                type: 'message',
                timestamp: new Date().toISOString(),
                data: {
                    message: data.message,
                    conversation_id: data.conversation_id,
                    direction: data.direction || 'incoming'
                },
                user: data.user
            });
        });

        newSocket.on('conversation_started', (data: any) => {
            handleEvent({
                id: `conv_start_${Date.now()}_${Math.random()}`,
                type: 'conversation_start',
                timestamp: new Date().toISOString(),
                data: {
                    conversation_id: data.conversation_id,
                    channel: data.channel || 'web'
                },
                user: data.user
            });
        });

        newSocket.on('conversation_ended', (data: any) => {
            handleEvent({
                id: `conv_end_${Date.now()}_${Math.random()}`,
                type: 'conversation_end',
                timestamp: new Date().toISOString(),
                data: {
                    conversation_id: data.conversation_id,
                    duration: data.duration,
                    reason: data.reason
                },
                user: data.user
            });
        });

        newSocket.on('bot_status_changed', (data: any) => {
            handleEvent({
                id: `bot_${Date.now()}_${Math.random()}`,
                type: 'bot_status',
                timestamp: new Date().toISOString(),
                data: {
                    status: data.status,
                    previous_status: data.previous_status
                }
            });
        });

        newSocket.on('file_uploaded', (data: any) => {
            handleEvent({
                id: `file_${Date.now()}_${Math.random()}`,
                type: 'file_upload',
                timestamp: new Date().toISOString(),
                data: {
                    file_name: data.file_name,
                    file_type: data.file_type,
                    file_size: data.file_size,
                    conversation_id: data.conversation_id
                },
                user: data.user
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [serverUrl, isEnabled, maxEvents]);

    const addEvent = (event: RealTimeEvent) => {
        setEvents(prevEvents => {
            const newEvents = [event, ...prevEvents];
            return newEvents.slice(0, maxEvents);
        });
    };

    const clearEvents = () => {
        setEvents([]);
    };

    const toggleConnection = () => {
        setIsEnabled(!isEnabled);
        if (isEnabled && socket) {
            socket.disconnect();
        }
    };

    const getEventIcon = (type: RealTimeEvent['type']) => {
        switch (type) {
            case 'message':
                return '💬';
            case 'conversation_start':
                return '🟢';
            case 'conversation_end':
                return '🔴';
            case 'bot_status':
                return '🤖';
            case 'file_upload':
                return '📎';
            default:
                return '📋';
        }
    };

    const getEventTitle = (event: RealTimeEvent) => {
        switch (event.type) {
            case 'message':
                return `Nova mensagem ${event.data.direction === 'outgoing' ? 'enviada' : 'recebida'}`;
            case 'conversation_start':
                return 'Nova conversa iniciada';
            case 'conversation_end':
                return 'Conversa finalizada';
            case 'bot_status':
                return 'Status do bot alterado';
            case 'file_upload':
                return 'Arquivo enviado';
            default:
                return 'Evento';
        }
    };

    const getEventDescription = (event: RealTimeEvent) => {
        switch (event.type) {
            case 'message':
                return event.data.message || 'Mensagem sem conteúdo';
            case 'conversation_start':
                return `Canal: ${event.data.channel}`;
            case 'conversation_end':
                return `Duração: ${event.data.duration || 'N/A'} - Motivo: ${event.data.reason || 'Finalizada'}`;
            case 'bot_status':
                return `${event.data.previous_status} → ${event.data.status}`;
            case 'file_upload':
                return `${event.data.file_name} (${event.data.file_type}) - ${event.data.file_size}`;
            default:
                return 'Evento em tempo real';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Atualizações em Tempo Real
                        </h3>
                        <p className="text-sm text-gray-600">
                            Eventos ao vivo do sistema
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                            <div
                                className={`w-2 h-2 rounded-full ${connectionStatus.connected
                                        ? 'bg-green-500'
                                        : connectionStatus.reconnecting
                                            ? 'bg-yellow-500 animate-pulse'
                                            : 'bg-red-500'
                                    }`}
                            />
                            <span className="text-xs text-gray-500">
                                {connectionStatus.connected
                                    ? 'Conectado'
                                    : connectionStatus.reconnecting
                                        ? 'Reconectando...'
                                        : 'Desconectado'}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleConnection}
                        >
                            {isEnabled ? 'Pausar' : 'Conectar'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearEvents}
                            disabled={events.length === 0}
                        >
                            Limpar
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {connectionStatus.error && (
                    <Alert variant="error" className="mb-4">
                        <p>Erro na conexão: {connectionStatus.error}</p>
                        <p className="text-xs mt-1">
                            Tentando reconectar automaticamente...
                        </p>
                    </Alert>
                )}

                {!isEnabled && (
                    <div className="text-center py-8 text-gray-500">
                        <p>Atualizações em tempo real pausadas</p>
                        <p className="text-sm">Clique em &quot;Conectar&quot; para retomar</p>
                    </div>
                )}

                {isEnabled && events.length === 0 && (
                    <div className="text-center py-8">
                        {connectionStatus.connected ? (
                            <div className="text-gray-500">
                                <Loading variant="dots" size="sm" />
                                <p className="mt-2">Aguardando eventos...</p>
                            </div>
                        ) : (
                            <div className="text-gray-500">
                                <p>Estabelecendo conexão...</p>
                                <Loading variant="spinner" size="sm" className="mt-2" />
                            </div>
                        )}
                    </div>
                )}

                {isEnabled && events.length > 0 && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border animate-fadeIn"
                            >
                                <div className="text-2xl flex-shrink-0 mt-0.5">
                                    {getEventIcon(event.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {getEventTitle(event)}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {getEventDescription(event)}
                                            </p>
                                            {event.user && (
                                                <p className="text-xs text-blue-600 mt-1">
                                                    👤 {event.user.name || event.user.id}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {event.type}
                                            </Badge>
                                            <span className="text-xs text-gray-500">
                                                {formatTimestamp(event.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {events.length > 0 && (
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            Mostrando {events.length} de {maxEvents} eventos máximos
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
