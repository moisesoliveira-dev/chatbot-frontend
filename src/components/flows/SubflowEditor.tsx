'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Alert } from '@/components/ui/Alert';
import { Subflow, FlowMessage } from '@/lib/types';

interface ExtendedSubflow extends Subflow {
    messages: FlowMessage[];
}

interface SubflowEditorProps {
    subflow: ExtendedSubflow | null;
    onSubflowUpdate: (id: number, updates: Partial<ExtendedSubflow>) => void;
    onSubflowSave: () => void;
    onClose: () => void;
    isNew?: boolean;
}

export const SubflowEditor: React.FC<SubflowEditorProps> = ({
    subflow,
    onSubflowUpdate,
    onSubflowSave,
    onClose,
    isNew = false,
}) => {
    const [localSubflow, setLocalSubflow] = useState<ExtendedSubflow | null>(null);
    const [newKeyword, setNewKeyword] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    useEffect(() => {
        setLocalSubflow(subflow);
        setValidationErrors([]);
    }, [subflow]);

    if (!localSubflow) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">Selecione um subfluxo para editar</p>
                </CardContent>
            </Card>
        );
    }

    const handleFieldUpdate = (field: keyof ExtendedSubflow, value: any) => {
        const updatedSubflow = { ...localSubflow, [field]: value };
        setLocalSubflow(updatedSubflow);
        onSubflowUpdate(localSubflow.id, { [field]: value });
    };

    const handleKeywordAdd = () => {
        if (newKeyword.trim() && !localSubflow.trigger_keywords.includes(newKeyword.trim().toLowerCase())) {
            const updatedKeywords = [...localSubflow.trigger_keywords, newKeyword.trim().toLowerCase()];
            handleFieldUpdate('trigger_keywords', updatedKeywords);
            setNewKeyword('');
        }
    };

    const handleKeywordRemove = (keyword: string) => {
        const updatedKeywords = localSubflow.trigger_keywords.filter(k => k !== keyword);
        handleFieldUpdate('trigger_keywords', updatedKeywords);
    };

    const validateSubflow = (): boolean => {
        const errors: string[] = [];

        if (!localSubflow.name.trim()) {
            errors.push('Nome do subfluxo é obrigatório');
        }

        if (localSubflow.trigger_keywords.length === 0) {
            errors.push('Pelo menos uma palavra-chave é necessária');
        }

        if (localSubflow.messages.length === 0) {
            errors.push('Pelo menos uma mensagem deve ser adicionada');
        }

        // Validate order uniqueness
        const orders = localSubflow.messages.map((m: FlowMessage) => m.order_index);
        const duplicateOrders = orders.filter((order: number, index: number) => orders.indexOf(order) !== index);
        if (duplicateOrders.length > 0) {
            errors.push('Ordens das mensagens devem ser únicas');
        }

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleSave = () => {
        if (validateSubflow()) {
            onSubflowSave();
        }
    };

    const addMessage = () => {
        const newMessage: FlowMessage = {
            id: Date.now(),
            subflow_id: localSubflow.id,
            order_index: Math.max(...localSubflow.messages.map((m: FlowMessage) => m.order_index), 0) + 1,
            message_type: 'text',
            message_text: '',
            wait_for_file: false,
            wait_for_response: false,
            delay_seconds: 0,
            expected_file_types: [],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const updatedMessages = [...localSubflow.messages, newMessage];
        handleFieldUpdate('messages', updatedMessages);
    };

    const updateMessage = (messageId: number, updates: Partial<FlowMessage>) => {
        const updatedMessages = localSubflow.messages.map((msg: FlowMessage) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
        );
        handleFieldUpdate('messages', updatedMessages);
    };

    const removeMessage = (messageId: number) => {
        const updatedMessages = localSubflow.messages.filter((msg: FlowMessage) => msg.id !== messageId);
        handleFieldUpdate('messages', updatedMessages);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {isNew ? 'Novo Subfluxo' : `Editando: ${localSubflow.name}`}
                        </h3>
                        <div className="flex items-center space-x-2">
                            <Badge variant={localSubflow.is_active ? 'success' : 'gray'}>
                                {localSubflow.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={onClose}>
                                Fechar
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                        <Alert variant="error">
                            <div>
                                <p className="font-medium mb-2">Erros de validação:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    {validationErrors.map((error, index) => (
                                        <li key={index} className="text-sm">{error}</li>
                                    ))}
                                </ul>
                            </div>
                        </Alert>
                    )}

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome do Subfluxo *
                            </label>
                            <Input
                                value={localSubflow.name}
                                onChange={(e) => handleFieldUpdate('name', e.target.value)}
                                placeholder="Ex: Suporte Técnico"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ordem
                            </label>
                            <Input
                                type="number"
                                value={localSubflow.order_index}
                                onChange={(e) => handleFieldUpdate('order_index', parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição
                        </label>
                        <Textarea
                            value={localSubflow.description || ''}
                            onChange={(e) => handleFieldUpdate('description', e.target.value)}
                            placeholder="Descrição opcional do subfluxo..."
                            rows={3}
                            className="w-full"
                        />
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center space-x-3">
                        <Switch
                            checked={localSubflow.is_active}
                            onCheckedChange={(checked) => handleFieldUpdate('is_active', checked)}
                        />
                        <label className="text-sm font-medium text-gray-700">
                            Subfluxo ativo
                        </label>
                    </div>

                    {/* Keywords */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Palavras-chave de gatilho *
                        </label>

                        <div className="flex space-x-2 mb-3">
                            <Input
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                placeholder="Digite uma palavra-chave..."
                                onKeyPress={(e) => e.key === 'Enter' && handleKeywordAdd()}
                                className="flex-1"
                            />
                            <Button onClick={handleKeywordAdd} variant="primary" size="sm">
                                Adicionar
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {localSubflow.trigger_keywords.map((keyword) => (
                                <Badge
                                    key={keyword}
                                    variant="gray"
                                    className="flex items-center space-x-1 px-2 py-1"
                                >
                                    <span>{keyword}</span>
                                    <button
                                        onClick={() => handleKeywordRemove(keyword)}
                                        className="ml-1 text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                </Badge>
                            ))}
                            {localSubflow.trigger_keywords.length === 0 && (
                                <p className="text-sm text-gray-500 italic">
                                    Nenhuma palavra-chave adicionada
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Mensagens do Fluxo ({localSubflow.messages.length})
                            </label>
                            <Button onClick={addMessage} variant="primary" size="sm">
                                + Adicionar Mensagem
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {localSubflow.messages
                                .sort((a, b) => a.order_index - b.order_index)
                                .map((message) => (
                                    <Card key={message.id} className="bg-gray-50">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant="info" className="text-xs">
                                                        #{message.order_index}
                                                    </Badge>
                                                    <Badge variant={message.message_type === 'text' ? 'primary' : 'warning'}>
                                                        {message.message_type === 'text' ? '💬 Texto' : '📁 Arquivo'}
                                                    </Badge>
                                                    {message.wait_for_file && (
                                                        <Badge variant="success" className="text-xs">
                                                            ⏳ Aguarda arquivo
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => removeMessage(message.id)}
                                                >
                                                    Remover
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div className="md:col-span-2">
                                                    <Textarea
                                                        value={message.message_text}
                                                        onChange={(e) => updateMessage(message.id, { message_text: e.target.value })}
                                                        placeholder="Conteúdo da mensagem..."
                                                        rows={2}
                                                        className="w-full text-sm"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Input
                                                        type="number"
                                                        value={message.order_index}
                                                        onChange={(e) => updateMessage(message.id, { order_index: parseInt(e.target.value) || 0 })}
                                                        placeholder="Ordem"
                                                        min="1"
                                                        className="w-full text-sm"
                                                    />

                                                    <Input
                                                        type="number"
                                                        value={message.delay_seconds}
                                                        onChange={(e) => updateMessage(message.id, { delay_seconds: parseInt(e.target.value) || 0 })}
                                                        placeholder="Delay (segundos)"
                                                        min="0"
                                                        className="w-full text-sm"
                                                    />

                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            checked={message.wait_for_file}
                                                            onCheckedChange={(checked) => updateMessage(message.id, { wait_for_file: checked })}
                                                        />
                                                        <span className="text-xs text-gray-600">Aguardar arquivo</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {message.wait_for_file && (
                                                <div className="mt-3 p-3 bg-orange-50 rounded border">
                                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                                        Tipos de arquivo esperados:
                                                    </label>
                                                    <div className="flex flex-wrap gap-1">
                                                        {['pdf', 'doc', 'docx', 'jpg', 'png', 'txt'].map(type => (
                                                            <button
                                                                key={type}
                                                                className={`px-2 py-1 text-xs rounded border ${(message.expected_file_types || []).includes(type)
                                                                        ? 'bg-orange-200 border-orange-300 text-orange-800'
                                                                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                                                    }`}
                                                                onClick={() => {
                                                                    const currentTypes = message.expected_file_types || [];
                                                                    const newTypes = currentTypes.includes(type)
                                                                        ? currentTypes.filter(t => t !== type)
                                                                        : [...currentTypes, type];
                                                                    updateMessage(message.id, { expected_file_types: newTypes });
                                                                }}
                                                            >
                                                                {(message.expected_file_types || []).includes(type) ? '✓ ' : ''}.{type}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}

                            {localSubflow.messages.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p>Nenhuma mensagem adicionada ainda</p>
                                    <Button onClick={addMessage} variant="primary" size="sm" className="mt-2">
                                        Adicionar primeira mensagem
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Save Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} variant="primary">
                            {isNew ? 'Criar Subfluxo' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};