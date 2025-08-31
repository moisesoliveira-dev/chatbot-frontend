'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays, addWeeks, addMonths, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';

interface ScheduledReport {
    id: string;
    name: string;
    description: string;
    template: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    cronExpression?: string;
    recipients: string[];
    formats: ('pdf' | 'excel')[];
    active: boolean;
    nextRun: Date;
    lastRun?: Date;
    created: Date;
    settings: {
        includeCharts: boolean;
        dateRange: 'last7days' | 'last30days' | 'thisMonth';
        timezone: string;
    };
}

interface ScheduleManagerProps {
    className?: string;
}

const FREQUENCY_OPTIONS_SELECT = [
    { value: 'daily', label: 'Diário - Todo dia às 8:00' },
    { value: 'weekly', label: 'Semanal - Toda segunda-feira' },
    { value: 'monthly', label: 'Mensal - Todo dia 1º do mês' },
    { value: 'custom', label: 'Personalizado - Expressão cron customizada' },
];

const DATE_RANGE_OPTIONS = [
    { value: 'last7days', label: 'Últimos 7 dias' },
    { value: 'last30days', label: 'Últimos 30 dias' },
    { value: 'thisMonth', label: 'Este mês' },
];

const TEMPLATE_OPTIONS = [
    { value: 'conversations', label: 'Relatório de Conversas' },
    { value: 'performance', label: 'Relatório de Performance' },
    { value: 'files', label: 'Relatório de Arquivos' },
    { value: 'flows', label: 'Relatório de Fluxos' },
    { value: 'executive', label: 'Relatório Executivo' },
];

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({ className }) => {
    const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        template: 'conversations',
        frequency: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'custom',
        cronExpression: '',
        recipients: [''],
        formats: ['pdf'] as ('pdf' | 'excel')[],
        includeCharts: true,
        dateRange: 'last30days' as 'last7days' | 'last30days' | 'thisMonth',
    });

    // Mock data inicial
    useEffect(() => {
        const mockScheduledReports: ScheduledReport[] = [
            {
                id: '1',
                name: 'Relatório Semanal de Performance',
                description: 'Relatório automático de performance enviado semanalmente',
                template: 'performance',
                frequency: 'weekly',
                recipients: ['admin@empresa.com', 'gerente@empresa.com'],
                formats: ['pdf'],
                active: true,
                nextRun: addWeeks(new Date(), 1),
                lastRun: addWeeks(new Date(), -1),
                created: addDays(new Date(), -30),
                settings: {
                    includeCharts: true,
                    dateRange: 'last30days',
                    timezone: 'America/Sao_Paulo'
                }
            },
            {
                id: '2',
                name: 'Relatório Mensal Executivo',
                description: 'Resumo executivo mensal para a diretoria',
                template: 'executive',
                frequency: 'monthly',
                recipients: ['diretoria@empresa.com'],
                formats: ['pdf', 'excel'],
                active: true,
                nextRun: addMonths(new Date(), 1),
                created: addDays(new Date(), -60),
                settings: {
                    includeCharts: true,
                    dateRange: 'thisMonth',
                    timezone: 'America/Sao_Paulo'
                }
            }
        ];
        setScheduledReports(mockScheduledReports);
    }, []);

    const generateCronExpression = (frequency: string): string => {
        switch (frequency) {
            case 'daily':
                return '0 8 * * *'; // 8:00 AM todos os dias
            case 'weekly':
                return '0 8 * * 1'; // 8:00 AM segundas-feiras
            case 'monthly':
                return '0 8 1 * *'; // 8:00 AM dia 1 de cada mês
            default:
                return '0 8 * * 1';
        }
    };

    const getNextRunDate = (cronExp: string): Date => {
        // Simulação simples sem cron-parser
        const now = new Date();
        switch (cronExp) {
            case '0 8 * * *': // Diário
                return addDays(now, 1);
            case '0 8 * * 1': // Semanal (segunda)
                return addWeeks(now, 1);
            case '0 8 1 * *': // Mensal
                return addMonths(now, 1);
            default:
                return addDays(now, 1);
        }
    };

    const validateCronExpression = (cronExp: string): boolean => {
        // Validação simples para as expressões básicas
        const validPatterns = [
            /^\d{1,2} \d{1,2} \* \* \*$/, // Diário
            /^\d{1,2} \d{1,2} \* \* \d{1}$/, // Semanal
            /^\d{1,2} \d{1,2} \d{1,2} \* \*$/, // Mensal
        ];
        return validPatterns.some(pattern => pattern.test(cronExp));
    };

    const handleSubmit = () => {
        const cronExp = formData.frequency === 'custom'
            ? formData.cronExpression
            : generateCronExpression(formData.frequency);

        if (formData.frequency === 'custom' && !validateCronExpression(cronExp)) {
            alert('Expressão cron inválida!');
            return;
        }

        const newReport: ScheduledReport = {
            id: editingReport?.id || Date.now().toString(),
            name: formData.name,
            description: formData.description,
            template: formData.template,
            frequency: formData.frequency,
            cronExpression: cronExp,
            recipients: formData.recipients.filter(email => email.trim() !== ''),
            formats: formData.formats,
            active: true,
            nextRun: getNextRunDate(cronExp),
            created: editingReport?.created || new Date(),
            settings: {
                includeCharts: formData.includeCharts,
                dateRange: formData.dateRange,
                timezone: 'America/Sao_Paulo'
            }
        };

        if (editingReport) {
            setScheduledReports(prev => prev.map(report =>
                report.id === editingReport.id ? newReport : report
            ));
        } else {
            setScheduledReports(prev => [...prev, newReport]);
        }

        resetForm();
        setShowCreateModal(false);
        setEditingReport(null);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            template: 'conversations',
            frequency: 'weekly',
            cronExpression: '',
            recipients: [''],
            formats: ['pdf'],
            includeCharts: true,
            dateRange: 'last30days',
        });
    };

    const handleEdit = (report: ScheduledReport) => {
        setFormData({
            name: report.name,
            description: report.description,
            template: report.template,
            frequency: report.frequency,
            cronExpression: report.cronExpression || '',
            recipients: report.recipients.length > 0 ? report.recipients : [''],
            formats: report.formats,
            includeCharts: report.settings.includeCharts,
            dateRange: report.settings.dateRange,
        });
        setEditingReport(report);
        setShowCreateModal(true);
    };

    const handleDelete = (reportId: string) => {
        if (confirm('Deseja realmente excluir este agendamento?')) {
            setScheduledReports(prev => prev.filter(report => report.id !== reportId));
        }
    };

    const toggleActive = (reportId: string) => {
        setScheduledReports(prev => prev.map(report =>
            report.id === reportId
                ? { ...report, active: !report.active }
                : report
        ));
    };

    const addRecipient = () => {
        setFormData(prev => ({
            ...prev,
            recipients: [...prev.recipients, '']
        }));
    };

    const updateRecipient = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            recipients: prev.recipients.map((email, i) => i === index ? value : email)
        }));
    };

    const removeRecipient = (index: number) => {
        setFormData(prev => ({
            ...prev,
            recipients: prev.recipients.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        Agendamento de Relatórios
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Configure relatórios automáticos para serem enviados por email
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2"
                >
                    + Novo Agendamento
                </Button>
            </div>

            {/* Lista de Relatórios Agendados */}
            <div className="space-y-4">
                {scheduledReports.map((report) => (
                    <Card key={report.id}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {report.name}
                                        </h3>
                                        <Badge
                                            variant={report.active ? 'success' : 'secondary'}
                                            size="sm"
                                        >
                                            {report.active ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                        <Badge variant="secondary" size="sm">
                                            {FREQUENCY_OPTIONS_SELECT.find((f: any) => f.value === report.frequency)?.label.split(' - ')[0]}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {report.description}
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Próxima execução:</span>
                                            <br />
                                            <span className="font-medium">
                                                {format(report.nextRun, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Destinatários:</span>
                                            <br />
                                            <span className="font-medium">
                                                {report.recipients.length} email(s)
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Formatos:</span>
                                            <br />
                                            <span className="font-medium">
                                                {report.formats.join(', ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {report.lastRun && (
                                        <div className="mt-3 text-sm text-gray-500">
                                            Última execução: {format(report.lastRun, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                    <Switch
                                        checked={report.active}
                                        onCheckedChange={() => toggleActive(report.id)}
                                        size="sm"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(report)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(report.id)}
                                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                                    >
                                        Excluir
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {scheduledReports.length === 0 && (
                <Card>
                    <CardContent className="text-center py-12">
                        <div className="text-gray-400 text-5xl mb-4">📅</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nenhum relatório agendado
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Configure seu primeiro relatório automático
                        </p>
                        <Button onClick={() => setShowCreateModal(true)}>
                            Criar Agendamento
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Modal de Criação/Edição */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingReport(null);
                    resetForm();
                }}
                title={editingReport ? 'Editar Agendamento' : 'Novo Agendamento'}
                size="lg"
            >
                <div className="space-y-6">
                    {/* Informações Básicas */}
                    <div className="space-y-4">
                        <Input
                            label="Nome do agendamento"
                            placeholder="Ex: Relatório Semanal de Performance"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descrição
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                                rows={3}
                                placeholder="Descreva o propósito deste relatório..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        <Select
                            value={formData.template}
                            onValueChange={(value: string) => setFormData(prev => ({ ...prev, template: value }))}
                            options={TEMPLATE_OPTIONS}
                        />
                    </div>

                    {/* Configurações de Agendamento */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Configurações de Agendamento</h4>

                        <Select
                            value={formData.frequency}
                            onValueChange={(value: string) => setFormData(prev => ({ ...prev, frequency: value as any }))}
                            options={FREQUENCY_OPTIONS_SELECT}
                        />

                        {formData.frequency === 'custom' && (
                            <div>
                                <Input
                                    label="Expressão Cron"
                                    placeholder="0 8 * * 1"
                                    value={formData.cronExpression}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cronExpression: e.target.value }))}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Exemplo: &quot;0 8 * * 1&quot; = Segunda-feira às 8:00
                                </p>
                                {formData.cronExpression !== '' && !validateCronExpression(formData.cronExpression) && (
                                    <Alert variant="error" className="mt-2">
                                        Expressão cron inválida
                                    </Alert>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Destinatários */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">Destinatários</h4>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addRecipient}
                            >
                                + Adicionar
                            </Button>
                        </div>

                        {formData.recipients.map((email, index) => (
                            <div key={index} className="flex space-x-2">
                                <Input
                                    placeholder="email@empresa.com"
                                    value={email}
                                    onChange={(e) => updateRecipient(index, e.target.value)}
                                    className="flex-1"
                                />
                                {formData.recipients.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeRecipient(index)}
                                        className="text-red-600"
                                    >
                                        Remover
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Opções de Exportação */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Opções de Exportação</h4>

                        <div>
                            <label className="block text-sm text-gray-600 mb-2">Formatos:</label>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.formats.includes('pdf')}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData(prev => ({ ...prev, formats: [...prev.formats, 'pdf'] }));
                                            } else {
                                                setFormData(prev => ({ ...prev, formats: prev.formats.filter(f => f !== 'pdf') }));
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    PDF
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.formats.includes('excel')}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData(prev => ({ ...prev, formats: [...prev.formats, 'excel'] }));
                                            } else {
                                                setFormData(prev => ({ ...prev, formats: prev.formats.filter(f => f !== 'excel') }));
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    Excel
                                </label>
                            </div>
                        </div>

                        <Switch
                            label="Incluir gráficos"
                            checked={formData.includeCharts}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeCharts: checked }))}
                            description="Adicionar visualizações aos relatórios"
                        />

                        <Select
                            value={formData.dateRange}
                            onValueChange={(value: string) => setFormData(prev => ({ ...prev, dateRange: value as any }))}
                            options={DATE_RANGE_OPTIONS}
                        />
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCreateModal(false);
                                setEditingReport(null);
                                resetForm();
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!formData.name.trim() || formData.recipients.filter(e => e.trim()).length === 0}
                        >
                            {editingReport ? 'Salvar Alterações' : 'Criar Agendamento'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
