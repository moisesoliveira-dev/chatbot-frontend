'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/Progress';
import { FileUpload } from '@/components/ui/FileUpload';
import {
    ArrowUpTrayIcon,
    ArrowDownTrayIcon,
    CloudArrowUpIcon,
    CloudArrowDownIcon,
    DocumentArrowUpIcon,
    DocumentArrowDownIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

interface ExportConfig {
    includeSettings: boolean;
    includeFlows: boolean;
    includeTemplates: boolean;
    includeAnalytics: boolean;
    includeConversations: boolean;
    dateRange: 'all' | '30days' | '90days' | '1year';
    format: 'json' | 'csv' | 'xlsx';
    compress: boolean;
}

interface ImportConfig {
    overwriteExisting: boolean;
    createBackup: boolean;
    validateData: boolean;
    skipErrors: boolean;
}

interface BackupSchedule {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    retention: number;
    includeFiles: boolean;
    cloudStorage: boolean;
}

interface ExportImportProps {
    onExport?: (config: ExportConfig) => Promise<string>;
    onImport?: (file: File, config: ImportConfig) => Promise<void>;
    onBackupSchedule?: (schedule: BackupSchedule) => Promise<void>;
    isLoading?: boolean;
}

const defaultExportConfig: ExportConfig = {
    includeSettings: true,
    includeFlows: true,
    includeTemplates: true,
    includeAnalytics: false,
    includeConversations: false,
    dateRange: 'all',
    format: 'json',
    compress: true
};

const defaultImportConfig: ImportConfig = {
    overwriteExisting: false,
    createBackup: true,
    validateData: true,
    skipErrors: false
};

const defaultBackupSchedule: BackupSchedule = {
    enabled: false,
    frequency: 'daily',
    time: '02:00',
    retention: 30,
    includeFiles: true,
    cloudStorage: false
};

export const ExportImport: React.FC<ExportImportProps> = ({
    onExport,
    onImport,
    onBackupSchedule,
    isLoading = false
}) => {
    const [exportConfig, setExportConfig] = useState<ExportConfig>(defaultExportConfig);
    const [importConfig, setImportConfig] = useState<ImportConfig>(defaultImportConfig);
    const [backupSchedule, setBackupSchedule] = useState<BackupSchedule>(defaultBackupSchedule);
    const [activeTab, setActiveTab] = useState<'export' | 'import' | 'backup'>('export');

    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [exportProgress, setExportProgress] = useState(0);
    const [lastExport, setLastExport] = useState<string | null>(null);
    const [lastImport, setLastImport] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importPreview, setImportPreview] = useState<any>(null);

    const updateExportConfig = useCallback(<K extends keyof ExportConfig>(
        key: K,
        value: ExportConfig[K]
    ) => {
        setExportConfig(prev => ({ ...prev, [key]: value }));
    }, []);

    const updateImportConfig = useCallback(<K extends keyof ImportConfig>(
        key: K,
        value: ImportConfig[K]
    ) => {
        setImportConfig(prev => ({ ...prev, [key]: value }));
    }, []);

    const updateBackupSchedule = useCallback(<K extends keyof BackupSchedule>(
        key: K,
        value: BackupSchedule[K]
    ) => {
        setBackupSchedule(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleExport = useCallback(async () => {
        if (!onExport) return;

        setIsExporting(true);
        setExportProgress(0);

        try {
            // Simular progresso de exportação
            const progressInterval = setInterval(() => {
                setExportProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const result = await onExport(exportConfig);

            clearInterval(progressInterval);
            setExportProgress(100);

            // Criar e baixar arquivo
            const blob = new Blob([result], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chatbot-export-${new Date().toISOString().split('T')[0]}.${exportConfig.format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setLastExport(new Date().toLocaleString());
        } catch (error) {
            console.error('Erro na exportação:', error);
        } finally {
            setIsExporting(false);
            setTimeout(() => setExportProgress(0), 3000);
        }
    }, [onExport, exportConfig]);

    const handleImport = useCallback(async () => {
        if (!onImport || !importFile) return;

        setIsImporting(true);
        setImportProgress(0);

        try {
            // Simular progresso de importação
            const progressInterval = setInterval(() => {
                setImportProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 15;
                });
            }, 300);

            await onImport(importFile, importConfig);

            clearInterval(progressInterval);
            setImportProgress(100);

            setLastImport(new Date().toLocaleString());
            setImportFile(null);
            setImportPreview(null);
        } catch (error) {
            console.error('Erro na importação:', error);
        } finally {
            setIsImporting(false);
            setTimeout(() => setImportProgress(0), 3000);
        }
    }, [onImport, importFile, importConfig]);

    const handleFileSelect = useCallback(async (file: File) => {
        setImportFile(file);

        // Preview do arquivo
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            setImportPreview({
                size: file.size,
                items: Object.keys(data).length,
                hasSettings: !!data.settings,
                hasFlows: !!data.flows,
                hasTemplates: !!data.templates,
                hasAnalytics: !!data.analytics,
                hasConversations: !!data.conversations
            });
        } catch (error) {
            console.error('Erro ao ler arquivo:', error);
            setImportPreview({ error: 'Arquivo inválido' });
        }
    }, []);

    const handleScheduleBackup = useCallback(async () => {
        if (!onBackupSchedule) return;

        try {
            await onBackupSchedule(backupSchedule);
        } catch (error) {
            console.error('Erro ao configurar backup automático:', error);
        }
    }, [onBackupSchedule, backupSchedule]);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const tabButtons = [
        { key: 'export', label: 'Exportar', icon: ArrowUpTrayIcon },
        { key: 'import', label: 'Importar', icon: ArrowDownTrayIcon },
        { key: 'backup', label: 'Backup Automático', icon: CloudArrowUpIcon }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Export & Import</h2>
                <p className="text-gray-600">Gerencie backup, restauração e migração de dados</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-4 border-b border-gray-200">
                {tabButtons.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${activeTab === tab.key
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Export Tab */}
            {activeTab === 'export' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Configurações de Exportação</h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-900">Dados para Exportar</h4>

                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={exportConfig.includeSettings}
                                            onCheckedChange={(checked: boolean) => updateExportConfig('includeSettings', checked)}
                                        />
                                        <span className="text-sm">Configurações do Sistema</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={exportConfig.includeFlows}
                                            onCheckedChange={(checked: boolean) => updateExportConfig('includeFlows', checked)}
                                        />
                                        <span className="text-sm">Fluxos de Conversa</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={exportConfig.includeTemplates}
                                            onCheckedChange={(checked: boolean) => updateExportConfig('includeTemplates', checked)}
                                        />
                                        <span className="text-sm">Templates</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={exportConfig.includeAnalytics}
                                            onCheckedChange={(checked: boolean) => updateExportConfig('includeAnalytics', checked)}
                                        />
                                        <span className="text-sm">Dados de Analytics</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={exportConfig.includeConversations}
                                            onCheckedChange={(checked: boolean) => updateExportConfig('includeConversations', checked)}
                                        />
                                        <span className="text-sm">Histórico de Conversas</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Período dos Dados</label>
                                        <Select
                                            value={exportConfig.dateRange}
                                            onValueChange={(value: string) => updateExportConfig('dateRange', value as any)}
                                            options={[
                                                { value: 'all', label: 'Todos os dados' },
                                                { value: '30days', label: 'Últimos 30 dias' },
                                                { value: '90days', label: 'Últimos 90 dias' },
                                                { value: '1year', label: 'Último ano' }
                                            ]}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Formato</label>
                                        <Select
                                            value={exportConfig.format}
                                            onValueChange={(value: string) => updateExportConfig('format', value as any)}
                                            options={[
                                                { value: 'json', label: 'JSON' },
                                                { value: 'csv', label: 'CSV' },
                                                { value: 'xlsx', label: 'Excel (XLSX)' }
                                            ]}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={exportConfig.compress}
                                            onCheckedChange={(checked: boolean) => updateExportConfig('compress', checked)}
                                        />
                                        <span className="text-sm">Comprimir arquivo</span>
                                    </div>
                                </div>
                            </div>

                            {isExporting && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Exportando...</span>
                                        <span className="text-sm text-gray-600">{exportProgress}%</span>
                                    </div>
                                    <Progress value={exportProgress} className="h-2" />
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4">
                                <div className="text-sm text-gray-600">
                                    {lastExport && `Última exportação: ${lastExport}`}
                                </div>
                                <Button
                                    onClick={handleExport}
                                    disabled={isExporting || isLoading}
                                    loading={isExporting}
                                    className="flex items-center gap-2"
                                >
                                    <DocumentArrowDownIcon className="w-4 h-4" />
                                    {isExporting ? 'Exportando...' : 'Exportar Dados'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Import Tab */}
            {activeTab === 'import' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Importar Dados</h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <FileUpload
                                    accept=".json,.csv,.xlsx"
                                    onFilesChange={(files: File[]) => files[0] && handleFileSelect(files[0])}
                                    maxSize={50 * 1024 * 1024} // 50MB
                                />
                                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-900 mb-2">
                                    Selecione um arquivo para importar
                                </p>
                                <p className="text-sm text-gray-600">
                                    Formatos suportados: JSON, CSV, XLSX (máx. 50MB)
                                </p>
                            </div>

                            {importFile && (
                                <Alert>
                                    <DocumentArrowUpIcon className="w-5 h-5" />
                                    <div>
                                        <h4 className="font-medium">Arquivo Selecionado</h4>
                                        <p className="text-sm">
                                            {importFile.name} ({formatFileSize(importFile.size)})
                                        </p>
                                    </div>
                                </Alert>
                            )}

                            {importPreview && !importPreview.error && (
                                <Card>
                                    <CardHeader>
                                        <h4 className="font-medium">Preview dos Dados</h4>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Itens encontrados:</span>
                                                <span className="ml-2 font-medium">{importPreview.items}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Tamanho:</span>
                                                <span className="ml-2 font-medium">{formatFileSize(importPreview.size)}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-600">Contém:</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {importPreview.hasSettings && <Badge variant="secondary">Configurações</Badge>}
                                                    {importPreview.hasFlows && <Badge variant="secondary">Fluxos</Badge>}
                                                    {importPreview.hasTemplates && <Badge variant="secondary">Templates</Badge>}
                                                    {importPreview.hasAnalytics && <Badge variant="secondary">Analytics</Badge>}
                                                    {importPreview.hasConversations && <Badge variant="secondary">Conversas</Badge>}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {importPreview?.error && (
                                <Alert variant="error">
                                    <ExclamationTriangleIcon className="w-5 h-5" />
                                    <div>
                                        <h4 className="font-medium">Erro no Arquivo</h4>
                                        <p>O arquivo selecionado não pode ser processado. Verifique o formato.</p>
                                    </div>
                                </Alert>
                            )}

                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Configurações de Importação</h4>

                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={importConfig.overwriteExisting}
                                        onCheckedChange={(checked: boolean) => updateImportConfig('overwriteExisting', checked)}
                                    />
                                    <span className="text-sm">Sobrescrever dados existentes</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={importConfig.createBackup}
                                        onCheckedChange={(checked: boolean) => updateImportConfig('createBackup', checked)}
                                    />
                                    <span className="text-sm">Criar backup antes de importar</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={importConfig.validateData}
                                        onCheckedChange={(checked: boolean) => updateImportConfig('validateData', checked)}
                                    />
                                    <span className="text-sm">Validar dados antes de importar</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={importConfig.skipErrors}
                                        onCheckedChange={(checked: boolean) => updateImportConfig('skipErrors', checked)}
                                    />
                                    <span className="text-sm">Pular itens com erro</span>
                                </div>
                            </div>

                            {isImporting && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Importando...</span>
                                        <span className="text-sm text-gray-600">{importProgress}%</span>
                                    </div>
                                    <Progress value={importProgress} className="h-2" />
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4">
                                <div className="text-sm text-gray-600">
                                    {lastImport && `Última importação: ${lastImport}`}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setImportFile(null);
                                            setImportPreview(null);
                                        }}
                                        disabled={isImporting}
                                    >
                                        <TrashIcon className="w-4 h-4 mr-2" />
                                        Limpar
                                    </Button>
                                    <Button
                                        onClick={handleImport}
                                        disabled={!importFile || isImporting || importPreview?.error || isLoading}
                                        loading={isImporting}
                                        className="flex items-center gap-2"
                                    >
                                        <DocumentArrowUpIcon className="w-4 h-4" />
                                        {isImporting ? 'Importando...' : 'Importar Dados'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Backup Tab */}
            {activeTab === 'backup' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Backup Automático</h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={backupSchedule.enabled}
                                    onCheckedChange={(checked: boolean) => updateBackupSchedule('enabled', checked)}
                                />
                                <span className="text-sm font-medium">Habilitar backup automático</span>
                            </div>

                            {backupSchedule.enabled && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Frequência</label>
                                            <Select
                                                value={backupSchedule.frequency}
                                                onValueChange={(value: string) => updateBackupSchedule('frequency', value as any)}
                                                options={[
                                                    { value: 'daily', label: 'Diário' },
                                                    { value: 'weekly', label: 'Semanal' },
                                                    { value: 'monthly', label: 'Mensal' }
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Horário</label>
                                            <Input
                                                type="time"
                                                value={backupSchedule.time}
                                                onChange={(e) => updateBackupSchedule('time', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Retenção (dias)</label>
                                            <Input
                                                type="number"
                                                value={backupSchedule.retention}
                                                onChange={(e) => updateBackupSchedule('retention', parseInt(e.target.value) || 0)}
                                                min={1}
                                                max={365}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={backupSchedule.includeFiles}
                                                onCheckedChange={(checked: boolean) => updateBackupSchedule('includeFiles', checked)}
                                            />
                                            <span className="text-sm">Incluir arquivos enviados</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={backupSchedule.cloudStorage}
                                                onCheckedChange={(checked: boolean) => updateBackupSchedule('cloudStorage', checked)}
                                            />
                                            <span className="text-sm">Enviar para storage em nuvem</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <Button
                                    onClick={handleScheduleBackup}
                                    disabled={isLoading}
                                    className="flex items-center gap-2"
                                >
                                    <ClockIcon className="w-4 h-4" />
                                    Salvar Configurações
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {backupSchedule.enabled && (
                        <Alert>
                            <CheckCircleIcon className="w-5 h-5" />
                            <div>
                                <h4 className="font-medium">Backup Automático Configurado</h4>
                                <p>
                                    Próximo backup: {backupSchedule.frequency === 'daily' ? 'Hoje' : backupSchedule.frequency === 'weekly' ? 'Próxima semana' : 'Próximo mês'} às {backupSchedule.time}
                                </p>
                            </div>
                        </Alert>
                    )}
                </div>
            )}
        </div>
    );
};
