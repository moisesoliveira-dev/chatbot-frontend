'use client';

import React, { useState, useCallback } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { SystemSettings } from '@/components/settings/SystemSettings';
import { BotControls } from '@/components/settings/BotControls';
import { ConfigurationPanel } from '@/components/settings/ConfigurationPanel';
import { ExportImport } from '@/components/settings/ExportImport';
import {
    CogIcon,
    ServerIcon,
    WrenchScrewdriverIcon,
    ArrowUpTrayIcon,
    UserIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';

interface BotSettings {
    name: string;
    description: string;
    avatar: string;
    language: string;
    timezone: string;
    welcomeMessage: string;
    fallbackMessage: string;
    isActive: boolean;
    enableTypingIndicator: boolean;
    responseDelay: number;
}

interface IntegrationSettings {
    webhook: {
        url: string;
        secret: string;
        enabled: boolean;
    };
    whatsapp: {
        token: string;
        phoneNumber: string;
        enabled: boolean;
    };
    telegram: {
        token: string;
        username: string;
        enabled: boolean;
    };
    slack: {
        token: string;
        channel: string;
        enabled: boolean;
    };
}

const defaultBotSettings: BotSettings = {
    name: 'Assistente Virtual',
    description: 'Seu assistente inteligente para atendimento ao cliente',
    avatar: '',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    welcomeMessage: 'Olá! Como posso ajudá-lo hoje?',
    fallbackMessage: 'Desculpe, não entendi sua mensagem. Pode reformular?',
    isActive: true,
    enableTypingIndicator: true,
    responseDelay: 1000
};

const defaultIntegrationSettings: IntegrationSettings = {
    webhook: { url: '', secret: '', enabled: false },
    whatsapp: { token: '', phoneNumber: '', enabled: false },
    telegram: { token: '', username: '', enabled: false },
    slack: { token: '', channel: '', enabled: false }
};

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('system');
    const [botSettings, setBotSettings] = useState<BotSettings>(defaultBotSettings);
    const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>(defaultIntegrationSettings);
    const [isLoading, setIsLoading] = useState(false);

    const handleSystemSettingsChange = useCallback((settings: any) => {
        console.log('System settings changed:', settings);
    }, []);

    const handleSystemSave = useCallback(async (settings: any) => {
        console.log('System settings saved:', settings);
    }, []);

    const handleBotStatusChange = useCallback((status: any) => {
        console.log('Bot status changed:', status);
    }, []);

    const handleBotConfigChange = useCallback((config: any) => {
        console.log('Bot config changed:', config);
    }, []);

    const handleTechnicalConfigChange = useCallback((config: any) => {
        console.log('Technical config changed:', config);
    }, []);

    const handleExport = useCallback(async (config: any) => {
        setIsLoading(true);
        try {
            // Simular exportação
            await new Promise(resolve => setTimeout(resolve, 2000));
            const exportData = {
                settings: botSettings,
                integrations: integrationSettings,
                timestamp: new Date().toISOString()
            };
            return JSON.stringify(exportData, null, 2);
        } finally {
            setIsLoading(false);
        }
    }, [botSettings, integrationSettings]);

    const handleImport = useCallback(async (file: File, config: any) => {
        setIsLoading(true);
        try {
            // Simular importação
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Import completed:', file.name, config);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleBackupSchedule = useCallback(async (schedule: any) => {
        setIsLoading(true);
        try {
            // Simular configuração de backup
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Backup schedule configured:', schedule);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const tabs = [
        {
            id: 'system',
            label: 'Sistema',
            icon: CogIcon,
            content: (
                <SystemSettings
                    onSettingsChange={handleSystemSettingsChange}
                    onSave={handleSystemSave}
                    isLoading={isLoading}
                />
            )
        },
        {
            id: 'bot',
            label: 'Bot',
            icon: ServerIcon,
            content: (
                <BotControls
                    onStatusChange={handleBotStatusChange}
                    onConfigChange={handleBotConfigChange}
                    isLoading={isLoading}
                />
            )
        },
        {
            id: 'technical',
            label: 'Técnico',
            icon: WrenchScrewdriverIcon,
            content: (
                <ConfigurationPanel
                    onConfigChange={handleTechnicalConfigChange}
                    isLoading={isLoading}
                />
            )
        },
        {
            id: 'export',
            label: 'Backup',
            icon: ArrowUpTrayIcon,
            content: (
                <ExportImport
                    onExport={handleExport}
                    onImport={handleImport}
                    onBackupSchedule={handleBackupSchedule}
                    isLoading={isLoading}
                />
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
                <p className="mt-2 text-gray-600">
                    Gerencie todas as configurações do sistema, bot e integrações
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
                {tabs.find(tab => tab.id === activeTab)?.content}
            </div>
        </div>
    );
}
