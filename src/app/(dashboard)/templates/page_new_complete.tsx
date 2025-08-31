'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TemplateList, TemplateForm, TemplatePreview } from '@/components/templates';
import { FlowTemplate } from '@/lib/types';

type ViewMode = 'list' | 'create' | 'edit' | 'preview';

export default function TemplatesPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedTemplate, setSelectedTemplate] = useState<FlowTemplate | null>(null);
    const [listViewMode, setListViewMode] = useState<'grid' | 'table'>('grid');

    // Handle template selection for preview
    const handleSelectTemplate = (template: FlowTemplate) => {
        setSelectedTemplate(template);
        setViewMode('preview');
    };

    // Handle edit template
    const handleEditTemplate = (templateId: number) => {
        // TODO: Implementar busca do template pelo ID
        console.log('Editing template:', templateId);
        setViewMode('edit');
    };

    // Handle create new template
    const handleCreateNew = () => {
        setSelectedTemplate(null);
        setViewMode('create');
    };

    // Handle save template (create or edit)
    const handleSaveTemplate = (template: FlowTemplate) => {
        console.log('Template saved:', template);
        setViewMode('list');
        setSelectedTemplate(null);
    };

    // Handle cancel form
    const handleCancelForm = () => {
        setViewMode('list');
        setSelectedTemplate(null);
    };

    // Handle edit from preview
    const handleEditFromPreview = () => {
        setViewMode('edit');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Gerenciamento de Templates
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Crie e gerencie templates de fluxo conversacional para seu chatbot
                    </p>
                </div>

                {viewMode === 'list' && (
                    <div className="flex items-center gap-3">
                        {/* View Mode Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setListViewMode('grid')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${listViewMode === 'grid'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setListViewMode('table')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${listViewMode === 'table'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                            </button>
                        </div>

                        <Button onClick={handleCreateNew}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Novo Template
                        </Button>
                    </div>
                )}

                {viewMode !== 'list' && (
                    <Button variant="outline" onClick={() => setViewMode('list')}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar à Lista
                    </Button>
                )}
            </div>

            {/* Content */}
            {viewMode === 'list' && (
                <TemplateList
                    viewMode={listViewMode}
                    onSelectTemplate={handleSelectTemplate}
                    onEditTemplate={handleEditTemplate}
                    onCreateNew={handleCreateNew}
                />
            )}

            {viewMode === 'create' && (
                <TemplateForm
                    mode="create"
                    onSave={handleSaveTemplate}
                    onCancel={handleCancelForm}
                />
            )}

            {viewMode === 'edit' && selectedTemplate && (
                <TemplateForm
                    mode="edit"
                    templateId={selectedTemplate.id}
                    initialData={selectedTemplate}
                    onSave={handleSaveTemplate}
                    onCancel={handleCancelForm}
                />
            )}

            {viewMode === 'preview' && selectedTemplate && (
                <TemplatePreview
                    template={selectedTemplate}
                    onEdit={handleEditFromPreview}
                />
            )}

            {/* Quick Stats */}
            {viewMode === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">12</div>
                                <div className="text-sm text-gray-600">Templates Ativos</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">3</div>
                                <div className="text-sm text-gray-600">Templates Inativos</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">84</div>
                                <div className="text-sm text-gray-600">Fluxos Criados</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">1.2k</div>
                                <div className="text-sm text-gray-600">Conversas Processadas</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
