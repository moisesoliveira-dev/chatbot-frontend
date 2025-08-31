'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { FlowTemplate } from '@/lib/types';

interface TemplateCardProps {
    template: FlowTemplate;
    onSelect?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
    showActions?: boolean;
    className?: string;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
    template,
    onSelect,
    onEdit,
    onDelete,
    onDuplicate,
    showActions = true,
    className = ''
}) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleCardClick = () => {
        if (onSelect) {
            onSelect();
        }
    };

    return (
        <div
            className={`hover:shadow-lg transition-shadow cursor-pointer group ${className}`}
            onClick={handleCardClick}
        >
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate group-hover:text-blue-600 transition-colors">
                                {template.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={template.is_active ? 'success' : 'secondary'}>
                                    {template.is_active ? 'Ativo' : 'Inativo'}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                    ID: {template.id}
                                </span>
                            </div>
                        </div>

                        {showActions && (
                            <DropdownMenu
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </Button>
                                }
                                items={[
                                    {
                                        id: 'view',
                                        label: 'Abrir',
                                        onClick: () => onSelect?.()
                                    },
                                    {
                                        id: 'edit',
                                        label: 'Editar',
                                        onClick: () => onEdit?.()
                                    },
                                    {
                                        id: 'duplicate',
                                        label: 'Duplicar',
                                        onClick: () => onDuplicate?.()
                                    },
                                    {
                                        id: 'delete',
                                        label: 'Excluir',
                                        onClick: () => onDelete?.()
                                    }
                                ]}
                            />
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="space-y-3">
                        {/* Description */}
                        <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                            {template.description || 'Sem descrição disponível'}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                            <div className="text-center">
                                <div className="text-lg font-semibold text-blue-600">
                                    #{template.id}
                                </div>
                                <div className="text-xs text-gray-500">ID</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-green-600">
                                    {Math.floor(Math.random() * 50)}
                                </div>
                                <div className="text-xs text-gray-500">Usos</div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="text-xs text-gray-500 space-y-1 pt-2">
                            <div className="flex justify-between">
                                <span>Criado:</span>
                                <span>{formatDate(template.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Atualizado:</span>
                                <span>{formatDate(template.updated_at)}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect?.();
                                }}
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Ver
                            </Button>

                            {showActions && onEdit && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="flex-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit();
                                    }}
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Editar
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
