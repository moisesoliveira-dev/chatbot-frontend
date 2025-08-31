'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import {
    FlowCanvas,
    SubflowEditor,
    MessageEditor,
    FlowPreview,
    KeywordManager
} from '@/components/flows';
import type { Subflow, FlowMessage } from '@/lib/types';

// Interface extendida para incluir mensagens
interface ExtendedSubflow extends Subflow {
    messages: FlowMessage[];
    keywords?: string[];
}

interface FlowBuilderProps {
    templateId: string;
    subflows: ExtendedSubflow[];
    onSubflowsUpdate: (subflows: ExtendedSubflow[]) => void;
}

interface FlowBuilderState {
    selectedSubflow: ExtendedSubflow | null;
    selectedMessage: FlowMessage | null;
    activeView: string;
    showPreview: boolean;
    sidebarTab: string;
}

export function FlowBuilder({ templateId, subflows, onSubflowsUpdate }: FlowBuilderProps) {
    const [state, setState] = useState<FlowBuilderState>({
        selectedSubflow: null,
        selectedMessage: null,
        activeView: 'builder',
        showPreview: false,
        sidebarTab: 'subflows',
    });

    const updateState = (updates: Partial<FlowBuilderState>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    // Estatísticas do fluxo
    const flowStats = {
        totalSubflows: subflows.length,
        totalMessages: subflows.reduce((acc, subflow) => acc + (subflow.messages?.length || 0), 0),
        totalKeywords: subflows.reduce((acc, subflow) => acc + (subflow.keywords?.length || 0), 0),
        waitForFileMessages: subflows.reduce((acc, subflow) =>
            acc + (subflow.messages?.filter((msg: FlowMessage) => msg.wait_for_file).length || 0), 0
        ),
    };

    const handleSubflowUpdate = (updatedSubflow: ExtendedSubflow) => {
        const updatedSubflows = subflows.map(subflow =>
            subflow.id === updatedSubflow.id ? updatedSubflow : subflow
        );
        onSubflowsUpdate(updatedSubflows);

        if (state.selectedSubflow?.id === updatedSubflow.id) {
            updateState({ selectedSubflow: updatedSubflow });
        }
    };

    const handleSubflowCreate = (newSubflow: ExtendedSubflow) => {
        onSubflowsUpdate([...subflows, newSubflow]);
    };

    const handleSubflowDelete = (subflowId: string) => {
        const updatedSubflows = subflows.filter(subflow => String(subflow.id) !== subflowId);
        onSubflowsUpdate(updatedSubflows);

        if (String(state.selectedSubflow?.id) === subflowId) {
            updateState({ selectedSubflow: null, selectedMessage: null });
        }
    };

    const handleMessageUpdate = (subflowId: string, updatedMessage: FlowMessage) => {
        const subflow = subflows.find(s => String(s.id) === subflowId);
        if (!subflow?.messages) return;

        const updatedMessages = subflow.messages.map((msg: FlowMessage) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
        );

        const updatedSubflow = { ...subflow, messages: updatedMessages };
        handleSubflowUpdate(updatedSubflow);

        if (state.selectedMessage?.id === updatedMessage.id) {
            updateState({ selectedMessage: updatedMessage });
        }
    };

    // Componente para renderizar conteúdo da aba lateral
    const renderSidebarContent = () => {
        switch (state.sidebarTab) {
            case 'subflows':
                return (
                    <div className="space-y-2 p-4">
                        <Button
                            className="w-full"
                            onClick={() => {
                                const newSubflow: ExtendedSubflow = {
                                    id: Date.now(),
                                    name: 'Novo Subfluxo',
                                    description: '',
                                    flow_id: parseInt(templateId) || 1,
                                    parent_subflow_id: undefined,
                                    trigger_keywords: [],
                                    order_index: subflows.length,
                                    is_active: true,
                                    messages_count: 0,
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString(),
                                    keywords: [],
                                    messages: []
                                };
                                handleSubflowCreate(newSubflow);
                                updateState({ selectedSubflow: newSubflow });
                            }}
                        >
                            + Novo Subfluxo
                        </Button>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {subflows.map((subflow) => (
                                <div
                                    key={subflow.id}
                                    className={`p-3 border rounded cursor-pointer transition-colors ${state.selectedSubflow?.id === subflow.id
                                        ? 'ring-2 ring-blue-500 bg-blue-50'
                                        : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => updateState({ selectedSubflow: subflow, selectedMessage: null })}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium truncate">{subflow.name}</h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {subflow.keywords?.length || 0} palavras-chave
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Badge variant={subflow.is_active ? 'success' : 'gray'}>
                                                {subflow.is_active ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'messages':
                if (!state.selectedSubflow) {
                    return (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-sm text-gray-500">Selecione um subfluxo</p>
                        </div>
                    );
                }

                return (
                    <div className="space-y-2 p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Mensagens</h3>
                            <Button
                                size="sm"
                                onClick={() => {
                                    const newMessage: FlowMessage = {
                                        id: Date.now(),
                                        subflow_id: state.selectedSubflow!.id,
                                        message_text: 'Nova mensagem',
                                        message_type: 'text',
                                        order_index: state.selectedSubflow?.messages?.length || 0,
                                        wait_for_response: false,
                                        wait_for_file: false,
                                        expected_file_types: [],
                                        delay_seconds: 0,
                                        is_active: true,
                                        created_at: new Date().toISOString(),
                                        updated_at: new Date().toISOString()
                                    };

                                    const updatedSubflow = {
                                        ...state.selectedSubflow!,
                                        messages: [...(state.selectedSubflow!.messages || []), newMessage]
                                    };

                                    handleSubflowUpdate(updatedSubflow);
                                    updateState({ selectedMessage: newMessage });
                                }}
                            >
                                + Adicionar
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {state.selectedSubflow.messages?.map((message) => (
                                <div
                                    key={message.id}
                                    className={`p-3 border rounded cursor-pointer transition-colors ${state.selectedMessage?.id === message.id
                                        ? 'ring-2 ring-blue-500 bg-blue-50'
                                        : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => updateState({ selectedMessage: message })}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <Badge
                                                variant={message.wait_for_file ? 'success' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {message.message_type}
                                            </Badge>
                                            <p className="text-xs text-gray-600 mt-1 truncate">
                                                {message.message_text}
                                            </p>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            #{message.order_index}
                                        </div>
                                    </div>
                                </div>
                            )) || (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        Nenhuma mensagem neste subfluxo
                                    </p>
                                )}
                        </div>
                    </div>
                );

            case 'keywords':
                return (
                    <div className="p-4">
                        <KeywordManager
                            subflows={subflows}
                            onSubflowUpdate={(id, updates) => {
                                const subflow = subflows.find(s => s.id === id);
                                if (subflow) {
                                    handleSubflowUpdate({ ...subflow, ...updates });
                                }
                            }}
                            onClose={() => { }}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    // Itens para as abas da sidebar
    const sidebarTabItems = [
        {
            id: 'subflows',
            label: 'Subfluxos',
            content: renderSidebarContent()
        },
        {
            id: 'messages',
            label: 'Mensagens',
            content: renderSidebarContent()
        },
        {
            id: 'keywords',
            label: 'Palavras',
            content: renderSidebarContent()
        }
    ];

    // Componente para renderizar conteúdo da aba principal
    const renderMainContent = () => {
        switch (state.activeView) {
            case 'builder':
                // FlowCanvas espera nodes, não subflows - vamos criar um placeholder simples
                return (
                    <div className="p-8 text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Constructor Visual</h3>
                        <p className="text-gray-600 mb-4">Visualização em desenvolvimento</p>
                        <div className="grid gap-4">
                            {subflows.map((subflow) => (
                                <div
                                    key={subflow.id}
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${state.selectedSubflow?.id === subflow.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => updateState({ selectedSubflow: subflow })}
                                >
                                    <h4 className="font-medium">{subflow.name}</h4>
                                    <p className="text-sm text-gray-600">{subflow.description}</p>
                                    <div className="mt-2 flex gap-2">
                                        <Badge variant={subflow.is_active ? 'success' : 'secondary'}>
                                            {subflow.is_active ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                        <Badge variant="secondary">
                                            {subflow.messages.length} mensagens
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'subflow':
                return (
                    <SubflowEditor
                        subflow={state.selectedSubflow}
                        onSubflowUpdate={(id, updates) => {
                            const subflow = subflows.find(s => s.id === id);
                            if (subflow) {
                                handleSubflowUpdate({ ...subflow, ...updates });
                            }
                        }}
                        onSubflowSave={() => { }}
                        onClose={() => updateState({ selectedSubflow: null })}
                    />
                );
            case 'message':
                return (
                    <MessageEditor
                        message={state.selectedMessage}
                        onMessageUpdate={(id, updates) => {
                            if (state.selectedSubflow && state.selectedMessage) {
                                const updatedMessage = { ...state.selectedMessage, ...updates };
                                handleMessageUpdate(String(state.selectedSubflow.id), updatedMessage);
                            }
                        }}
                        onMessageSave={() => { }}
                        onClose={() => updateState({ selectedMessage: null })}
                    />
                );
            default:
                return null;
        }
    };

    // Itens para as abas principais
    const mainTabItems = [
        {
            id: 'builder',
            label: '🎯 Construtor Visual',
            content: renderMainContent()
        },
        {
            id: 'subflow',
            label: '📋 Editor de Subfluxo',
            content: renderMainContent()
        },
        {
            id: 'message',
            label: '💬 Editor de Mensagem',
            content: renderMainContent()
        }
    ];

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header com estatísticas */}
            <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Constructor de Fluxos</h1>
                        <p className="text-gray-600">Template: {templateId}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                                <Badge variant="secondary">{flowStats.totalSubflows}</Badge>
                                <span>Subfluxos</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Badge variant="secondary">{flowStats.totalMessages}</Badge>
                                <span>Mensagens</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Badge variant="secondary">{flowStats.totalKeywords}</Badge>
                                <span>Palavras-chave</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Badge variant="secondary">{flowStats.waitForFileMessages}</Badge>
                                <span>Aguardando arquivos</span>
                            </div>
                        </div>

                        <Button
                            variant={state.showPreview ? 'secondary' : 'primary'}
                            onClick={() => updateState({ showPreview: !state.showPreview })}
                        >
                            {state.showPreview ? '📝 Editor' : '👁️ Preview'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 flex overflow-hidden">
                {state.showPreview ? (
                    <FlowPreview
                        subflows={subflows.map(subflow => ({
                            ...subflow,
                            messages: subflow.messages || []
                        }))}
                        onClose={() => updateState({ showPreview: false })}
                    />
                ) : (
                    <div className="flex-1 flex">
                        {/* Painel lateral */}
                        <div className="w-80 bg-white border-r flex flex-col">
                            <div className="flex-1 flex flex-col">
                                <Tabs
                                    items={sidebarTabItems}
                                    value={state.sidebarTab}
                                    onValueChange={(value) => updateState({ sidebarTab: value })}
                                    variant="pills"
                                    size="sm"
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        {/* Área principal */}
                        <div className="flex-1 flex flex-col">
                            <div className="bg-white border-b px-6 py-3">
                                <Tabs
                                    items={mainTabItems}
                                    value={state.activeView}
                                    onValueChange={(value) => updateState({ activeView: value })}
                                    variant="underline"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
