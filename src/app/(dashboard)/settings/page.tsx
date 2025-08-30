'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';

interface BotSettings {
    name: string;
    description: string;
    language: string;
    timezone: string;
    welcomeMessage: string;
    fallbackMessage: string;
    maxSessionDuration: number;
    enableTypingIndicator: boolean;
    enableReadReceipts: boolean;
    enableAnalytics: boolean;
}

interface IntegrationSettings {
    whatsapp: {
        enabled: boolean;
        token: string;
        phoneNumber: string;
    };
    telegram: {
        enabled: boolean;
        botToken: string;
    };
    facebook: {
        enabled: boolean;
        pageAccessToken: string;
        verifyToken: string;
    };
    website: {
        enabled: boolean;
        widgetColor: string;
        position: 'bottom-right' | 'bottom-left';
    };
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [botSettings, setBotSettings] = useState<BotSettings>({
        name: 'Meu Chatbot',
        description: 'Assistente virtual inteligente',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        welcomeMessage: 'Olá! Como posso ajudá-lo hoje?',
        fallbackMessage: 'Desculpe, não entendi. Pode reformular sua pergunta?',
        maxSessionDuration: 30,
        enableTypingIndicator: true,
        enableReadReceipts: true,
        enableAnalytics: true,
    });

    const [integrations, setIntegrations] = useState<IntegrationSettings>({
        whatsapp: {
            enabled: false,
            token: '',
            phoneNumber: '',
        },
        telegram: {
            enabled: false,
            botToken: '',
        },
        facebook: {
            enabled: false,
            pageAccessToken: '',
            verifyToken: '',
        },
        website: {
            enabled: true,
            widgetColor: '#3b82f6',
            position: 'bottom-right',
        },
    });

    const [isSaving, setIsSaving] = useState(false);

    const languageOptions = [
        { value: 'pt-BR', label: 'Português (Brasil)' },
        { value: 'en-US', label: 'English (US)' },
        { value: 'es-ES', label: 'Español' },
        { value: 'fr-FR', label: 'Français' },
    ];

    const timezoneOptions = [
        { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
        { value: 'America/New_York', label: 'New York (UTC-5)' },
        { value: 'Europe/London', label: 'London (UTC+0)' },
        { value: 'Europe/Madrid', label: 'Madrid (UTC+1)' },
    ];

    const positionOptions = [
        { value: 'bottom-right', label: 'Inferior Direito' },
        { value: 'bottom-left', label: 'Inferior Esquerdo' },
    ];

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        alert('Configurações salvas com sucesso!');
    };

    const updateBotSettings = (field: keyof BotSettings, value: any) => {
        setBotSettings(prev => ({ ...prev, [field]: value }));
    };

    const updateIntegration = (platform: keyof IntegrationSettings, field: string, value: any) => {
        setIntegrations(prev => ({
            ...prev,
            [platform]: {
                ...prev[platform],
                [field]: value,
            },
        }));
    };

