'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { Label } from '@/components/ui/Label';
import { useTemplates } from '@/lib/hooks/useTemplates';
import { FlowTemplate, TemplateFormData } from '@/lib/types';

interface TemplateFormProps {
    templateId?: number;
    initialData?: Partial<FlowTemplate>;
    onSave?: (template: FlowTemplate) => void;
    onCancel?: () => void;
    mode?: 'create' | 'edit' | 'duplicate';
    className?: string;
}

interface ExtendedTemplateFormData extends TemplateFormData {
    is_active: boolean;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
    templateId,
    initialData,
    onSave,
    onCancel,
    mode = 'create',
    className = ''
}) => {
    const { templates, createTemplate, updateTemplate, isLoading } = useTemplates();

    const [formData, setFormData] = useState<ExtendedTemplateFormData>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        is_active: initialData?.is_active ?? true
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load template data if editing
    useEffect(() => {
        if (templateId && templates && !initialData) {
            const template = templates.find((t: any) => t.id === templateId);
            if (template) {
                setFormData({
                    name: template.name,
                    description: template.description || '',
                    is_active: template.is_active
                });
            }
        }
    }, [templateId, templates, initialData]);

    // Validation
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
        } else if (formData.name.length > 100) {
            newErrors.name = 'Nome não pode ter mais de 100 caracteres';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Descrição não pode ter mais de 500 caracteres';
        }

        // Check for duplicate names (except current template)
        if (templates && formData.name.trim()) {
            const existingTemplate = templates.find((t: any) =>
                t.name.toLowerCase() === formData.name.toLowerCase() &&
                t.id !== templateId
            );
            if (existingTemplate) {
                newErrors.name = 'Já existe um template com este nome';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form changes
    const handleChange = (field: keyof ExtendedTemplateFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);

        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            let result: FlowTemplate;

            if (mode === 'create' || mode === 'duplicate') {
                result = await createTemplate(formData);
            } else {
                await updateTemplate(templateId!, formData);
                result = { ...formData, id: templateId! } as FlowTemplate;
            }

            if (onSave) {
                onSave(result);
            }

            // Reset form if creating
            if (mode === 'create') {
                setFormData({
                    name: '',
                    description: '',
                    is_active: true
                });
                setIsDirty(false);
            }
        } catch (error) {
            console.error('Erro ao salvar template:', error);
            setErrors({
                submit: 'Erro ao salvar template. Tente novamente.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (isDirty) {
            const confirmed = window.confirm('Há alterações não salvas. Deseja realmente cancelar?');
            if (!confirmed) return;
        }

        if (onCancel) {
            onCancel();
        }
    };

    const getTitle = () => {
        switch (mode) {
            case 'create': return 'Criar Novo Template';
            case 'edit': return 'Editar Template';
            case 'duplicate': return 'Duplicar Template';
            default: return 'Template';
        }
    };

    const getSubmitLabel = () => {
        switch (mode) {
            case 'create': return 'Criar Template';
            case 'edit': return 'Salvar Alterações';
            case 'duplicate': return 'Duplicar Template';
            default: return 'Salvar';
        }
    };

    if (isLoading && !templates) {
        return (
            <Card className={className}>
                <CardContent className="py-12 text-center">
                    <Loading size="lg" />
                    <p className="mt-4 text-gray-600">Carregando dados...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">{getTitle()}</h2>
                        {mode === 'duplicate' && initialData && (
                            <p className="text-sm text-gray-600">
                                Criando cópia de: <strong>{initialData.name}</strong>
                            </p>
                        )}
                    </div>

                    {isDirty && (
                        <Badge variant="warning" className="animate-pulse">
                            Não salvo
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {errors.submit && (
                    <Alert variant="error" className="mb-6">
                        {errors.submit}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Template Name */}
                    <div>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Nome do Template *
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Ex: Atendimento Geral, Suporte Técnico..."
                            error={errors.name}
                            className="mt-1"
                            maxLength={100}
                        />
                        <div className="flex justify-between mt-1">
                            {errors.name && (
                                <p className="text-sm text-red-600">{errors.name}</p>
                            )}
                            <p className="text-xs text-gray-500 ml-auto">
                                {formData.name.length}/100
                            </p>
                        </div>
                    </div>

                    {/* Template Description */}
                    <div>
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                            Descrição
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Descreva o propósito e uso deste template..."
                            error={errors.description}
                            className="mt-1"
                            rows={4}
                            maxLength={500}
                        />
                        <div className="flex justify-between mt-1">
                            {errors.description && (
                                <p className="text-sm text-red-600">{errors.description}</p>
                            )}
                            <p className="text-xs text-gray-500 ml-auto">
                                {formData.description?.length || 0}/500
                            </p>
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                Template Ativo
                            </Label>
                            <p className="text-xs text-gray-600">
                                Templates inativos não aparecem para seleção
                            </p>
                        </div>
                        <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => handleChange('is_active', checked)}
                        />
                    </div>

                    {/* Preview Section */}
                    {(formData.name || formData.description) && (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium mb-4">Preview</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">{formData.name || 'Nome do Template'}</h4>
                                    <Badge variant={formData.is_active ? 'success' : 'secondary'}>
                                        {formData.is_active ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {formData.description || 'Sem descrição'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none"
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            disabled={!isDirty || isSubmitting || Object.keys(errors).length > 0}
                            className="flex-1 sm:flex-none"
                        >
                            {isSubmitting && (
                                <Loading size="sm" className="mr-2" />
                            )}
                            {getSubmitLabel()}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};
