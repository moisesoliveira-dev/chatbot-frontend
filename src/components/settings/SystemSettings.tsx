'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import {
    ServerIcon,
    ClockIcon,
    LanguageIcon,
    CogIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface SystemConfig {
    // Sistema Principal
    systemName: string;
    systemDescription: string;
    maintenanceMode: boolean;
    debugMode: boolean;

    // Performance
    maxConcurrentUsers: number;
    requestTimeout: number;
    debounceTime: number;
    cacheEnabled: boolean;
    cacheTTL: number;

    // Localização
    defaultLanguage: string;
    timezone: string;
    dateFormat: string;

    // Logs
    logLevel: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
    logRetentionDays: number;
    enableDetailedLogs: boolean;
}

interface SystemSettingsProps {
    onSettingsChange: (settings: Partial<SystemConfig>) => void;
    onSave: (settings: SystemConfig) => Promise<void>;
    isLoading?: boolean;
}

const defaultSettings: SystemConfig = {
    systemName: 'ChatBot System',
    systemDescription: 'Sistema de chatbot inteligente para atendimento automatizado',
    maintenanceMode: false,
    debugMode: false,
    maxConcurrentUsers: 1000,
    requestTimeout: 30000,
    debounceTime: 500,
    cacheEnabled: true,
    cacheTTL: 300,
    defaultLanguage: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY HH:mm',
    logLevel: 'INFO',
    logRetentionDays: 30,
    enableDetailedLogs: false
};

