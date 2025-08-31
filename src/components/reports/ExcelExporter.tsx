'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';

interface ExcelSheet {
    name: string;
    data: any[];
    headers?: string[];
}

interface ExcelExporterProps {
    sheets: ExcelSheet[];
    filename?: string;
    onExport?: (success: boolean, filename?: string) => void;
    className?: string;
}

export const ExcelExporter: React.FC<ExcelExporterProps> = ({
    sheets,
    filename,
    onExport,
    className
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [includeCharts, setIncludeCharts] = useState(true);
    const [includeFormulas, setIncludeFormulas] = useState(true);

    const generateExcel = async () => {
        if (!sheets || sheets.length === 0) {
            onExport?.(false);
            return;
        }

        setIsGenerating(true);

        try {
            // Criar workbook
            const workbook = XLSX.utils.book_new();

            // Adicionar cada sheet
            sheets.forEach((sheet, index) => {
                if (!sheet.data || sheet.data.length === 0) return;

                // Preparar dados
                const sheetData = sheet.data.map(row => {
                    // Converter valores para formatos apropriados
                    const processedRow: any = {};
                    Object.keys(row).forEach(key => {
                        const value = row[key];

                        // Processar diferentes tipos de dados
                        if (value instanceof Date) {
                            processedRow[key] = format(value, 'dd/MM/yyyy HH:mm');
                        } else if (typeof value === 'number' && includeFormulas) {
                            processedRow[key] = value;
                        } else if (typeof value === 'boolean') {
                            processedRow[key] = value ? 'Sim' : 'Não';
                        } else {
                            processedRow[key] = String(value || '');
                        }
                    });
                    return processedRow;
                });

                // Criar worksheet
                const worksheet = XLSX.utils.json_to_sheet(sheetData);

                // Configurar larguras das colunas
                const colWidths = Object.keys(sheetData[0] || {}).map(key => ({
                    wch: Math.max(key.length, 15)
                }));
                worksheet['!cols'] = colWidths;

                // Adicionar cabeçalho personalizado se fornecido
                if (sheet.headers) {
                    // Implementar lógica de cabeçalhos customizados
                }

                // Aplicar formatação
                applyWorksheetFormatting(worksheet, sheetData);

                // Adicionar worksheet ao workbook
                const sheetName = sheet.name.substring(0, 31); // Limite do Excel
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            });

            // Adicionar sheet de resumo
            if (sheets.length > 1) {
                addSummarySheet(workbook, sheets);
            }

            // Gerar nome do arquivo
            const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
            const finalFilename = filename || `relatorio_${timestamp}.xlsx`;

            // Salvar arquivo
            XLSX.writeFile(workbook, finalFilename);

            onExport?.(true, finalFilename);

        } catch (error) {
            console.error('Erro ao gerar Excel:', error);
            onExport?.(false);
        } finally {
            setIsGenerating(false);
        }
    };

    const applyWorksheetFormatting = (worksheet: XLSX.WorkSheet, data: any[]) => {
        if (!data.length) return;

        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

        // Aplicar formatação às células de cabeçalho
        for (let col = range.s.c; col <= range.e.c; col++) {
            const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
            if (worksheet[headerCell]) {
                worksheet[headerCell].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "366092" } },
                    alignment: { horizontal: "center" }
                };
            }
        }

        // Aplicar formatação às células de dados
        for (let row = range.s.r + 1; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                if (worksheet[cellAddress]) {
                    const cellValue = worksheet[cellAddress].v;

                    // Formatação baseada no tipo de dado
                    if (typeof cellValue === 'number') {
                        worksheet[cellAddress].s = {
                            numFmt: '#,##0.00'
                        };
                    } else if (cellValue && String(cellValue).match(/^\d{2}\/\d{2}\/\d{4}/)) {
                        worksheet[cellAddress].s = {
                            numFmt: 'dd/mm/yyyy'
                        };
                    }
                }
            }
        }
    };

    const addSummarySheet = (workbook: XLSX.WorkBook, sheets: ExcelSheet[]) => {
        const summaryData = [
            ['Resumo do Relatório'],
            [''],
            ['Gerado em:', format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })],
            ['Total de Planilhas:', sheets.length],
            [''],
            ['Detalhes das Planilhas:'],
            ['Nome da Planilha', 'Registros', 'Colunas']
        ];

        sheets.forEach(sheet => {
            summaryData.push([
                sheet.name,
                sheet.data.length,
                Object.keys(sheet.data[0] || {}).length
            ]);
        });

        const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);

        // Formatação do resumo
        summaryWorksheet['!cols'] = [
            { wch: 25 },
            { wch: 15 },
            { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumo');
    };

    const generateCSV = async () => {
        if (!sheets || sheets.length === 0) return;

        const sheet = sheets[0]; // Para CSV, usar apenas a primeira planilha
        const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(sheet.data));

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${sheet.name}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        onExport?.(true, `${sheet.name}.csv`);
    };

    const getTotalRecords = () => {
        return sheets.reduce((total, sheet) => total + (sheet.data?.length || 0), 0);
    };

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Exportar para Excel/CSV
                        </h3>
                        <p className="text-sm text-gray-600">
                            Gere planilhas com múltiplas abas e formatação avançada
                        </p>
                    </div>
                    <Badge variant="success" className="text-xs">
                        {sheets.length} {sheets.length === 1 ? 'PLANILHA' : 'PLANILHAS'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Informações das planilhas */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Planilhas a exportar:</h4>
                        <div className="space-y-1">
                            {sheets.map((sheet, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{sheet.name}</span>
                                    <Badge variant="secondary" size="sm">
                                        {sheet.data?.length || 0} registros
                                    </Badge>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm font-medium">
                                <span className="text-gray-700">Total de registros:</span>
                                <span className="text-blue-600">{getTotalRecords()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Opções de formatação */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">Opções de exportação:</h4>

                        <div className="space-y-2">
                            <Switch
                                label="Incluir formatação avançada"
                                checked={includeCharts}
                                onCheckedChange={setIncludeCharts}
                                description="Aplicar cores, fontes e estilos às células"
                            />

                            <Switch
                                label="Manter fórmulas numéricas"
                                checked={includeFormulas}
                                onCheckedChange={setIncludeFormulas}
                                description="Preservar valores numéricos para cálculos"
                            />
                        </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex items-center space-x-3 pt-2">
                        <Button
                            onClick={generateExcel}
                            disabled={isGenerating || sheets.length === 0}
                            className="flex items-center space-x-2"
                            variant="primary"
                        >
                            {isGenerating ? (
                                <Loading variant="spinner" size="sm" />
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            )}
                            <span>{isGenerating ? 'Gerando...' : 'Excel (.xlsx)'}</span>
                        </Button>

                        <Button
                            onClick={generateCSV}
                            disabled={isGenerating || sheets.length === 0}
                            variant="outline"
                            className="flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span>CSV (.csv)</span>
                        </Button>
                    </div>

                    {sheets.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                            Nenhum dado disponível para exportação
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
