'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

interface FlowNode {
    id: string;
    type: 'message' | 'question' | 'condition' | 'action';
    title: string;
    content?: string;
    position: { x: number; y: number };
    connections?: string[];
}

interface NodeEditorProps {
    node: FlowNode | null;
    onNodeUpdate: (id: string, updates: Partial<FlowNode>) => void;
    onClose: () => void;
}

export const NodeEditor: React.FC<NodeEditorProps> = ({
    node,
    onNodeUpdate,
    onClose,
}) => {
    if (!node) {
        return (
            <Card className="w-80">
                <CardContent className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <p className="text-gray-500">Selecione um nó para editar</p>
                </CardContent>
            </Card>
        );
    }

    const handleUpdate = (field: keyof FlowNode, value: any) => {
        onNodeUpdate(node.id, { [field]: value });
    };

    const nodeTypeOptions = [
        { value: 'message', label: 'Mensagem' },
        { value: 'question', label: 'Pergunta' },
        { value: 'condition', label: 'Condição' },
        { value: 'action', label: 'Ação' },
    ];

    return (
        <Card className="w-80">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Editar Nó</h3>
                    <Button variant="secondary" size="sm" onClick={onClose}>
                        ×
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo
                    </label>
                    <Select
                        value={node.type}
                        onValueChange={(value) => handleUpdate('type', value)}
                        options={nodeTypeOptions}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título
                    </label>
                    <Input
                        value={node.title}
                        onChange={(e) => handleUpdate('title', e.target.value)}
                        placeholder="Digite o título..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conteúdo
                    </label>
                    <Textarea
                        value={node.content || ''}
                        onChange={(e) => handleUpdate('content', e.target.value)}
                        placeholder="Digite o conteúdo..."
                        rows={4}
                    />
                </div>

                {node.type === 'message' && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Configurações da Mensagem</h4>
                        <p className="text-sm text-blue-700">
                            Esta mensagem será enviada automaticamente para o usuário.
                        </p>
                    </div>
                )}

                {node.type === 'question' && (
                    <div className="bg-green-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-green-900 mb-2">Configurações da Pergunta</h4>
                        <p className="text-sm text-green-700">
                            O chatbot aguardará a resposta do usuário antes de continuar.
                        </p>
                    </div>
                )}

                {node.type === 'condition' && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-yellow-900 mb-2">Configurações da Condição</h4>
                        <div className="space-y-2">
                            <Input placeholder="Condição (ex: resposta == 'sim')" />
                            <p className="text-sm text-yellow-700">
                                Define o fluxo baseado na resposta do usuário.
                            </p>
                        </div>
                    </div>
                )}

                {node.type === 'action' && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-purple-900 mb-2">Configurações da Ação</h4>
                        <div className="space-y-2">
                            <Select
                                value=""
                                onValueChange={() => { }}
                                options={[
                                    { value: 'save_data', label: 'Salvar Dados' },
                                    { value: 'send_email', label: 'Enviar Email' },
                                    { value: 'transfer_human', label: 'Transferir para Humano' },
                                ]}
                                placeholder="Selecione uma ação"
                            />
                            <p className="text-sm text-purple-700">
                                Executa uma ação específica no sistema.
                            </p>
                        </div>
                    </div>
                )}

                <div className="pt-4 border-t">
                    <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => {
                            // Validate and save
                            onClose();
                        }}
                    >
                        Salvar Alterações
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
