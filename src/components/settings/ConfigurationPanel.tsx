'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import {
    ServerIcon,
    CircleStackIcon,
    ShieldCheckIcon,
    CloudIcon,
    CogIcon,
    DocumentTextIcon,
    CodeBracketIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
    poolSize: number;
    timeout: number;
}

interface APIConfig {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    rateLimitPerMinute: number;
    enableCors: boolean;
    corsOrigins: string;
    apiVersion: string;
}

interface SecurityConfig {
    enableAuthentication: boolean;
    jwtSecret: string;
    tokenExpirationHours: number;
    enableRateLimit: boolean;
    maxRequestsPerMinute: number;
    enableIpWhitelist: boolean;
    allowedIps: string;
    enableEncryption: boolean;
}

interface StorageConfig {
    provider: 'local' | 'aws' | 'gcp' | 'azure';
    region: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
    maxFileSize: number;
    allowedFileTypes: string;
}

interface IntegrationConfig {
    enableWebhooks: boolean;
    webhookUrl: string;
    webhookSecret: string;
    enableSlack: boolean;
    slackToken: string;
    enableWhatsapp: boolean;
    whatsappToken: string;
    enableTelegram: boolean;
    telegramToken: string;
}

interface TechnicalConfig {
    database: DatabaseConfig;
    api: APIConfig;
    security: SecurityConfig;
    storage: StorageConfig;
    integrations: IntegrationConfig;
}

interface ConfigurationPanelProps {
    onConfigChange?: (config: TechnicalConfig) => void;
    isLoading?: boolean;
}

