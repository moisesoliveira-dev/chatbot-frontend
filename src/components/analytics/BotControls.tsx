'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { useBotStatus } from '@/lib/hooks/useBotStatus';

interface BotControlsProps {
    className?: string;
}

export const BotControls: React.FC<BotControlsProps> = ({ className }) => {
    const {
        status,
        isLoading,
        error,
        enableBot,
        disableBot,
        toggleTestMode,
        refreshStatus
    } = useBotStatus();

    const [actionLoading, setActionLoading] = useState({
        toggle: false,
        testMode: false,
        restart: false
    });

    const handleToggleBot = async () => {
        setActionLoading(prev => ({ ...prev, toggle: true }));
        try {
            if (status?.bot_enabled) {
                await disableBot();
            } else {
                await enableBot();
            }
        } finally {
            setActionLoading(prev => ({ ...prev, toggle: false }));
        }
    };

    const handleToggleTestMode = async () => {
        setActionLoading(prev => ({ ...prev, testMode: true }));
        try {
            await toggleTestMode(!status?.test_mode);
        } finally {
            setActionLoading(prev => ({ ...prev, testMode: false }));
        }
    };

    const handleRestartBot = async () => {
        setActionLoading(prev => ({ ...prev, restart: true }));
        try {
            // Implementation for restart functionality
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
            await refreshStatus();
        } finally {
            setActionLoading(prev => ({ ...prev, restart: false }));
        }
    };

    const getStatusBadge = () => {
        if (isLoading) return <Loading variant="spinner" size="sm" />;

        const statusConfig = {
            active: { variant: 'success' as const, text: 'Ativo', color: 'text-green-600' },
            paused: { variant: 'warning' as const, text: 'Pausado', color: 'text-yellow-600' },
            maintenance: { variant: 'warning' as const, text: 'Manutenção', color: 'text-yellow-600' }
        };

        const config = statusConfig[status?.bot_status as keyof typeof statusConfig] || statusConfig.paused;

        return (
            <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${status?.bot_status === 'active' ? 'bg-green-500' :
                        status?.bot_status === 'paused' ? 'bg-yellow-500' :
                            status?.bot_status === 'maintenance' ? 'bg-yellow-500' :
                                'bg-gray-500'
                    }`}></div>
                <Badge variant={config.variant} size="sm">
                    {config.text}
                </Badge>
            </div>
        );
    };

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Controles do Bot
                    </h3>
                    {getStatusBadge()}
                </div>
                <p className="text-sm text-gray-600">
                    Gerencie o status e configurações do chatbot
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">Erro de Conexão</p>
                                <p className="text-sm text-red-600 mt-1">
                                    Não foi possível conectar com o backend. Verifique se o serviço está rodando.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bot Status Toggle */}
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3">
                            <div className="text-lg">🤖</div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Bot Principal</p>
                                <p className="text-xs text-gray-500">
                                    {status?.bot_enabled ? 'Respondendo mensagens' : 'Parado'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Switch
                        checked={status?.bot_enabled || false}
                        onCheckedChange={handleToggleBot}
                        disabled={isLoading || actionLoading.toggle}
                        size="lg"
                    />
                </div>

                {/* Test Mode Toggle */}
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3">
                            <div className="text-lg">🧪</div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Modo Teste</p>
                                <p className="text-xs text-gray-500">
                                    {status?.test_mode ? 'Ativo - logs detalhados habilitados' : 'Desabilitado'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Switch
                        checked={status?.test_mode || false}
                        onCheckedChange={handleToggleTestMode}
                        disabled={isLoading || actionLoading.testMode}
                        size="md"
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center py-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                            {status?.uptime_seconds ?
                                `${Math.floor(status.uptime_seconds / 3600)}h` :
                                '0h'
                            }
                        </p>
                        <p className="text-xs text-gray-600">Tempo Online</p>
                    </div>
                    <div className="text-center py-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                            N/A
                        </p>
                        <p className="text-xs text-gray-600">Mensagens Hoje</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={refreshStatus}
                        loading={isLoading}
                        size="sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Atualizar Status
                    </Button>

                    <Button
                        variant="warning"
                        fullWidth
                        onClick={handleRestartBot}
                        loading={actionLoading.restart}
                        disabled={!status?.bot_enabled}
                        size="sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reiniciar Bot
                    </Button>
                </div>

                {/* Last Update */}
                <div className="text-xs text-gray-500 text-center border-t border-gray-100 pt-3">
                    Última atualização: {status?.last_heartbeat ?
                        new Date(status.last_heartbeat).toLocaleString('pt-BR') :
                        'Nunca'
                    }
                </div>
            </CardContent>
        </Card>
    );
};
