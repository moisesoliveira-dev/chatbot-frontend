'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { useTemplates } from '@/lib/hooks/useTemplates';
import { FlowTemplate, TemplateFormData } from '@/lib/types';

interface ExtendedTemplateFormData extends TemplateFormData {
    is_active: boolean;
    order_index: number;
}

interface TemplateEditorProps {
    templateId?: number;
    onSave?: (template: FlowTemplate) => void;
    onCancel?: () => void;
    className?: string;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
    templateId,
    onSave,
    onCancel,
    className
}) => {
    const { templates, createTemplate, updateTemplate, isLoading } = useTemplates();

    const [formData, setFormData] = useState<ExtendedTemplateFormData>({
        name: '',
        description: '',
        is_active: true,
        order_index: 0
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Load template data if editing
    useEffect(() => {
        if (templateId && templates) {
            const template = templates.find((t: any) => t.id === templateId);
            if (template) {
                setFormData({
                    name: template.name,
                    description: template.description || '',
                    is_active: template.is_active,
                    order_index: template.order_index
                });
            }
        }
    }, [templateId, templates]);

    const handleInputChange = (field: keyof ExtendedTemplateFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Descrição deve ter no máximo 500 caracteres';
        }

        if (formData.order_index < 0) {
            newErrors.order_index = 'Ordem deve ser um número positivo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            let savedTemplate: FlowTemplate | any;

            if (templateId) {
                await updateTemplate(templateId, formData);
                savedTemplate = { ...formData, id: templateId };
            } else {
                savedTemplate = await createTemplate(formData);
            }

            setIsDirty(false);
            onSave?.(savedTemplate);
        } catch (error: any) {
            setErrors({ general: error.message || 'Erro ao salvar template' });
        }
    };

    const handleCancel = () => {
        if (isDirty) {
            const confirmLeave = window.confirm(
                'Você tem alterações não salvas. Deseja realmente sair?'
            );
            if (!confirmLeave) return;
        }
        onCancel?.();
    };

    const getPreviewData = () => {
        return {
            ...formData,
            id: templateId || 0,
            flows_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    };

    return (
        <>
            <Card className={className}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {templateId ? 'Editar Template' : 'Novo Template'}
                            </h3>
                            <p className="text-sm text-gray-600">
                                Configure as informações básicas do template
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPreview(true)}
                                disabled={!formData.name.trim()}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Preview
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {errors.general && (
                        <Alert variant="error">
                            {errors.general}
                        </Alert>
                    )}

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome do Template *
                            </label>
                            <Input
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Ex: Atendimento Geral, Suporte Técnico..."
                                error={errors.name}
                                maxLength={100}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descrição
                            </label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Descreva o propósito e uso deste template..."
                                rows={4}
                                maxLength={500}
                                error={errors.description}
                            />
                            <div className="flex justify-between items-center mt-1">
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description}</p>
                                )}
                                <p className="text-xs text-gray-500 ml-auto">
                                    {(formData.description || '').length}/500
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ordem de Exibição
                                </label>
                                <Input
                                    type="number"
                                    value={formData.order_index}
                                    onChange={(e) => handleInputChange('order_index', parseInt(e.target.value) || 0)}
                                    min="0"
                                    error={errors.order_index}
                                />
                                {errors.order_index && (
                                    <p className="mt-1 text-sm text-red-600">{errors.order_index}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <p className="text-xs text-gray-500">
                                        Template ativo ficará disponível para uso
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                                    size="md"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Template Status Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Informações do Template
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <Badge
                                    variant={formData.is_active ? 'success' : 'secondary'}
                                    size="sm"
                                >
                                    {formData.is_active ? 'Ativo' : 'Inativo'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Ordem</p>
                                <p className="text-sm font-medium text-gray-900">
                                    #{formData.order_index}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Fluxos</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {templateId ? '?' : '0'} fluxos
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Tipo</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {templateId ? 'Editando' : 'Novo'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            loading={isLoading}
                            disabled={!isDirty && !templateId}
                        >
                            {templateId ? 'Atualizar' : 'Criar'} Template
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Preview Modal */}
            <Modal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title="Preview do Template"
                size="md"
            >
                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                                {formData.name || 'Nome do Template'}
                            </h4>
                            <Badge
                                variant={formData.is_active ? 'success' : 'secondary'}
                                size="sm"
                            >
                                {formData.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                        </div>

                        {formData.description && (
                            <p className="text-sm text-gray-600 mb-3">
                                {formData.description}
                            </p>
                        )}

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xs text-gray-500">Ordem</p>
                                <p className="text-sm font-medium">#{formData.order_index}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Fluxos</p>
                                <p className="text-sm font-medium">0</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Criado</p>
                                <p className="text-sm font-medium">Agora</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500">
                        * Este é um preview de como o template aparecerá na lista
                    </div>
                </div>
            </Modal>
        </>
    );
};
