'use client';

import React, { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { PDFExporter } from './PDFExporter';
import { ExcelExporter } from './ExcelExporter';
import {
    ConversationChart,
    FlowUsageChart,
    FileAnalyticsChart,
    ActivityHeatmap
} from '@/components/analytics';

interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    type: 'conversations' | 'performance' | 'files' | 'flows' | 'executive';
    defaultPeriod: 'last7days' | 'last30days' | 'thisMonth' | 'custom';
    includeCharts: boolean;
    sections: string[];
}

const REPORT_TEMPLATES: ReportTemplate[] = [
    {
        id: 'conversations',
        name: 'Relatório de Conversas',
        description: 'Análise detalhada das interações com usuários',
        type: 'conversations',
        defaultPeriod: 'last7days',
        includeCharts: true,
        sections: ['overview', 'timeline', 'user_analysis', 'performance']
    },
    {
        id: 'performance',
        name: 'Relatório de Performance',
        description: 'Métricas de eficiência e tempo de resposta',
        type: 'performance',
        defaultPeriod: 'last30days',
        includeCharts: true,
        sections: ['metrics', 'trends', 'comparisons']
    },
    {
        id: 'files',
        name: 'Relatório de Arquivos',
        description: 'Análise de uploads e tipos de arquivos processados',
        type: 'files',
        defaultPeriod: 'thisMonth',
        includeCharts: true,
        sections: ['file_types', 'volume', 'processing_stats']
    },
    {
        id: 'flows',
        name: 'Relatório de Fluxos',
        description: 'Performance e uso dos fluxos conversacionais',
        type: 'flows',
        defaultPeriod: 'last30days',
        includeCharts: true,
        sections: ['flow_usage', 'success_rates', 'user_paths']
    },
    {
        id: 'executive',
        name: 'Relatório Executivo',
        description: 'Resumo executivo para gestão e tomada de decisões',
        type: 'executive',
        defaultPeriod: 'thisMonth',
        includeCharts: true,
        sections: ['summary', 'key_metrics', 'insights', 'recommendations']
    }
];

