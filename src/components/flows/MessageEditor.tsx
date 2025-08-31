'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { FlowMessage, MessageType } from '@/lib/types';

interface MessageEditorProps {
    message: FlowMessage | null;
    onMessageUpdate: (id: number, updates: Partial<FlowMessage>) => void;
    onMessageSave: () => void;
    onClose: () => void;
    isNew?: boolean;
}

const MESSAGE_TYPE_OPTIONS = [
    { value: 'text', label: '💬 Mensagem de Texto' },
    { value: 'image', label: '🖼️ Imagem' },
    { value: 'document', label: '📄 Documento' },
];

const FILE_TYPE_PRESETS = {
    documents: ['pdf', 'doc', 'docx', 'txt'],
    images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    spreadsheets: ['xls', 'xlsx', 'csv'],
    presentations: ['ppt', 'pptx'],
    archives: ['zip', 'rar', '7z'],
    all: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'zip']
};

export const MessageEditor: React.FC<MessageEditorProps> = ({
    message,
    onMessageUpdate,
    onMessageSave,
    onClose,
    isNew = false,
}) => {
    const [localMessage, setLocalMessage] = useState<FlowMessage | null>(null);
    const [customFileType, setCustomFileType] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    useEffect(() => {
        setLocalMessage(message);
        setValidationErrors([]);
    }, [message]);

    if (!localMessage) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-500">Selecione uma mensagem para editar</p>
                </CardContent>
            </Card>
        );
    }

    const handleFieldUpdate = (field: keyof FlowMessage, value: any) => {
        const updatedMessage = { ...localMessage, [field]: value };
        setLocalMessage(updatedMessage);
        onMessageUpdate(localMessage.id, { [field]: value });
    };

    const handleFileTypeAdd = (fileType: string) => {
        if (fileType && !localMessage.expected_file_types.includes(fileType.toLowerCase())) {
            const updatedTypes = [...localMessage.expected_file_types, fileType.toLowerCase()];
            handleFieldUpdate('expected_file_types', updatedTypes);
        }
    };

    const handleFileTypeRemove = (fileType: string) => {
        const updatedTypes = localMessage.expected_file_types.filter(type => type !== fileType);
        handleFieldUpdate('expected_file_types', updatedTypes);
    };

    const handlePresetAdd = (preset: keyof typeof FILE_TYPE_PRESETS) => {
        const presetTypes = FILE_TYPE_PRESETS[preset];
        const currentTypes = localMessage.expected_file_types;
        const newTypes = [...new Set([...currentTypes, ...presetTypes])];
        handleFieldUpdate('expected_file_types', newTypes);
    };

    const addCustomFileType = () => {
        if (customFileType.trim()) {
            handleFileTypeAdd(customFileType.trim());
            setCustomFileType('');
        }
    };

    const validateMessage = (): boolean => {
        const errors: string[] = [];

        if (!localMessage.message_text.trim()) {
            errors.push('Conteúdo da mensagem é obrigatório');
        }

        if (localMessage.order_index < 1) {
            errors.push('Ordem deve ser maior que zero');
        }

        if (localMessage.wait_for_file && localMessage.expected_file_types.length === 0) {
            errors.push('Quando "Aguardar arquivo" está ativo, pelo menos um tipo de arquivo deve ser especificado');
        }

        if (localMessage.delay_seconds < 0) {
            errors.push('Delay não pode ser negativo');
        }

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleSave = () => {
        if (validateMessage()) {
            onMessageSave();
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {isNew ? 'Nova Mensagem' : `Editando Mensagem #${localMessage.order_index}`}
                        </h3>
                        <div className="flex items-center space-x-2">
                            <Badge variant={localMessage.is_active ? 'success' : 'gray'}>
                                {localMessage.is_active ? 'Ativa' : 'Inativa'}
                            </Badge>
                            {localMessage.wait_for_file && (
                                <Badge variant="warning">
                                    📁 Aguarda Arquivo
                                </Badge>
                            )}
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

                    {/* Basic Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Mensagem
                            </label>
                            <Select
                                value={localMessage.message_type}
                                onValueChange={(value) => handleFieldUpdate('message_type', value as MessageType)}
                                options={MESSAGE_TYPE_OPTIONS}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ordem na Sequência *
                            </label>
                            <Input
                                type="number"
                                value={localMessage.order_index}
                                onChange={(e) => handleFieldUpdate('order_index', parseInt(e.target.value) || 1)}
                                min="1"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Delay (segundos)
                            </label>
                            <Input
                                type="number"
                                value={localMessage.delay_seconds}
                                onChange={(e) => handleFieldUpdate('delay_seconds', parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Message Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Conteúdo da Mensagem *
                        </label>
                        <Textarea
                            value={localMessage.message_text}
                            onChange={(e) => handleFieldUpdate('message_text', e.target.value)}
                            placeholder="Digite o conteúdo da mensagem..."
                            rows={4}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {localMessage.message_text.length} caracteres
                        </p>
                    </div>

                    {/* Control Switches */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <Switch
                                checked={localMessage.is_active}
                                onCheckedChange={(checked) => handleFieldUpdate('is_active', checked)}
                            />
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Mensagem ativa
                                </label>
                                <p className="text-xs text-gray-500">
                                    Mensagem será enviada no fluxo
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <Switch
                                checked={localMessage.wait_for_response}
                                onCheckedChange={(checked) => handleFieldUpdate('wait_for_response', checked)}
                            />
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Aguardar resposta
                                </label>
                                <p className="text-xs text-gray-500">
                                    Bot aguardará resposta do usuário
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Wait for File Section - FEATURE PRINCIPAL */}
                    <Card className="bg-orange-50 border-orange-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <Switch
                                        checked={localMessage.wait_for_file}
                                        onCheckedChange={(checked) => handleFieldUpdate('wait_for_file', checked)}
                                    />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 flex items-center">
                                            📁 Aguardar Arquivo
                                            <Badge variant="warning" className="ml-2 text-xs">
                                                FUNCIONALIDADE PRINCIPAL
                                            </Badge>
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Bot aguardará o usuário enviar um arquivo antes de continuar
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {localMessage.wait_for_file && (
                                <div className="space-y-4 bg-white rounded-lg p-4 border">
                                    <h5 className="font-medium text-gray-900">
                                        Tipos de arquivo aceitos ({localMessage.expected_file_types.length})
                                    </h5>

                                    {/* Preset Buttons */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2">
                                            Presets rápidos:
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePresetAdd('documents')}
                                            >
                                                📄 Documentos
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePresetAdd('images')}
                                            >
                                                🖼️ Imagens
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePresetAdd('spreadsheets')}
                                            >
                                                📊 Planilhas
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePresetAdd('presentations')}
                                            >
                                                🎯 Apresentações
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePresetAdd('archives')}
                                            >
                                                📦 Compactados
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Custom File Type */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2">
                                            Adicionar tipo personalizado:
                                        </label>
                                        <div className="flex space-x-2">
                                            <Input
                                                value={customFileType}
                                                onChange={(e) => setCustomFileType(e.target.value)}
                                                placeholder="Ex: mp3, xml, json..."
                                                className="flex-1 text-sm"
                                                onKeyPress={(e) => e.key === 'Enter' && addCustomFileType()}
                                            />
                                            <Button onClick={addCustomFileType} variant="primary" size="sm">
                                                Adicionar
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Current File Types */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2">
                                            Tipos configurados:
                                        </label>
                                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded border">
                                            {localMessage.expected_file_types.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic">
                                                    Nenhum tipo de arquivo configurado
                                                </p>
                                            ) : (
                                                localMessage.expected_file_types.map((fileType) => (
                                                    <div
                                                        key={fileType}
                                                        className="inline-flex items-center space-x-1 bg-orange-100 border border-orange-300 text-orange-800 px-2 py-1 rounded text-xs"
                                                    >
                                                        <span>.{fileType}</span>
                                                        <button
                                                            onClick={() => handleFileTypeRemove(fileType)}
                                                            className="text-red-500 hover:text-red-700 ml-1"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* File Settings Info */}
                                    <Alert variant="info">
                                        <div className="text-sm">
                                            <p className="font-medium mb-1">ℹ️ Como funciona:</p>
                                            <ul className="list-disc list-inside space-y-1 text-xs">
                                                <li>O bot pausará o fluxo nesta mensagem</li>
                                                <li>Aguardará o usuário enviar um arquivo</li>
                                                <li>Validará se o arquivo é de um dos tipos permitidos</li>
                                                <li>Somente depois continuará para a próxima mensagem</li>
                                            </ul>
                                        </div>
                                    </Alert>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                👁️ Preview da Mensagem
                            </h4>
                            <div className="bg-white rounded-lg p-3 border">
                                <div className="flex items-start space-x-2">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                                        🤖
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-800">
                                            {localMessage.message_text || '<Conteúdo da mensagem>'}
                                        </p>
                                        {localMessage.wait_for_file && (
                                            <div className="mt-2 p-2 bg-orange-100 rounded border-l-4 border-orange-400">
                                                <p className="text-xs text-orange-800">
                                                    📁 Aguardando arquivo ({localMessage.expected_file_types.join(', ')})...
                                                </p>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2">
                                            Ordem: #{localMessage.order_index} •
                                            Delay: {localMessage.delay_seconds}s •
                                            Tipo: {MESSAGE_TYPE_OPTIONS.find(opt => opt.value === localMessage.message_type)?.label}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} variant="primary">
                            {isNew ? 'Criar Mensagem' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