const defaultConfig: TechnicalConfig = {
    database: {
        host: 'localhost',
        port: 5432,
        database: 'chatbot',
        username: '',
        password: '',
        ssl: false,
        poolSize: 10,
        timeout: 30000
    },
    api: {
        baseUrl: 'https://api.example.com',
        timeout: 5000,
        retryAttempts: 3,
        rateLimitPerMinute: 1000,
        enableCors: true,
        corsOrigins: '*',
        apiVersion: 'v1'
    },
    security: {
        enableAuthentication: true,
        jwtSecret: '',
        tokenExpirationHours: 24,
        enableRateLimit: true,
        maxRequestsPerMinute: 100,
        enableIpWhitelist: false,
        allowedIps: '',
        enableEncryption: true
    },
    storage: {
        provider: 'local',
        region: 'us-east-1',
        bucket: '',
        accessKey: '',
        secretKey: '',
        maxFileSize: 10,
        allowedFileTypes: '.jpg,.jpeg,.png,.pdf,.doc,.docx'
    },
    integrations: {
        enableWebhooks: false,
        webhookUrl: '',
        webhookSecret: '',
        enableSlack: false,
        slackToken: '',
        enableWhatsapp: false,
        whatsappToken: '',
        enableTelegram: false,
        telegramToken: ''
    }
};

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
    onConfigChange,
    isLoading = false
}) => {
    const [config, setConfig] = useState<TechnicalConfig>(defaultConfig);
    const [activeSection, setActiveSection] = useState<string>('database');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const updateConfig = useCallback(<T extends keyof TechnicalConfig>(
        section: T,
        key: keyof TechnicalConfig[T],
        value: any
    ) => {
        setConfig(prev => {
            const newConfig = {
                ...prev,
                [section]: {
                    ...prev[section],
                    [key]: value
                }
            };
            return newConfig;
        });
    }, []);

    const validateConfiguration = useCallback((): string[] => {
        const errors: string[] = [];

        // Validação Database
        if (!config.database.host) errors.push('Host do banco de dados é obrigatório');
        if (!config.database.database) errors.push('Nome do banco de dados é obrigatório');
        if (config.database.port < 1 || config.database.port > 65535) {
            errors.push('Porta do banco deve estar entre 1 e 65535');
        }

        // Validação API
        if (!config.api.baseUrl.startsWith('http')) {
            errors.push('URL da API deve começar com http:// ou https://');
        }
        if (config.api.timeout < 1000) {
            errors.push('Timeout da API deve ser pelo menos 1000ms');
        }

        // Validação Security
        if (config.security.enableAuthentication && !config.security.jwtSecret) {
            errors.push('JWT Secret é obrigatório quando autenticação está habilitada');
        }
        if (config.security.tokenExpirationHours < 1) {
            errors.push('Expiração do token deve ser pelo menos 1 hora');
        }

        // Validação Storage
        if (config.storage.provider !== 'local') {
            if (!config.storage.accessKey) errors.push('Access Key é obrigatória para storage em nuvem');
            if (!config.storage.secretKey) errors.push('Secret Key é obrigatória para storage em nuvem');
            if (!config.storage.bucket) errors.push('Nome do bucket é obrigatório para storage em nuvem');
        }

        return errors;
    }, [config]);

    const handleSave = useCallback(async () => {
        setIsSaving(true);

        const errors = validateConfiguration();
        setValidationErrors(errors);

        if (errors.length === 0) {
            try {
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simular API call
                onConfigChange?.(config);
            } catch (error) {
                console.error('Erro ao salvar configuração:', error);
            }
        }

        setIsSaving(false);
    }, [config, onConfigChange, validateConfiguration]);

    const sections = [
        { key: 'database', label: 'Banco de Dados', icon: CircleStackIcon },
        { key: 'api', label: 'API', icon: ServerIcon },
        { key: 'security', label: 'Segurança', icon: ShieldCheckIcon },
        { key: 'storage', label: 'Armazenamento', icon: CloudIcon },
        { key: 'integrations', label: 'Integrações', icon: CodeBracketIcon }
    ];

    const renderDatabaseConfig = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Host</label>
                    <Input
                        value={config.database.host}
                        onChange={(e) => updateConfig('database', 'host', e.target.value)}
                        placeholder="localhost"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Porta</label>
                    <Input
                        type="number"
                        value={config.database.port}
                        onChange={(e) => updateConfig('database', 'port', parseInt(e.target.value) || 0)}
                        min={1}
                        max={65535}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Database</label>
                    <Input
                        value={config.database.database}
                        onChange={(e) => updateConfig('database', 'database', e.target.value)}
                        placeholder="chatbot"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <Input
                        value={config.database.username}
                        onChange={(e) => updateConfig('database', 'username', e.target.value)}
                        placeholder="admin"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <Input
                        type="password"
                        value={config.database.password}
                        onChange={(e) => updateConfig('database', 'password', e.target.value)}
                        placeholder="••••••••"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Pool Size</label>
                    <Input
                        type="number"
                        value={config.database.poolSize}
                        onChange={(e) => updateConfig('database', 'poolSize', parseInt(e.target.value) || 0)}
                        min={1}
                        max={100}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Switch
                    checked={config.database.ssl}
                    onCheckedChange={(checked: boolean) => updateConfig('database', 'ssl', checked)}
                />
                <span className="text-sm">Habilitar SSL</span>
            </div>
        </div>
    );

    const renderAPIConfig = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Base URL</label>
                    <Input
                        value={config.api.baseUrl}
                        onChange={(e) => updateConfig('api', 'baseUrl', e.target.value)}
                        placeholder="https://api.example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Versão da API</label>
                    <Select
                        value={config.api.apiVersion}
                        onValueChange={(value: string) => updateConfig('api', 'apiVersion', value)}
                        options={[
                            { value: 'v1', label: 'v1' },
                            { value: 'v2', label: 'v2' },
                            { value: 'v3', label: 'v3' }
                        ]}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Timeout (ms)</label>
                    <Input
                        type="number"
                        value={config.api.timeout}
                        onChange={(e) => updateConfig('api', 'timeout', parseInt(e.target.value) || 0)}
                        min={1000}
                        max={60000}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Tentativas de Retry</label>
                    <Input
                        type="number"
                        value={config.api.retryAttempts}
                        onChange={(e) => updateConfig('api', 'retryAttempts', parseInt(e.target.value) || 0)}
                        min={0}
                        max={10}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Rate Limit (req/min)</label>
                    <Input
                        type="number"
                        value={config.api.rateLimitPerMinute}
                        onChange={(e) => updateConfig('api', 'rateLimitPerMinute', parseInt(e.target.value) || 0)}
                        min={1}
                        max={10000}
                    />
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Switch
                        checked={config.api.enableCors}
                        onCheckedChange={(checked: boolean) => updateConfig('api', 'enableCors', checked)}
                    />
                    <span className="text-sm">Habilitar CORS</span>
                </div>

                {config.api.enableCors && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Origens Permitidas</label>
                        <Input
                            value={config.api.corsOrigins}
                            onChange={(e) => updateConfig('api', 'corsOrigins', e.target.value)}
                            placeholder="*"
                        />
                    </div>
                )}
            </div>
        </div>
    );

    const renderSecurityConfig = () => (
        <div className="space-y-4">
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Switch
                        checked={config.security.enableAuthentication}
                        onCheckedChange={(checked: boolean) => updateConfig('security', 'enableAuthentication', checked)}
                    />
                    <span className="text-sm">Habilitar Autenticação</span>
                </div>

                {config.security.enableAuthentication && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">JWT Secret</label>
                            <Input
                                type="password"
                                value={config.security.jwtSecret}
                                onChange={(e) => updateConfig('security', 'jwtSecret', e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Expiração Token (horas)</label>
                            <Input
                                type="number"
                                value={config.security.tokenExpirationHours}
                                onChange={(e) => updateConfig('security', 'tokenExpirationHours', parseInt(e.target.value) || 0)}
                                min={1}
                                max={168}
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Switch
                        checked={config.security.enableRateLimit}
                        onCheckedChange={(checked: boolean) => updateConfig('security', 'enableRateLimit', checked)}
                    />
                    <span className="text-sm">Habilitar Rate Limiting</span>
                </div>

                {config.security.enableRateLimit && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Máximo de Requests por Minuto</label>
                        <Input
                            type="number"
                            value={config.security.maxRequestsPerMinute}
                            onChange={(e) => updateConfig('security', 'maxRequestsPerMinute', parseInt(e.target.value) || 0)}
                            min={1}
                            max={10000}
                        />
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Switch
                        checked={config.security.enableIpWhitelist}
                        onCheckedChange={(checked: boolean) => updateConfig('security', 'enableIpWhitelist', checked)}
                    />
                    <span className="text-sm">Habilitar Whitelist de IPs</span>
                </div>

                {config.security.enableIpWhitelist && (
                    <div>
                        <label className="block text-sm font-medium mb-2">IPs Permitidos (separados por vírgula)</label>
                        <Textarea
                            value={config.security.allowedIps}
                            onChange={(e) => updateConfig('security', 'allowedIps', e.target.value)}
                            placeholder="192.168.1.1, 10.0.0.1"
                            rows={3}
                        />
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Switch
                        checked={config.security.enableEncryption}
                        onCheckedChange={(checked: boolean) => updateConfig('security', 'enableEncryption', checked)}
                    />
                    <span className="text-sm">Habilitar Criptografia</span>
                </div>
            </div>
        </div>
    );

    const renderStorageConfig = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Provedor de Armazenamento</label>
                <Select
                    value={config.storage.provider}
                    onValueChange={(value: string) => updateConfig('storage', 'provider', value as 'local' | 'aws' | 'gcp' | 'azure')}
                    options={[
                        { value: 'local', label: 'Local' },
                        { value: 'aws', label: 'Amazon S3' },
                        { value: 'gcp', label: 'Google Cloud Storage' },
                        { value: 'azure', label: 'Azure Blob Storage' }
                    ]}
                />
            </div>

            {config.storage.provider !== 'local' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Região</label>
                        <Input
                            value={config.storage.region}
                            onChange={(e) => updateConfig('storage', 'region', e.target.value)}
                            placeholder="us-east-1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Bucket/Container</label>
                        <Input
                            value={config.storage.bucket}
                            onChange={(e) => updateConfig('storage', 'bucket', e.target.value)}
                            placeholder="my-chatbot-bucket"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Access Key</label>
                        <Input
                            type="password"
                            value={config.storage.accessKey}
                            onChange={(e) => updateConfig('storage', 'accessKey', e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Secret Key</label>
                        <Input
                            type="password"
                            value={config.storage.secretKey}
                            onChange={(e) => updateConfig('storage', 'secretKey', e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Tamanho Máximo (MB)</label>
                    <Input
                        type="number"
                        value={config.storage.maxFileSize}
                        onChange={(e) => updateConfig('storage', 'maxFileSize', parseInt(e.target.value) || 0)}
                        min={1}
                        max={100}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Tipos de Arquivo Permitidos</label>
                    <Input
                        value={config.storage.allowedFileTypes}
                        onChange={(e) => updateConfig('storage', 'allowedFileTypes', e.target.value)}
                        placeholder=".jpg,.jpeg,.png,.pdf"
                    />
                </div>
            </div>
        </div>
    );

    const renderIntegrationsConfig = () => (
        <div className="space-y-6">
            {/* Webhooks */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Switch
                        checked={config.integrations.enableWebhooks}
                        onCheckedChange={(checked: boolean) => updateConfig('integrations', 'enableWebhooks', checked)}
                    />
                    <span className="text-sm font-medium">Webhooks</span>
                </div>

                {config.integrations.enableWebhooks && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Webhook URL</label>
                            <Input
                                value={config.integrations.webhookUrl}
                                onChange={(e) => updateConfig('integrations', 'webhookUrl', e.target.value)}
                                placeholder="https://webhook.site/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Webhook Secret</label>
                            <Input
                                type="password"
                                value={config.integrations.webhookSecret}
                                onChange={(e) => updateConfig('integrations', 'webhookSecret', e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Slack */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Switch
                        checked={config.integrations.enableSlack}
                        onCheckedChange={(checked: boolean) => updateConfig('integrations', 'enableSlack', checked)}
                    />
                    <span className="text-sm font-medium">Slack</span>
                    <Badge variant="secondary">Beta</Badge>
                </div>

                {config.integrations.enableSlack && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Slack Bot Token</label>
                        <Input
                            type="password"
                            value={config.integrations.slackToken}
                            onChange={(e) => updateConfig('integrations', 'slackToken', e.target.value)}
                            placeholder="xoxb-..."
                        />
                    </div>
                )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Switch
                        checked={config.integrations.enableWhatsapp}
                        onCheckedChange={(checked: boolean) => updateConfig('integrations', 'enableWhatsapp', checked)}
                    />
                    <span className="text-sm font-medium">WhatsApp Business</span>
                    <Badge variant="secondary">Beta</Badge>
                </div>

                {config.integrations.enableWhatsapp && (
                    <div>
                        <label className="block text-sm font-medium mb-2">WhatsApp Token</label>
                        <Input
                            type="password"
                            value={config.integrations.whatsappToken}
                            onChange={(e) => updateConfig('integrations', 'whatsappToken', e.target.value)}
                            placeholder="EAAxxxxxxx..."
                        />
                    </div>
                )}
            </div>

            {/* Telegram */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Switch
                        checked={config.integrations.enableTelegram}
                        onCheckedChange={(checked: boolean) => updateConfig('integrations', 'enableTelegram', checked)}
                    />
                    <span className="text-sm font-medium">Telegram</span>
                </div>

                {config.integrations.enableTelegram && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Telegram Bot Token</label>
                        <Input
                            type="password"
                            value={config.integrations.telegramToken}
                            onChange={(e) => updateConfig('integrations', 'telegramToken', e.target.value)}
                            placeholder="123456789:ABCdefGHijklmnoPQRstu..."
                        />
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Configurações Técnicas</h2>
                <p className="text-gray-600">Configure parâmetros técnicos avançados do sistema</p>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
                <Alert variant="error">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <div>
                        <h4 className="font-medium">Erros de Validação</h4>
                        <ul className="list-disc list-inside mt-2">
                            {validationErrors.map((error, index) => (
                                <li key={index} className="text-sm">{error}</li>
                            ))}
                        </ul>
                    </div>
                </Alert>
            )}

            {/* Navigation */}
            <div className="flex flex-wrap gap-2">
                {sections.map(section => {
                    const Icon = section.icon;
                    return (
                        <Button
                            key={section.key}
                            variant={activeSection === section.key ? 'primary' : 'secondary'}
                            onClick={() => setActiveSection(section.key)}
                            className="flex items-center gap-2"
                        >
                            <Icon className="w-4 h-4" />
                            {section.label}
                        </Button>
                    );
                })}
            </div>

            {/* Configuration Panel */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">
                        {sections.find(s => s.key === activeSection)?.label}
                    </h3>
                </CardHeader>
                <CardContent>
                    {activeSection === 'database' && renderDatabaseConfig()}
                    {activeSection === 'api' && renderAPIConfig()}
                    {activeSection === 'security' && renderSecurityConfig()}
                    {activeSection === 'storage' && renderStorageConfig()}
                    {activeSection === 'integrations' && renderIntegrationsConfig()}
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    loading={isSaving}
                    disabled={isLoading || validationErrors.length > 0}
                    className="flex items-center gap-2"
                >
                    <DocumentTextIcon className="w-4 h-4" />
                    {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
            </div>
        </div>
    );
};