    const getGeneralTabContent = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Informações Básicas</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome do Bot
                        </label>
                        <Input
                            value={botSettings.name}
                            onChange={(e) => updateBotSettings('name', e.target.value)}
                            placeholder="Digite o nome do bot"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição
                        </label>
                        <Textarea
                            value={botSettings.description}
                            onChange={(e) => updateBotSettings('description', e.target.value)}
                            placeholder="Descreva o propósito do bot"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Idioma
                        </label>
                        <Select
                            value={botSettings.language}
                            onValueChange={(value) => updateBotSettings('language', value)}
                            options={languageOptions}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fuso Horário
                        </label>
                        <Select
                            value={botSettings.timezone}
                            onValueChange={(value) => updateBotSettings('timezone', value)}
                            options={timezoneOptions}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Preferências</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duração Máxima da Sessão (minutos)
                        </label>
                        <Input
                            type="number"
                            value={botSettings.maxSessionDuration}
                            onChange={(e) => updateBotSettings('maxSessionDuration', parseInt(e.target.value))}
                            min="5"
                            max="120"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Indicador de Digitação
                                </label>
                                <p className="text-xs text-gray-500">
                                    Mostra quando o bot está digitando
                                </p>
                            </div>
                            <Switch
                                checked={botSettings.enableTypingIndicator}
                                onCheckedChange={(checked) => updateBotSettings('enableTypingIndicator', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Confirmação de Leitura
                                </label>
                                <p className="text-xs text-gray-500">
                                    Marca mensagens como lidas
                                </p>
                            </div>
                            <Switch
                                checked={botSettings.enableReadReceipts}
                                onCheckedChange={(checked) => updateBotSettings('enableReadReceipts', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Analytics
                                </label>
                                <p className="text-xs text-gray-500">
                                    Coleta dados de uso para análise
                                </p>
                            </div>
                            <Switch
                                checked={botSettings.enableAnalytics}
                                onCheckedChange={(checked) => updateBotSettings('enableAnalytics', checked)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const getMessagesTabContent = () => (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-semibold">Mensagens Padrão</h3>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem de Boas-vindas
                    </label>
                    <Textarea
                        value={botSettings.welcomeMessage}
                        onChange={(e) => updateBotSettings('welcomeMessage', e.target.value)}
                        placeholder="Mensagem inicial do bot"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem de Fallback
                    </label>
                    <Textarea
                        value={botSettings.fallbackMessage}
                        onChange={(e) => updateBotSettings('fallbackMessage', e.target.value)}
                        placeholder="Mensagem quando o bot não entende"
                        rows={3}
                    />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Dica</h4>
                    <p className="text-sm text-blue-700">
                        Use variáveis como {'{nome}'} para personalizar as mensagens com dados do usuário.
                    </p>
                </div>
            </CardContent>
        </Card>
    );

    const getIntegrationsTabContent = () => (
        <div className="space-y-6">
            {/* WhatsApp */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-600 font-bold">W</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">WhatsApp</h3>
                                <p className="text-sm text-gray-600">Integração com WhatsApp Business</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant={integrations.whatsapp.enabled ? 'success' : 'secondary'}>
                                {integrations.whatsapp.enabled ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Switch
                                checked={integrations.whatsapp.enabled}
                                onCheckedChange={(checked) => updateIntegration('whatsapp', 'enabled', checked)}
                            />
                        </div>
                    </div>
                </CardHeader>
                {integrations.whatsapp.enabled && (
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Token de Acesso
                            </label>
                            <Input
                                type="password"
                                value={integrations.whatsapp.token}
                                onChange={(e) => updateIntegration('whatsapp', 'token', e.target.value)}
                                placeholder="Token da API do WhatsApp"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número de Telefone
                            </label>
                            <Input
                                value={integrations.whatsapp.phoneNumber}
                                onChange={(e) => updateIntegration('whatsapp', 'phoneNumber', e.target.value)}
                                placeholder="+55 11 99999-9999"
                            />
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Website Widget */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Widget do Site</h3>
                                <p className="text-sm text-gray-600">Chat integrado ao seu website</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant={integrations.website.enabled ? 'success' : 'secondary'}>
                                {integrations.website.enabled ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Switch
                                checked={integrations.website.enabled}
                                onCheckedChange={(checked) => updateIntegration('website', 'enabled', checked)}
                            />
                        </div>
                    </div>
                </CardHeader>
                {integrations.website.enabled && (
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cor do Widget
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="color"
                                    value={integrations.website.widgetColor}
                                    onChange={(e) => updateIntegration('website', 'widgetColor', e.target.value)}
                                    className="w-10 h-10 rounded border"
                                />
                                <Input
                                    value={integrations.website.widgetColor}
                                    onChange={(e) => updateIntegration('website', 'widgetColor', e.target.value)}
                                    placeholder="#3b82f6"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Posição
                            </label>
                            <Select
                                value={integrations.website.position}
                                onValueChange={(value) => updateIntegration('website', 'position', value)}
                                options={positionOptions}
                            />
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );

    const getAdvancedTabContent = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">API e Webhooks</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL do Webhook
                        </label>
                        <Input placeholder="https://suaapi.com/webhook" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chave da API
                        </label>
                        <div className="flex space-x-2">
                            <Input type="password" value="sk-1234567890abcdef" readOnly />
                            <Button variant="secondary">Regenerar</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Backup e Exportação</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                        <Button variant="secondary">Exportar Conversas</Button>
                        <Button variant="secondary">Exportar Configurações</Button>
                        <Button variant="secondary">Backup Completo</Button>
                    </div>
                    <p className="text-sm text-gray-600">
                        Faça backup regular dos seus dados para evitar perdas.
                    </p>
                </CardContent>
            </Card>
        </div>
    );

    const tabItems = [
        {
            id: 'general',
            label: 'Geral',
            content: getGeneralTabContent()
        },
        {
            id: 'messages',
            label: 'Mensagens',
            content: getMessagesTabContent()
        },
        {
            id: 'integrations',
            label: 'Integrações',
            content: getIntegrationsTabContent()
        },
        {
            id: 'advanced',
            label: 'Avançado',
            content: getAdvancedTabContent()
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
                <p className="text-gray-600">Gerencie as configurações do seu chatbot</p>
            </div>

            <Tabs
                items={tabItems}
                value={activeTab}
                onValueChange={setActiveTab}
                variant="underline"
            />

            <div className="flex justify-end space-x-2">
                <Button variant="secondary">Cancelar</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
            </div>
        </div>
    );
}
