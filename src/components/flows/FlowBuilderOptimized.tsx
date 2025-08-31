'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { FlowPreview } from '@/components/flows/FlowPreview';
import { KeywordManager } from '@/components/flows/KeywordManager';
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

    // Componente para renderizar conteúdo da aba lateral
    const renderSidebarContent = () => {
        switch (state.sidebarTab) {
            case 'subflows':
                return (
                    <div className="space-y-4 p-4">
                        <Button
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3 font-medium text-sm"
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
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Novo Subfluxo
                        </Button>

                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {subflows.map((subflow, index) => (
                                <div
                                    key={subflow.id}
                                    className={`group p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${state.selectedSubflow?.id === subflow.id
                                        ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm ring-1 ring-blue-200'
                                        : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                                        }`}
                                    onClick={() => updateState({ selectedSubflow: subflow, selectedMessage: null })}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${state.selectedSubflow?.id === subflow.id
                                                    ? 'bg-blue-500'
                                                    : 'bg-gray-400 group-hover:bg-gray-500'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <h4 className="text-sm font-semibold text-gray-800 truncate">{subflow.name}</h4>
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                                                    </svg>
                                                    <span>{subflow.keywords?.length || 0} palavras</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    <span>{subflow.messages?.length || 0} msgs</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <Badge
                                                variant={subflow.is_active ? 'success' : 'secondary'}
                                                className={`text-xs px-2 py-1 ${subflow.is_active
                                                    ? 'bg-green-100 text-green-700 border-green-300'
                                                    : 'bg-gray-100 text-gray-600 border-gray-300'
                                                    }`}
                                            >
                                                {subflow.is_active ? '✓' : '⏸'}
                                            </Badge>
                                            <div className={`w-2 h-2 rounded-full ${subflow.is_active ? 'bg-green-400 animate-pulse' : 'bg-gray-300'
                                                }`}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {subflows.length === 0 && (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                    <div className="mb-2">
                                        <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">Nenhum subfluxo criado</p>
                                    <p className="text-xs text-gray-400 mt-1">Clique no botão acima para começar</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'messages':
                if (!state.selectedSubflow) {
                    return (
                        <div className="flex items-center justify-center h-48 p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Selecione um subfluxo</p>
                                <p className="text-xs text-gray-400 mt-1">para visualizar suas mensagens</p>
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="space-y-3 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span>Mensagens</span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 truncate">{state.selectedSubflow.name}</p>
                            </div>
                            <Button
                                size="sm"
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
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
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {state.selectedSubflow.messages?.map((message, index) => (
                                <div
                                    key={message.id}
                                    className={`group p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${state.selectedMessage?.id === message.id
                                        ? 'border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 shadow-sm ring-1 ring-purple-200'
                                        : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                                        }`}
                                    onClick={() => updateState({ selectedMessage: message })}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${state.selectedMessage?.id === message.id
                                                    ? 'bg-purple-500'
                                                    : 'bg-gray-400 group-hover:bg-gray-500'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <Badge
                                                    variant={message.wait_for_file ? 'success' : 'secondary'}
                                                    className="text-xs px-2 py-0.5"
                                                >
                                                    {message.message_type}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-600 truncate bg-gray-50 p-2 rounded">
                                                {message.message_text}
                                            </p>
                                        </div>
                                        <div className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                                            #{message.order_index}
                                        </div>
                                    </div>
                                </div>
                            )) || (
                                    <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                        <p className="text-sm text-gray-500">Nenhuma mensagem ainda</p>
                                    </div>
                                )}
                        </div>
                    </div>
                );

            case 'keywords':
                return (
                    <div className="p-4">
                        <div className="mb-3">
                            <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2 mb-1">
                                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                                </svg>
                                <span>Palavras-chave</span>
                            </h3>
                            <p className="text-xs text-gray-500">Configure ativadores de fluxo</p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-3">
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
            content: state.sidebarTab === 'subflows' ? renderSidebarContent() : null
        },
        {
            id: 'messages',
            label: 'Mensagens',
            content: state.sidebarTab === 'messages' ? renderSidebarContent() : null
        },
        {
            id: 'keywords',
            label: 'Palavras',
            content: state.sidebarTab === 'keywords' ? renderSidebarContent() : null
        }
    ];

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header com estatísticas - Design aprimorado */}
            <div className="bg-white/90 backdrop-blur-sm border-b shadow-sm px-6 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Título e Template */}
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Constructor de Fluxos
                            </h1>
                            <p className="text-gray-500 text-sm flex items-center mt-1">
                                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                Template: {templateId}
                            </p>
                        </div>
                    </div>

                    {/* Estatísticas e Preview Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-3">
                        {/* Estatísticas */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                <Badge variant="secondary" className="bg-white text-blue-700 border-blue-200 text-xs">
                                    {flowStats.totalSubflows}
                                </Badge>
                                <span className="text-blue-700 font-medium text-xs lg:text-sm truncate">Subfluxos</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                <Badge variant="secondary" className="bg-white text-green-700 border-green-200 text-xs">
                                    {flowStats.totalMessages}
                                </Badge>
                                <span className="text-green-700 font-medium text-xs lg:text-sm truncate">Mensagens</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
                                <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                                <Badge variant="secondary" className="bg-white text-purple-700 border-purple-200 text-xs">
                                    {flowStats.totalKeywords}
                                </Badge>
                                <span className="text-purple-700 font-medium text-xs lg:text-sm truncate">Palavras</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                                <Badge variant="secondary" className="bg-white text-orange-700 border-orange-200 text-xs">
                                    {flowStats.waitForFileMessages}
                                </Badge>
                                <span className="text-orange-700 font-medium text-xs lg:text-sm truncate">Arquivos</span>
                            </div>
                        </div>

                        {/* Preview Button */}
                        <Button
                            variant={state.showPreview ? 'secondary' : 'primary'}
                            onClick={() => updateState({ showPreview: !state.showPreview })}
                            className={`transition-all duration-200 flex-shrink-0 ${state.showPreview
                                ? 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {state.showPreview ? (
                                <span className="flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    <span>Editor</span>
                                </span>
                            ) : (
                                <span className="flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span>Preview</span>
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 flex overflow-hidden min-h-0">
                {state.showPreview ? (
                    <FlowPreview
                        subflows={subflows.map(subflow => ({
                            ...subflow,
                            messages: subflow.messages || []
                        }))}
                        onClose={() => updateState({ showPreview: false })}
                    />
                ) : (
                    <div className="flex-1 flex min-h-0">
                        {/* Painel lateral - Compacto e responsivo */}
                        <div className="w-80 lg:w-72 bg-white/95 backdrop-blur-sm border-r border-gray-200/50 shadow-lg flex flex-col min-h-0 flex-shrink-0">
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="p-4 border-b border-gray-100 flex-shrink-0">
                                    <h2 className="text-base font-semibold text-gray-800 flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span>Painel de Controle</span>
                                    </h2>
                                </div>
                                <div className="flex-1 min-h-0">
                                    <Tabs
                                        items={sidebarTabItems}
                                        value={state.sidebarTab}
                                        onValueChange={(value) => updateState({ sidebarTab: value })}
                                        variant="pills"
                                        size="sm"
                                        className="h-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Área principal - Construtor Visual expandido */}
                        <div className="flex-1 flex flex-col bg-gradient-to-br from-white to-gray-50/50 min-h-0">
                            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3 shadow-sm flex-shrink-0">
                                <h3 className="text-base font-semibold text-gray-800 flex items-center space-x-2">
                                    <div className="p-1.5 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-lg">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    </div>
                                    <span>Construtor Visual</span>
                                    <div className="flex-1"></div>
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                        {subflows.length} fluxos ativos
                                    </Badge>
                                </h3>
                            </div>

                            <div className="flex-1 p-6 overflow-auto min-h-0">
                                <div className="max-w-6xl mx-auto">
                                    <div className="grid gap-4">
                                        {subflows.map((subflow, index) => (
                                            <div
                                                key={subflow.id}
                                                className={`group relative p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${state.selectedSubflow?.id === subflow.id
                                                    ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md ring-2 ring-blue-100'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                                                    }`}
                                                onClick={() => updateState({ selectedSubflow: subflow })}
                                            >
                                                {/* Indicador de posição */}
                                                <div className="absolute -left-2 -top-2">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ${state.selectedSubflow?.id === subflow.id
                                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                                        : 'bg-gradient-to-r from-gray-400 to-gray-500 group-hover:from-gray-500 group-hover:to-gray-600'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                </div>

                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                                                            <span className="truncate">{subflow.name}</span>
                                                            {state.selectedSubflow?.id === subflow.id && (
                                                                <svg className="w-4 h-4 text-blue-500 animate-pulse flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </h4>
                                                        <p className="text-gray-600 text-sm mb-3">
                                                            {subflow.description || 'Descrição não fornecida'}
                                                        </p>

                                                        {/* Estatísticas compactas */}
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center space-x-1 text-xs bg-emerald-50 px-2 py-1 rounded-md">
                                                                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                                </svg>
                                                                <span className="text-emerald-700 font-medium">
                                                                    {subflow.messages?.length || 0} msgs
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-1 text-xs bg-amber-50 px-2 py-1 rounded-md">
                                                                <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                                                                </svg>
                                                                <span className="text-amber-700 font-medium">
                                                                    {subflow.keywords?.length || 0} palavras
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                                                        <Badge
                                                            variant={subflow.is_active ? 'success' : 'secondary'}
                                                            className={`text-xs px-2 py-1 ${subflow.is_active
                                                                ? 'bg-green-100 text-green-800 border-green-300'
                                                                : 'bg-gray-100 text-gray-600 border-gray-300'
                                                                }`}
                                                        >
                                                            {subflow.is_active ? '✓ Ativo' : '⏸ Inativo'}
                                                        </Badge>

                                                        <div className={`w-2 h-2 rounded-full ${subflow.is_active ? 'bg-green-400 animate-pulse' : 'bg-gray-300'
                                                            }`}></div>
                                                    </div>
                                                </div>

                                                {/* Linha de conexão */}
                                                {index < subflows.length - 1 && (
                                                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                                                        <div className="w-0.5 h-4 bg-gradient-to-b from-gray-300 to-transparent"></div>
                                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full -mt-0.5 -ml-0.5"></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {subflows.length === 0 && (
                                            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                                                <div className="mb-4">
                                                    <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-3">
                                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-base font-semibold text-gray-800 mb-1">Nenhum subfluxo criado ainda</h3>
                                                    <p className="text-gray-500 text-sm mb-4">Comece criando seu primeiro fluxo de conversação</p>
                                                </div>
                                                <Button
                                                    onClick={() => updateState({ sidebarTab: 'subflows' })}
                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Criar Primeiro Subfluxo
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FlowBuilder;