interface ReportBuilderProps {
    className?: string;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({ className }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
    const [dateRange, setDateRange] = useState({
        start: subDays(new Date(), 7),
        end: new Date()
    });
    const [includeCharts, setIncludeCharts] = useState(true);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'both'>('pdf');
    const [customSections, setCustomSections] = useState<string[]>([]);

    const handleTemplateSelect = (template: ReportTemplate) => {
        setSelectedTemplate(template);
        setIncludeCharts(template.includeCharts);
        setCustomSections(template.sections);

        // Configurar período padrão
        const now = new Date();
        switch (template.defaultPeriod) {
            case 'last7days':
                setDateRange({ start: subDays(now, 7), end: now });
                break;
            case 'last30days':
                setDateRange({ start: subDays(now, 30), end: now });
                break;
            case 'thisMonth':
                setDateRange({ start: startOfMonth(now), end: endOfMonth(now) });
                break;
        }
    };

    const handlePeriodChange = (period: string) => {
        const now = new Date();
        switch (period) {
            case 'last7days':
                setDateRange({ start: subDays(now, 7), end: now });
                break;
            case 'last30days':
                setDateRange({ start: subDays(now, 30), end: now });
                break;
            case 'thisMonth':
                setDateRange({ start: startOfMonth(now), end: endOfMonth(now) });
                break;
            case 'lastMonth':
                const lastMonth = subDays(startOfMonth(now), 1);
                setDateRange({
                    start: startOfMonth(lastMonth),
                    end: endOfMonth(lastMonth)
                });
                break;
        }
    };

    const generateMockData = () => {
        if (!selectedTemplate) return [];

        // Gerar dados mock baseados no tipo de relatório
        switch (selectedTemplate.type) {
            case 'conversations':
                return [
                    { data: format(new Date(), 'dd/MM/yyyy'), conversas: 45, mensagens: 234, usuario: 'João Silva', duracao: '5m 23s' },
                    { data: format(subDays(new Date(), 1), 'dd/MM/yyyy'), conversas: 38, mensagens: 189, usuario: 'Maria Santos', duracao: '4m 12s' },
                    { data: format(subDays(new Date(), 2), 'dd/MM/yyyy'), conversas: 52, mensagens: 287, usuario: 'Pedro Costa', duracao: '6m 45s' },
                ];
            case 'performance':
                return [
                    { metrica: 'Taxa de Resposta', valor: '92%', meta: '90%', status: 'Acima' },
                    { metrica: 'Tempo Médio', valor: '2.3s', meta: '3.0s', status: 'Dentro' },
                    { metrica: 'Satisfação', valor: '4.7/5', meta: '4.5/5', status: 'Acima' },
                ];
            case 'files':
                return [
                    { tipo: 'PDF', quantidade: 234, tamanho_mb: 45.6, processados: 232 },
                    { tipo: 'Imagem', quantidade: 189, tamanho_mb: 23.4, processados: 185 },
                    { tipo: 'Documento', quantidade: 156, tamanho_mb: 12.8, processados: 154 },
                ];
            case 'flows':
                return [
                    { fluxo: 'Atendimento Geral', usos: 345, taxa_sucesso: '89%', tempo_medio: '3m 45s' },
                    { fluxo: 'Suporte Técnico', usos: 278, taxa_sucesso: '76%', tempo_medio: '5m 12s' },
                    { fluxo: 'Upload Documentos', usos: 234, taxa_sucesso: '94%', tempo_medio: '2m 33s' },
                ];
            case 'executive':
                return [
                    { kpi: 'Conversas Totais', valor: 1247, variacao: '+12%' },
                    { kpi: 'Taxa de Resolução', valor: '87%', variacao: '+3%' },
                    { kpi: 'Tempo Médio de Atendimento', valor: '4m 23s', variacao: '-8%' },
                    { kpi: 'Satisfação do Cliente', valor: '4.6/5', variacao: '+2%' },
                ];
            default:
                return [];
        }
    };

    const getExcelSheets = () => {
        if (!selectedTemplate) return [];

        const mockData = generateMockData();
        return [{
            name: selectedTemplate.name,
            data: mockData
        }];
    };

    const getReportConfig = () => {
        if (!selectedTemplate) return null;

        return {
            type: selectedTemplate.type,
            title: selectedTemplate.name,
            dateRange,
            filters: {},
            includeCharts,
            format: exportFormat as 'pdf' | 'excel' | 'csv'
        };
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Seleção de Template */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Construtor de Relatórios
                    </h3>
                    <p className="text-sm text-gray-600">
                        Crie relatórios customizados com dados do seu chatbot
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {REPORT_TEMPLATES.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => handleTemplateSelect(template)}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedTemplate?.id === template.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                                    <Badge variant="secondary" size="sm">
                                        {template.type}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                    {template.description}
                                </p>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    <span>📊 {template.sections.length} seções</span>
                                    <span>•</span>
                                    <span>{template.includeCharts ? '📈 Com gráficos' : '📄 Só dados'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {selectedTemplate && (
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Configurações do Relatório
                        </h3>
                        <p className="text-sm text-gray-600">
                            Personalize as opções de geração
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Configurações de Período */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Período do Relatório
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                                    {[
                                        { value: 'last7days', label: 'Últimos 7 dias' },
                                        { value: 'last30days', label: 'Últimos 30 dias' },
                                        { value: 'thisMonth', label: 'Este mês' },
                                        { value: 'lastMonth', label: 'Mês anterior' },
                                    ].map((period) => (
                                        <Button
                                            key={period.value}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePeriodChange(period.value)}
                                        >
                                            {period.label}
                                        </Button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Data inicial</label>
                                        <DatePicker
                                            value={dateRange.start}
                                            onChange={(date: Date | null) => date && setDateRange(prev => ({ ...prev, start: date }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Data final</label>
                                        <DatePicker
                                            value={dateRange.end}
                                            onChange={(date: Date | null) => date && setDateRange(prev => ({ ...prev, end: date }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Opções de Formato */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Opções de Exportação
                                </label>
                                <div className="space-y-3">
                                    <Switch
                                        label="Incluir gráficos e visualizações"
                                        checked={includeCharts}
                                        onCheckedChange={setIncludeCharts}
                                        description="Adicionar gráficos interativos ao relatório"
                                    />

                                    <div>
                                        <label className="block text-sm text-gray-600 mb-2">Formato de exportação:</label>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant={exportFormat === 'pdf' ? 'primary' : 'outline'}
                                                size="sm"
                                                onClick={() => setExportFormat('pdf')}
                                            >
                                                PDF
                                            </Button>
                                            <Button
                                                variant={exportFormat === 'excel' ? 'primary' : 'outline'}
                                                size="sm"
                                                onClick={() => setExportFormat('excel')}
                                            >
                                                Excel
                                            </Button>
                                            <Button
                                                variant={exportFormat === 'both' ? 'primary' : 'outline'}
                                                size="sm"
                                                onClick={() => setExportFormat('both')}
                                            >
                                                Ambos
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Preview e Exportação */}
            {selectedTemplate && (
                <div className="space-y-6">
                    {/* Preview dos Gráficos */}
                    {includeCharts && (
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Preview dos Gráficos
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Visualização dos gráficos que serão incluídos
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {selectedTemplate.type === 'conversations' && (
                                        <ConversationChart className="chart-container" />
                                    )}
                                    {selectedTemplate.type === 'flows' && (
                                        <FlowUsageChart className="chart-container" />
                                    )}
                                    {selectedTemplate.type === 'files' && (
                                        <FileAnalyticsChart className="chart-container" />
                                    )}
                                    <ActivityHeatmap className="chart-container" />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Exportadores */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {(exportFormat === 'pdf' || exportFormat === 'both') && (
                            <PDFExporter
                                data={generateMockData()}
                                config={getReportConfig()!}
                                onExport={(success, filename) => {
                                    console.log('PDF Export:', success, filename);
                                }}
                            />
                        )}

                        {(exportFormat === 'excel' || exportFormat === 'both') && (
                            <ExcelExporter
                                sheets={getExcelSheets()}
                                filename={`${selectedTemplate.name.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`}
                                onExport={(success, filename) => {
                                    console.log('Excel Export:', success, filename);
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
