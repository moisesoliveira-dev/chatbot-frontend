'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Pagination } from '@/components/ui/Pagination';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { TemplateCard } from '@/components/templates';
import { useTemplates } from '@/lib/hooks/useTemplates';
import { FlowTemplate } from '@/lib/types';

interface TemplateListProps {
    onSelectTemplate?: (template: FlowTemplate) => void;
    onEditTemplate?: (templateId: number) => void;
    onCreateNew?: () => void;
    viewMode?: 'grid' | 'table';
    showActions?: boolean;
    className?: string;
}

interface Filters {
    search: string;
    status: 'all' | 'active' | 'inactive';
    sortBy: 'name' | 'created_at' | 'updated_at';
    sortOrder: 'asc' | 'desc';
}

export const TemplateList: React.FC<TemplateListProps> = ({
    onSelectTemplate,
    onEditTemplate,
    onCreateNew,
    viewMode = 'grid',
    showActions = true,
    className = ''
}) => {
    const { templates, isLoading, error, deleteTemplate, createTemplate } = useTemplates();

    const [filters, setFilters] = useState<Filters>({
        search: '',
        status: 'all',
        sortBy: 'updated_at',
        sortOrder: 'desc'
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState<FlowTemplate | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateName, setDuplicateName] = useState('');

    const itemsPerPage = viewMode === 'grid' ? 12 : 10;

    // Filter and sort templates
    const filteredTemplates = React.useMemo(() => {
        if (!templates) return [];

        const filtered = templates.filter((template: FlowTemplate) => {
            // Search filter
            const matchesSearch = template.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                template.description?.toLowerCase().includes(filters.search.toLowerCase());

            // Status filter
            const matchesStatus = filters.status === 'all' ||
                (filters.status === 'active' && template.is_active) ||
                (filters.status === 'inactive' && !template.is_active);

            return matchesSearch && matchesStatus;
        });

        // Sort
        filtered.sort((a: FlowTemplate, b: FlowTemplate) => {
            let aVal: any, bVal: any;

            switch (filters.sortBy) {
                case 'name':
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case 'created_at':
                    aVal = new Date(a.created_at || 0);
                    bVal = new Date(b.created_at || 0);
                    break;
                case 'updated_at':
                    aVal = new Date(a.updated_at || 0);
                    bVal = new Date(b.updated_at || 0);
                    break;
                default:
                    return 0;
            }

            if (filters.sortOrder === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });

        return filtered;
    }, [templates, filters]);

    // Pagination
    const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
    const paginatedTemplates = filteredTemplates.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handle actions
    const handleEdit = (template: FlowTemplate) => {
        if (onEditTemplate) {
            onEditTemplate(template.id);
        }
    };

    const handleSelect = (template: FlowTemplate) => {
        if (onSelectTemplate) {
            onSelectTemplate(template);
        }
    };

    const handleDelete = async () => {
        if (!selectedTemplate) return;

        try {
            await deleteTemplate(selectedTemplate.id);
            setShowDeleteModal(false);
            setSelectedTemplate(null);
        } catch (error) {
            console.error('Erro ao deletar template:', error);
        }
    };

    const handleDuplicate = async () => {
        if (!selectedTemplate || !duplicateName.trim()) return;

        try {
            // Para demonstração, criamos uma cópia simples
            const duplicatedData = {
                name: duplicateName.trim(),
                description: `Cópia de: ${selectedTemplate.description || selectedTemplate.name}`,
                is_active: selectedTemplate.is_active
            };

            await createTemplate(duplicatedData);
            setShowDuplicateModal(false);
            setSelectedTemplate(null);
            setDuplicateName('');
        } catch (error) {
            console.error('Erro ao duplicar template:', error);
        }
    };

    const handleFilterChange = (key: keyof Filters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page when filtering
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loading size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="error">
                <h3 className="font-medium">Erro ao carregar templates</h3>
                <p>{error}</p>
            </Alert>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold">Templates de Fluxo</h2>
                    <p className="text-gray-600">
                        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} encontrado{filteredTemplates.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {showActions && onCreateNew && (
                    <Button onClick={onCreateNew} className="whitespace-nowrap">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Novo Template
                    </Button>
                )}
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <Input
                                placeholder="Buscar templates..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Todos os Status</option>
                            <option value="active">Ativos</option>
                            <option value="inactive">Inativos</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={`${filters.sortBy}-${filters.sortOrder}`}
                            onChange={(e) => {
                                const [sortBy, sortOrder] = e.target.value.split('-');
                                setFilters(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any }));
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="updated_at-desc">Mais Recentes</option>
                            <option value="updated_at-asc">Mais Antigos</option>
                            <option value="name-asc">Nome A-Z</option>
                            <option value="name-desc">Nome Z-A</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Templates List */}
            {paginatedTemplates.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium mb-2">Nenhum template encontrado</h3>
                            <p>
                                {filters.search || filters.status !== 'all'
                                    ? 'Tente ajustar os filtros para encontrar templates.'
                                    : 'Crie seu primeiro template para começar.'}
                            </p>
                            {showActions && onCreateNew && (
                                <Button variant="outline" className="mt-4" onClick={onCreateNew}>
                                    Criar Primeiro Template
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Grid View */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedTemplates.map((template: FlowTemplate) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    onSelect={() => handleSelect(template)}
                                    onEdit={() => handleEdit(template)}
                                    onDelete={() => {
                                        setSelectedTemplate(template);
                                        setShowDeleteModal(true);
                                    }}
                                    onDuplicate={() => {
                                        setSelectedTemplate(template);
                                        setDuplicateName(`${template.name} (Cópia)`);
                                        setShowDuplicateModal(true);
                                    }}
                                    showActions={showActions}
                                />
                            ))}
                        </div>
                    )}

                    {/* Table View */}
                    {viewMode === 'table' && (
                        <Card>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uso</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atualizado</th>
                                            {showActions && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedTemplates.map((template: FlowTemplate) => (
                                            <tr key={template.id} className="hover:bg-gray-50 cursor-pointer"
                                                onClick={() => handleSelect(template)}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{template.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant={template.is_active ? 'success' : 'secondary'}>
                                                        {template.is_active ? 'Ativo' : 'Inativo'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="max-w-xs truncate text-gray-600">
                                                        {template.description || 'Sem descrição'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {Math.floor(Math.random() * 50)}x
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {template.updated_at ? new Date(template.updated_at).toLocaleDateString('pt-BR') : 'N/A'}
                                                </td>
                                                {showActions && (
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <DropdownMenu
                                                            trigger={
                                                                <Button variant="outline" size="sm">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                                    </svg>
                                                                </Button>
                                                            }
                                                            items={[
                                                                {
                                                                    id: 'edit',
                                                                    label: 'Editar',
                                                                    onClick: () => handleEdit(template)
                                                                },
                                                                {
                                                                    id: 'duplicate',
                                                                    label: 'Duplicar',
                                                                    onClick: () => {
                                                                        setSelectedTemplate(template);
                                                                        setDuplicateName(`${template.name} (Cópia)`);
                                                                        setShowDuplicateModal(true);
                                                                    }
                                                                },
                                                                {
                                                                    id: 'delete',
                                                                    label: 'Excluir',
                                                                    onClick: () => {
                                                                        setSelectedTemplate(template);
                                                                        setShowDeleteModal(true);
                                                                    }
                                                                }
                                                            ]}
                                                        />
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Delete Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Excluir Template"
            >
                <div className="space-y-4">
                    <p>
                        Tem certeza que deseja excluir o template <strong>{selectedTemplate?.name}</strong>?
                    </p>
                    <Alert variant="warning">
                        <p className="text-sm">Esta ação não pode ser desfeita. Todos os fluxos associados a este template também serão removidos.</p>
                    </Alert>
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Excluir Template
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Duplicate Modal */}
            <Modal
                isOpen={showDuplicateModal}
                onClose={() => setShowDuplicateModal(false)}
                title="Duplicar Template"
            >
                <div className="space-y-4">
                    <p>
                        Digite o nome para a cópia do template <strong>{selectedTemplate?.name}</strong>:
                    </p>
                    <Input
                        value={duplicateName}
                        onChange={(e) => setDuplicateName(e.target.value)}
                        placeholder="Nome da cópia..."
                        autoFocus
                    />
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setShowDuplicateModal(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDuplicate}
                            disabled={!duplicateName.trim()}
                        >
                            Duplicar Template
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