export const SystemSettings: React.FC<SystemSettingsProps> = ({
    onSettingsChange,
    onSave,
    isLoading = false
}) => {
    const [settings, setSettings] = useState<SystemConfig>(defaultSettings);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const updateSetting = useCallback(<K extends keyof SystemConfig>(
        key: K,
        value: SystemConfig[K]
    ) => {
        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };
            setHasUnsavedChanges(true);
            onSettingsChange({ [key]: value });
            return newSettings;
        });

        // Limpar erro de validação se existir
        if (validationErrors[key]) {
            setValidationErrors(prev => {
                const { [key]: _, ...rest } = prev;
                return rest;
            });
        }
    }, [onSettingsChange, validationErrors]);

    const validateSettings = useCallback((): boolean => {
        const errors: Record<string, string> = {};

        if (!settings.systemName.trim()) {
            errors.systemName = 'Nome do sistema é obrigatório';
        }

        if (settings.maxConcurrentUsers < 1) {
            errors.maxConcurrentUsers = 'Deve ser maior que 0';
        }

        if (settings.requestTimeout < 1000) {
            errors.requestTimeout = 'Mínimo de 1000ms';
        }

        if (settings.debounceTime < 100) {
            errors.debounceTime = 'Mínimo de 100ms';
        }

        if (settings.cacheTTL < 60) {
            errors.cacheTTL = 'Mínimo de 60 segundos';
        }

        if (settings.logRetentionDays < 1) {
            errors.logRetentionDays = 'Mínimo de 1 dia';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [settings]);

    const handleSave = useCallback(async () => {
        if (validateSettings()) {
            try {
                await onSave(settings);
                setHasUnsavedChanges(false);
            } catch (error) {
                console.error('Erro ao salvar configurações:', error);
            }
        }
    }, [settings, onSave, validateSettings]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
                    <p className="text-gray-600">Configure parâmetros gerais e performance do sistema</p>
                </div>
                {hasUnsavedChanges && (
                    <Badge variant="warning">Alterações não salvas</Badge>
                )}
            </div>

            {/* Sistema Principal */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ServerIcon className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Sistema Principal</h3>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nome do Sistema</label>
                            <Input
                                value={settings.systemName}
                                onChange={(e) => updateSetting('systemName', e.target.value)}
                                placeholder="Nome do seu sistema"
                                error={validationErrors.systemName}
                            />
                            {validationErrors.systemName && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.systemName}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={settings.maintenanceMode}
                                    onCheckedChange={(checked: boolean) => updateSetting('maintenanceMode', checked)}
                                />
                                <span className="text-sm">Modo Manutenção</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={settings.debugMode}
                                    onCheckedChange={(checked: boolean) => updateSetting('debugMode', checked)}
                                />
                                <span className="text-sm">Modo Debug</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Descrição do Sistema</label>
                        <Textarea
                            value={settings.systemDescription}
                            onChange={(e) => updateSetting('systemDescription', e.target.value)}
                            rows={3}
                            placeholder="Descrição detalhada do sistema..."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Performance */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CogIcon className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold">Performance e Cache</h3>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Usuários Simultâneos</label>
                            <Input
                                type="number"
                                value={settings.maxConcurrentUsers}
                                onChange={(e) => updateSetting('maxConcurrentUsers', parseInt(e.target.value) || 0)}
                                min={1}
                                error={validationErrors.maxConcurrentUsers}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Timeout de Request (ms)</label>
                            <Input
                                type="number"
                                value={settings.requestTimeout}
                                onChange={(e) => updateSetting('requestTimeout', parseInt(e.target.value) || 0)}
                                min={1000}
                                error={validationErrors.requestTimeout}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Debounce Time (ms)</label>
                            <Input
                                type="number"
                                value={settings.debounceTime}
                                onChange={(e) => updateSetting('debounceTime', parseInt(e.target.value) || 0)}
                                min={100}
                                error={validationErrors.debounceTime}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={settings.cacheEnabled}
                                onCheckedChange={(checked: boolean) => updateSetting('cacheEnabled', checked)}
                            />
                            <span className="text-sm">Cache Habilitado</span>
                        </div>

                        {settings.cacheEnabled && (
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">TTL (segundos):</label>
                                <Input
                                    type="number"
                                    value={settings.cacheTTL}
                                    onChange={(e) => updateSetting('cacheTTL', parseInt(e.target.value) || 0)}
                                    className="w-20"
                                    min={60}
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Localização */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <LanguageIcon className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold">Localização</h3>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Idioma Padrão</label>
                            <Select
                                value={settings.defaultLanguage}
                                onValueChange={(value: string) => updateSetting('defaultLanguage', value)}
                                options={[
                                    { value: 'pt-BR', label: 'Português (Brasil)' },
                                    { value: 'en-US', label: 'English (US)' },
                                    { value: 'es-ES', label: 'Español' },
                                    { value: 'fr-FR', label: 'Français' }
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Fuso Horário</label>
                            <Select
                                value={settings.timezone}
                                onValueChange={(value: string) => updateSetting('timezone', value)}
                                options={[
                                    { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
                                    { value: 'America/New_York', label: 'New York (UTC-5)' },
                                    { value: 'Europe/London', label: 'London (UTC+0)' },
                                    { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' }
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Formato de Data</label>
                            <Select
                                value={settings.dateFormat}
                                onValueChange={(value: string) => updateSetting('dateFormat', value)}
                                options={[
                                    { value: 'DD/MM/YYYY HH:mm', label: 'DD/MM/AAAA HH:mm' },
                                    { value: 'MM/DD/YYYY HH:mm', label: 'MM/DD/AAAA HH:mm' },
                                    { value: 'YYYY-MM-DD HH:mm', label: 'AAAA-MM-DD HH:mm' }
                                ]}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logs */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-orange-600" />
                        <h3 className="text-lg font-semibold">Logs e Monitoramento</h3>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nível de Log</label>
                            <Select
                                value={settings.logLevel}
                                onValueChange={(value: string) => updateSetting('logLevel', value as typeof settings.logLevel)}
                                options={[
                                    { value: 'ERROR', label: 'ERROR - Apenas erros' },
                                    { value: 'WARN', label: 'WARN - Avisos e erros' },
                                    { value: 'INFO', label: 'INFO - Informações gerais' },
                                    { value: 'DEBUG', label: 'DEBUG - Detalhado' }
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Retenção de Logs (dias)</label>
                            <Input
                                type="number"
                                value={settings.logRetentionDays}
                                onChange={(e) => updateSetting('logRetentionDays', parseInt(e.target.value) || 0)}
                                min={1}
                                error={validationErrors.logRetentionDays}
                            />
                        </div>

                        <div className="flex items-center justify-center">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={settings.enableDetailedLogs}
                                    onCheckedChange={(checked: boolean) => updateSetting('enableDetailedLogs', checked)}
                                />
                                <span className="text-sm">Logs Detalhados</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Status Alerts */}
            {settings.maintenanceMode && (
                <Alert variant="warning">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <div>
                        <h4 className="font-medium">Modo Manutenção Ativo</h4>
                        <p>O sistema está em modo manutenção. Usuários podem encontrar funcionalidades limitadas.</p>
                    </div>
                </Alert>
            )}

            {settings.debugMode && (
                <Alert variant="info">
                    <CheckCircleIcon className="w-5 h-5" />
                    <div>
                        <h4 className="font-medium">Modo Debug Ativo</h4>
                        <p>Logs detalhados estão sendo gerados. Desative em produção para melhor performance.</p>
                    </div>
                </Alert>
            )}

            {/* Ações */}
            <div className="flex items-center justify-between pt-6 border-t">
                <div className="text-sm text-gray-600">
                    {hasUnsavedChanges ? 'Há alterações não salvas' : 'Todas as alterações foram salvas'}
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setSettings(defaultSettings);
                            setHasUnsavedChanges(true);
                        }}
                    >
                        Restaurar Padrões
                    </Button>

                    <Button
                        onClick={handleSave}
                        disabled={isLoading || !hasUnsavedChanges}
                        loading={isLoading}
                    >
                        {isLoading ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
