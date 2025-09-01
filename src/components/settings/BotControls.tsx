'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/Progress';
import {
    PlayIcon,
    PauseIcon,
    StopIcon,
    ArrowPathIcon,
    SignalIcon,
    CpuChipIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

interface BotStatus {
    isActive: boolean;
    isHealthy: boolean;
    uptime: number;
    lastHeartbeat: Date;
    responseTime: number;
    activeConnections: number;
    messagesPerMinute: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
}

interface BotConfiguration {
    autoStart: boolean;
    maxConnections: number;
    responseTimeout: number;
    retryAttempts: number;
    healthCheckInterval: number;
    logLevel: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
    enableMetrics: boolean;
    enableErrorRecovery: boolean;
    testMode: boolean;
    testWebhookUrl: string;
}

interface BotControlsProps {
    onStatusChange?: (status: BotStatus) => void;
    onConfigChange?: (config: BotConfiguration) => void;
    isLoading?: boolean;
}

const defaultConfig: BotConfiguration = {
    autoStart: true,
    maxConnections: 100,
    responseTimeout: 5000,
    retryAttempts: 3,
    healthCheckInterval: 30,
    logLevel: 'INFO',
    enableMetrics: true,
    enableErrorRecovery: true,
    testMode: false,
    testWebhookUrl: ''
};

const defaultStatus: BotStatus = {
    isActive: false,
    isHealthy: true,
    uptime: 0,
    lastHeartbeat: new Date(),
    responseTime: 0,
    activeConnections: 0,
    messagesPerMinute: 0,
    errorRate: 0,
    memoryUsage: 0,
    cpuUsage: 0
};

export const BotControls: React.FC<BotControlsProps> = ({
    onStatusChange,
    onConfigChange,
    isLoading = false
}) => {
    const [status, setStatus] = useState<BotStatus>(defaultStatus);
    const [config, setConfig] = useState<BotConfiguration>(defaultConfig);
    const [isStarting, setIsStarting] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [isRestarting, setIsRestarting] = useState(false);
    const [lastAction, setLastAction] = useState<string>('');

    // Simular atualização de status em tempo real
    useEffect(() => {
        const interval = setInterval(() => {
            if (status.isActive) {
                setStatus(prev => ({
                    ...prev,
                    uptime: prev.uptime + 1,
                    lastHeartbeat: new Date(),
                    responseTime: Math.floor(Math.random() * 100) + 50,
                    activeConnections: Math.floor(Math.random() * config.maxConnections),
                    messagesPerMinute: Math.floor(Math.random() * 50) + 10,
                    errorRate: Math.random() * 2,
                    memoryUsage: Math.floor(Math.random() * 30) + 40,
                    cpuUsage: Math.floor(Math.random() * 20) + 10
                }));
            }
        }, config.healthCheckInterval * 1000);

        return () => clearInterval(interval);
    }, [status.isActive, config.healthCheckInterval]);

    const updateConfig = useCallback(<K extends keyof BotConfiguration>(
        key: K,
        value: BotConfiguration[K]
    ) => {
        setConfig(prev => {
            const newConfig = { ...prev, [key]: value };
            onConfigChange?.(newConfig);
            return newConfig;
        });
    }, [onConfigChange]);

    const handleStart = useCallback(async () => {
        setIsStarting(true);
        setLastAction('Iniciando bot...');

        try {
            // Simular chamada de API
            await new Promise(resolve => setTimeout(resolve, 2000));

            setStatus(prev => ({
                ...prev,
                isActive: true,
                isHealthy: true,
                uptime: 0,
                lastHeartbeat: new Date()
            }));

            onStatusChange?.(status);
            setLastAction('Bot iniciado com sucesso');
        } catch (error) {
            setLastAction('Erro ao iniciar bot');
            console.error('Erro ao iniciar bot:', error);
        } finally {
            setIsStarting(false);
        }
    }, [status, onStatusChange]);

    const handleStop = useCallback(async () => {
        setIsStopping(true);
        setLastAction('Parando bot...');

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            setStatus(prev => ({
                ...prev,
                isActive: false,
                activeConnections: 0,
                messagesPerMinute: 0
            }));

            onStatusChange?.(status);
            setLastAction('Bot parado com sucesso');
        } catch (error) {
            setLastAction('Erro ao parar bot');
            console.error('Erro ao parar bot:', error);
        } finally {
            setIsStopping(false);
        }
    }, [status, onStatusChange]);

    const handleRestart = useCallback(async () => {
        setIsRestarting(true);
        setLastAction('Reiniciando bot...');

        try {
            // Parar
            await new Promise(resolve => setTimeout(resolve, 1000));
            setStatus(prev => ({ ...prev, isActive: false, activeConnections: 0 }));

            // Iniciar novamente
            await new Promise(resolve => setTimeout(resolve, 1500));
            setStatus(prev => ({
                ...prev,
                isActive: true,
                isHealthy: true,
                uptime: 0,
                lastHeartbeat: new Date()
            }));

            onStatusChange?.(status);
            setLastAction('Bot reiniciado com sucesso');
        } catch (error) {
            setLastAction('Erro ao reiniciar bot');
            console.error('Erro ao reiniciar bot:', error);
        } finally {
            setIsRestarting(false);
        }
    }, [status, onStatusChange]);

    const formatUptime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        }
        return `${minutes}m ${secs}s`;
    };

    const getStatusBadge = () => {
        if (!status.isActive) {
            return <Badge variant="danger">Inativo</Badge>;
        }
        if (!status.isHealthy) {
            return <Badge variant="warning">Problema</Badge>;
        }
        return <Badge variant="success">Ativo</Badge>;
    };

    const getHealthStatus = () => {
        if (!status.isActive) return 'stopped';
        if (status.errorRate > 5) return 'error';
        if (status.errorRate > 2 || status.responseTime > 200) return 'warning';
        return 'healthy';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Controles do Bot</h2>
                    <p className="text-gray-600">Gerencie e monitore o status do sistema do chatbot</p>
                </div>
                {getStatusBadge()}
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${status.isActive
                                    ? status.isHealthy ? 'bg-green-100' : 'bg-yellow-100'
                                    : 'bg-gray-100'
                                }`}>
                                <SignalIcon className={`w-5 h-5 ${status.isActive
                                        ? status.isHealthy ? 'text-green-600' : 'text-yellow-600'
                                        : 'text-gray-600'
                                    }`} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="font-semibold">
                                    {status.isActive ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <ClockIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Uptime</p>
                                <p className="font-semibold">
                                    {status.isActive ? formatUptime(status.uptime) : '0m 0s'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <CpuChipIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Conexões</p>
                                <p className="font-semibold">
                                    {status.activeConnections}/{config.maxConnections}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <ArrowPathIcon className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Mensagens/min</p>
                                <p className="font-semibold">{status.messagesPerMinute}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Controles Principais */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Controles Principais</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleStart}
                            disabled={status.isActive || isStarting || isLoading}
                            loading={isStarting}
                            className="flex items-center gap-2"
                        >
                            <PlayIcon className="w-4 h-4" />
                            {isStarting ? 'Iniciando...' : 'Iniciar Bot'}
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={handleStop}
                            disabled={!status.isActive || isStopping || isLoading}
                            loading={isStopping}
                            className="flex items-center gap-2"
                        >
                            <StopIcon className="w-4 h-4" />
                            {isStopping ? 'Parando...' : 'Parar Bot'}
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={handleRestart}
                            disabled={!status.isActive || isRestarting || isLoading}
                            loading={isRestarting}
                            className="flex items-center gap-2"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                            {isRestarting ? 'Reiniciando...' : 'Reiniciar'}
                        </Button>
                    </div>

                    {lastAction && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Última ação:</strong> {lastAction}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Métricas de Performance */}
            {status.isActive && (
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Métricas de Performance</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Tempo de Resposta</span>
                                    <span className="text-sm text-gray-600">{status.responseTime}ms</span>
                                </div>
                                <Progress
                                    value={Math.min(status.responseTime / 10, 100)}
                                    className="h-2"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Taxa de Erro</span>
                                    <span className="text-sm text-gray-600">{status.errorRate.toFixed(1)}%</span>
                                </div>
                                <Progress
                                    value={Math.min(status.errorRate * 10, 100)}
                                    variant={status.errorRate > 2 ? 'error' : 'success'}
                                    className="h-2"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Uso de Memória</span>
                                    <span className="text-sm text-gray-600">{status.memoryUsage}%</span>
                                </div>
                                <Progress
                                    value={status.memoryUsage}
                                    variant={status.memoryUsage > 80 ? 'error' : status.memoryUsage > 60 ? 'warning' : 'success'}
                                    className="h-2"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Uso de CPU</span>
                                    <span className="text-sm text-gray-600">{status.cpuUsage}%</span>
                                </div>
                                <Progress
                                    value={status.cpuUsage}
                                    variant={status.cpuUsage > 80 ? 'error' : status.cpuUsage > 60 ? 'warning' : 'success'}
                                    className="h-2"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Configurações Avançadas */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Configurações Avançadas</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Máximo de Conexões</label>
                            <Input
                                type="number"
                                value={config.maxConnections}
                                onChange={(e) => updateConfig('maxConnections', parseInt(e.target.value) || 0)}
                                min={1}
                                max={1000}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Timeout de Resposta (ms)</label>
                            <Input
                                type="number"
                                value={config.responseTimeout}
                                onChange={(e) => updateConfig('responseTimeout', parseInt(e.target.value) || 0)}
                                min={1000}
                                max={30000}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Tentativas de Retry</label>
                            <Input
                                type="number"
                                value={config.retryAttempts}
                                onChange={(e) => updateConfig('retryAttempts', parseInt(e.target.value) || 0)}
                                min={1}
                                max={10}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Intervalo Health Check (s)</label>
                            <Input
                                type="number"
                                value={config.healthCheckInterval}
                                onChange={(e) => updateConfig('healthCheckInterval', parseInt(e.target.value) || 0)}
                                min={10}
                                max={300}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={config.autoStart}
                                    onCheckedChange={(checked: boolean) => updateConfig('autoStart', checked)}
                                />
                                <span className="text-sm">Início Automático</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={config.enableMetrics}
                                    onCheckedChange={(checked: boolean) => updateConfig('enableMetrics', checked)}
                                />
                                <span className="text-sm">Coletar Métricas</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={config.enableErrorRecovery}
                                    onCheckedChange={(checked: boolean) => updateConfig('enableErrorRecovery', checked)}
                                />
                                <span className="text-sm">Recuperação de Erro</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={config.testMode}
                                    onCheckedChange={(checked: boolean) => updateConfig('testMode', checked)}
                                />
                                <span className="text-sm">Modo Teste</span>
                            </div>

                            {config.testMode && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Webhook de Teste</label>
                                    <Input
                                        value={config.testWebhookUrl}
                                        onChange={(e) => updateConfig('testWebhookUrl', e.target.value)}
                                        placeholder="https://webhook.site/..."
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Health Alerts */}
            {getHealthStatus() === 'error' && (
                <Alert variant="error">
                    <XCircleIcon className="w-5 h-5" />
                    <div>
                        <h4 className="font-medium">Sistema com Problemas</h4>
                        <p>Taxa de erro elevada ({status.errorRate.toFixed(1)}%). Verifique os logs e considere reiniciar o bot.</p>
                    </div>
                </Alert>
            )}

            {getHealthStatus() === 'warning' && (
                <Alert variant="warning">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <div>
                        <h4 className="font-medium">Performance Degradada</h4>
                        <p>Tempo de resposta ou taxa de erro acima do normal. Monitore o sistema.</p>
                    </div>
                </Alert>
            )}

            {getHealthStatus() === 'healthy' && status.isActive && (
                <Alert variant="success">
                    <CheckCircleIcon className="w-5 h-5" />
                    <div>
                        <h4 className="font-medium">Sistema Funcionando Normalmente</h4>
                        <p>Todos os indicadores estão dentro dos parâmetros esperados.</p>
                    </div>
                </Alert>
            )}
        </div>
    );
};
