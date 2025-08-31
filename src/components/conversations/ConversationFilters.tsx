'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Badge } from '@/components/ui/Badge';
import {
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

interface ConversationFiltersProps {
    filters: any;
    onFiltersChange: (filters: any) => void;
    onClearFilters: () => void;
    className?: string;
}

export const ConversationFilters: React.FC<ConversationFiltersProps> = ({
    filters,
    onFiltersChange,
    onClearFilters,
    className = ''
}) => {
    const statusOptions = [
        { value: '', label: 'Todos os status' },
        { value: 'active', label: 'Ativo' },
        { value: 'waiting_file', label: 'Aguardando Arquivo' },
        { value: 'completed', label: 'Concluído' },
        { value: 'error', label: 'Erro' },
        { value: 'paused', label: 'Pausado' }
    ];

    const handleFilterChange = (key: string, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value
        });
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.status) count++;
        if (filters.template_id) count++;
        if (filters.dateFrom) count++;
        if (filters.dateTo) count++;
        return count;
    };

    const activeFiltersCount = getActiveFiltersCount();

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center space-x-2">
                    <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-semibold">Filtros</h3>
                    {activeFiltersCount > 0 && (
                        <Badge variant="primary" size="sm">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </div>

                {activeFiltersCount > 0 && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onClearFilters}
                    >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Limpar
                    </Button>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Busca por texto */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Buscar
                    </label>
                    <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Buscar por contato, template ou fluxo..."
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Status
                    </label>
                    <Select
                        value={filters.status || ''}
                        onValueChange={(value) => handleFilterChange('status', value)}
                        options={statusOptions}
                        placeholder="Selecionar status"
                    />
                </div>

                {/* Template */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Template
                    </label>
                    <Input
                        placeholder="ID do template"
                        value={filters.template_id || ''}
                        onChange={(e) => handleFilterChange('template_id', e.target.value)}
                        type="number"
                    />
                </div>

                {/* Período */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Data inicial
                        </label>
                        <Input
                            type="date"
                            value={filters.dateFrom || ''}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            placeholder="Data inicial"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Data final
                        </label>
                        <Input
                            type="date"
                            value={filters.dateTo || ''}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            placeholder="Data final"
                        />
                    </div>
                </div>

                {/* Contato específico */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        ID do Contato
                    </label>
                    <Input
                        placeholder="ID específico do contato"
                        value={filters.contact_id || ''}
                        onChange={(e) => handleFilterChange('contact_id', e.target.value)}
                    />
                </div>

                {/* Ordenação */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Ordenar por
                    </label>
                    <Select
                        value={filters.sortBy || 'created_at'}
                        onValueChange={(value) => handleFilterChange('sortBy', value)}
                        options={[
                            { value: 'created_at', label: 'Data de criação' },
                            { value: 'updated_at', label: 'Última atualização' },
                            { value: 'contact_id', label: 'ID do contato' },
                            { value: 'status', label: 'Status' }
                        ]}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Direção
                    </label>
                    <Select
                        value={filters.sortOrder || 'desc'}
                        onValueChange={(value) => handleFilterChange('sortOrder', value)}
                        options={[
                            { value: 'desc', label: 'Decrescente' },
                            { value: 'asc', label: 'Crescente' }
                        ]}
                    />
                </div>

                {/* Resumo dos filtros ativos */}
                {activeFiltersCount > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">Filtros ativos:</div>
                        <div className="flex flex-wrap gap-2">
                            {filters.search && (
                                <Badge variant="secondary" size="sm">
                                    Busca: {filters.search}
                                </Badge>
                            )}
                            {filters.status && (
                                <Badge variant="secondary" size="sm">
                                    Status: {statusOptions.find(opt => opt.value === filters.status)?.label}
                                </Badge>
                            )}
                            {filters.template_id && (
                                <Badge variant="secondary" size="sm">
                                    Template: {filters.template_id}
                                </Badge>
                            )}
                            {filters.contact_id && (
                                <Badge variant="secondary" size="sm">
                                    Contato: {filters.contact_id}
                                </Badge>
                            )}
                            {(filters.dateFrom || filters.dateTo) && (
                                <Badge variant="secondary" size="sm">
                                    Período: {filters.dateFrom || 'início'} até {filters.dateTo || 'hoje'}
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
