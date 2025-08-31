'use client';

import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';

interface ReportConfig {
    type: 'conversations' | 'performance' | 'files' | 'flows' | 'executive';
    title: string;
    dateRange: {
        start: Date;
        end: Date;
    };
    filters: Record<string, any>;
    includeCharts: boolean;
    format: 'pdf' | 'excel' | 'csv';
}

interface PDFExporterProps {
    data?: any;
    config: ReportConfig;
    onExport?: (success: boolean, filename?: string) => void;
    className?: string;
}

export const PDFExporter: React.FC<PDFExporterProps> = ({
    data,
    config,
    onExport,
    className
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const reportRef = useRef<HTMLDivElement>(null);

    const generatePDF = async () => {
        if (!reportRef.current) return;

        setIsGenerating(true);
        setProgress(10);

        try {
            // Configuração do PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;

            setProgress(25);

            // Cabeçalho do relatório
            pdf.setFontSize(20);
            pdf.text(config.title, margin, 30);

            pdf.setFontSize(12);
            const dateRange = `${format(config.dateRange.start, 'dd/MM/yyyy', { locale: ptBR })} - ${format(config.dateRange.end, 'dd/MM/yyyy', { locale: ptBR })}`;
            pdf.text(`Período: ${dateRange}`, margin, 45);
            pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, margin, 55);

            setProgress(50);

            // Captura dos gráficos se habilitado
            if (config.includeCharts) {
                const charts = reportRef.current.querySelectorAll('.chart-container');
                let yPosition = 70;

                for (let i = 0; i < charts.length; i++) {
                    const chart = charts[i] as HTMLElement;

                    try {
                        const canvas = await html2canvas(chart, {
                            scale: 2,
                            useCORS: true,
                            allowTaint: true
                        });

                        const imgData = canvas.toDataURL('image/png');
                        const imgWidth = pageWidth - (margin * 2);
                        const imgHeight = (canvas.height * imgWidth) / canvas.width;

                        // Verificar se precisa de nova página
                        if (yPosition + imgHeight > pageHeight - margin) {
                            pdf.addPage();
                            yPosition = margin;
                        }

                        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
                        yPosition += imgHeight + 10;

                        setProgress(50 + ((i + 1) / charts.length) * 30);
                    } catch (chartError) {
                        console.warn('Erro ao capturar gráfico:', chartError);
                    }
                }
            }

            setProgress(85);

            // Adicionar dados tabulares
            await addTableData(pdf, data, margin, config.includeCharts ? 200 : 70);

            setProgress(95);

            // Gerar nome do arquivo
            const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
            const filename = `relatorio_${config.type}_${timestamp}.pdf`;

            // Salvar PDF
            pdf.save(filename);

            setProgress(100);
            onExport?.(true, filename);

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            onExport?.(false);
        } finally {
            setIsGenerating(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    const addTableData = async (pdf: jsPDF, tableData: any, margin: number, startY: number) => {
        if (!tableData || !Array.isArray(tableData)) return;

        let yPosition = startY;
        const pageHeight = pdf.internal.pageSize.getHeight();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const lineHeight = 8;

        // Título da tabela
        pdf.setFontSize(14);
        pdf.text('Dados Detalhados', margin, yPosition);
        yPosition += 15;

        // Cabeçalhos da tabela
        pdf.setFontSize(10);
        const headers = Object.keys(tableData[0] || {});
        const colWidth = (pageWidth - margin * 2) / headers.length;

        // Desenhar cabeçalhos
        pdf.setFont('helvetica', 'bold');
        headers.forEach((header, index) => {
            pdf.text(header, margin + (index * colWidth), yPosition);
        });
        yPosition += lineHeight;

        // Linha separadora
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        // Dados da tabela
        pdf.setFont('helvetica', 'normal');
        tableData.forEach((row: any) => {
            // Verificar se precisa de nova página
            if (yPosition > pageHeight - 30) {
                pdf.addPage();
                yPosition = margin;
            }

            headers.forEach((header, index) => {
                const value = String(row[header] || '');
                const truncatedValue = value.length > 20 ? value.substring(0, 17) + '...' : value;
                pdf.text(truncatedValue, margin + (index * colWidth), yPosition);
            });
            yPosition += lineHeight;
        });
    };

    return (
        <div className={className}>
            <div ref={reportRef} className="hidden">
                {/* Área para captura dos gráficos */}
                <div className="p-6 bg-white">
                    <h1 className="text-2xl font-bold mb-4">{config.title}</h1>
                    <p className="text-gray-600 mb-6">
                        Período: {format(config.dateRange.start, 'dd/MM/yyyy', { locale: ptBR })} - {format(config.dateRange.end, 'dd/MM/yyyy', { locale: ptBR })}
                    </p>

                    {/* Aqui seriam renderizados os gráficos para captura */}
                    <div className="chart-container mb-6">
                        {/* Placeholder para gráficos */}
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Exportar Relatório PDF
                            </h3>
                            <p className="text-sm text-gray-600">
                                Gere relatórios em PDF com gráficos e dados detalhados
                            </p>
                        </div>
                        <Badge variant="info" className="text-xs">
                            {config.type.toUpperCase()}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Título do Relatório
                                </label>
                                <input
                                    type="text"
                                    value={config.title}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Período
                                </label>
                                <input
                                    type="text"
                                    value={`${format(config.dateRange.start, 'dd/MM/yyyy')} - ${format(config.dateRange.end, 'dd/MM/yyyy')}`}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={config.includeCharts}
                                    readOnly
                                    className="rounded border-gray-300 text-blue-600 mr-2"
                                />
                                <span className="text-sm text-gray-700">Incluir gráficos</span>
                            </label>
                        </div>

                        {isGenerating && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Gerando relatório...</span>
                                    <span className="font-medium">{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center space-x-3 pt-2">
                            <Button
                                onClick={generatePDF}
                                disabled={isGenerating}
                                className="flex items-center space-x-2"
                            >
                                {isGenerating ? (
                                    <Loading variant="spinner" size="sm" />
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                )}
                                <span>{isGenerating ? 'Gerando...' : 'Gerar PDF'}</span>
                            </Button>

                            <div className="text-xs text-gray-500">
                                {data ? `${Array.isArray(data) ? data.length : 0} registros` : 'Sem dados'}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
