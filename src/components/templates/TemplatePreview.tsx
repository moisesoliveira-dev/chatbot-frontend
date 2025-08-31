'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FlowTemplate } from '@/lib/types';

interface TemplatePreviewProps {
    template: FlowTemplate;
    onEdit?: () => void;
    onClose?: () => void;
    showActions?: boolean;
    className?: string;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
    template,
    onEdit,
    onClose,
    showActions = true,
    className = ''
}) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold">{template.name}</h2>
                            <Badge variant={template.is_active ? 'success' : 'secondary'}>
                                {template.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-500">Template ID: {template.id}</p>
                    </div>

                    {onClose && (
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Description */}
                <div>
                    <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
                    <p className="text-gray-600">
                        {template.description || 'Nenhuma descrição fornecida'}
                    </p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-medium text-gray-900 mb-3">Informações</h3>
                        <dl className="space-y-2">
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">Status:</dt>
                                <dd>
                                    <Badge variant={template.is_active ? 'success' : 'secondary'} size="sm">
                                        {template.is_active ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">ID:</dt>
                                <dd className="text-sm font-mono">#{template.id}</dd>
                            </div>
                        </dl>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-900 mb-3">Datas</h3>
                        <dl className="space-y-2">
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">Criado:</dt>
                                <dd className="text-sm">{formatDate(template.created_at)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">Atualizado:</dt>
                                <dd className="text-sm">{formatDate(template.updated_at)}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Usage Stats */}
                <div>
                    <h3 className="font-medium text-gray-900 mb-3">Estatísticas de Uso</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {Math.floor(Math.random() * 100)}
                            </div>
                            <div className="text-xs text-blue-600">Conversas</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {Math.floor(Math.random() * 50)}
                            </div>
                            <div className="text-xs text-green-600">Fluxos</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {Math.floor(Math.random() * 20)}
                            </div>
                            <div className="text-xs text-purple-600">Mensagens</div>
                        </div>
                    </div>
                </div>

                {/* Template Structure Preview */}
                <div>
                    <h3 className="font-medium text-gray-900 mb-3">Estrutura</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Template Base: {template.name}</span>
                            </div>
                            <div className="ml-4 space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Fluxos: {Math.floor(Math.random() * 5) + 1} configurados</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span>Mensagens: {Math.floor(Math.random() * 15) + 5} definidas</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>Triggers: {Math.floor(Math.random() * 10) + 3} palavras-chave</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {showActions && (
                    <div className="flex gap-3 pt-4 border-t">
                        {onEdit && (
                            <Button onClick={onEdit} className="flex-1 sm:flex-none">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar Template
                            </Button>
                        )}

                        <Button variant="outline" className="flex-1 sm:flex-none">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Gerenciar Fluxos
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
