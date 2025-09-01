'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import {
    FlowCanvas,
    SubflowEditor,
    MessageEditor,
    FlowPreview,
    KeywordManager
} from '@/components/flows';
import { useFlows } from '@/lib/hooks/useFlows';
import type { Flow, Subflow, FlowMessage } from '@/lib/types';
import {
    PlusIcon,
    PlayIcon,
    EyeIcon,
    Cog6ToothIcon,
    DocumentDuplicateIcon,
    TrashIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface FlowNode {
    id: string;
    type: 'message' | 'question' | 'condition' | 'action' | 'wait_file';
    title: string;
    content?: string;
    position: { x: number; y: number };
    connections: string[];
    data?: {
        wait_for_file?: boolean;
        expected_file_types?: string[];
        delay?: number;
        keywords?: string[];
        message_type?: string;
    };
}

interface FlowCanvasNode {
    id: string;
    type: 'message' | 'question' | 'condition' | 'action' | 'wait_file';
    title: string;
    content?: string;
    position: { x: number; y: number };
    connections: string[];
    data?: {
        wait_for_file?: boolean;
        expected_file_types?: string[];
        delay?: number;
        keywords?: string[];
    };
}

interface FlowBuilderAdvancedProps {
    templateId: number;
    flowId?: number;
    initialFlow?: Flow;
    onSave?: (flow: Flow) => void;
    onCancel?: () => void;
    className?: string;
}

interface ExtendedFlow extends Flow {
    subflows?: Subflow[];
}

export const FlowBuilderAdvanced: React.FC<FlowBuilderAdvancedProps> = ({
    templateId,
    flowId,
    initialFlow,
    onSave,
    onCancel,
    className = ''
}) => {
    // Estado principal
    const [activePanel, setActivePanel] = useState<'canvas' | 'properties' | 'preview'>('canvas');
    const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
    const [nodes, setNodes] = useState<FlowNode[]>([]);
    const [flowData, setFlowData] = useState<ExtendedFlow>(initialFlow ? { ...initialFlow, subflows: [] } : {
        id: 0,
        template_id: templateId,
        name: 'Novo Fluxo',
        description: '',
        is_active: true,
        is_default: false,
        order_index: 0,
        subflows_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subflows: []
    });

    // Estados de UI
    const [showPreview, setShowPreview] = useState(false);
    const [showKeywordManager, setShowKeywordManager] = useState(false);
    const [isUnsaved, setIsUnsaved] = useState(false);

    // Hook para operações de fluxo
    const {
        createFlow,
        updateFlow,
        isLoading,
        error
    } = useFlows(templateId);

    // Sidebar tabs configuration
    const sidebarTabs = useMemo(() => [
        {
            id: 'elements',
            label: 'Elementos',
            content: (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Adicionar Elementos</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { type: 'message', icon: '💬', label: 'Mensagem' },
                                { type: 'question', icon: '❓', label: 'Pergunta' },
                                { type: 'condition', icon: '🔀', label: 'Condição' },
                                { type: 'action', icon: '⚡', label: 'Ação' },
                                { type: 'wait_file', icon: '📁', label: 'Aguardar Arquivo' }
                            ].map(({ type, icon, label }) => (
                                <Button
                                    key={type}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddNodeByType(type as FlowNode['type'])}
                                    className="flex flex-col items-center p-3 h-auto"
                                >
                                    <span className="text-lg mb-1">{icon}</span>
                                    <span className="text-xs">{label}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Estatísticas</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total de elementos:</span>
                                <Badge variant="secondary">{nodes.length}</Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Mensagens:</span>
                                <Badge variant="info">{nodes.filter(n => n.type === 'message').length}</Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Aguardando arquivos:</span>
                                <Badge variant="warning">{nodes.filter(n => n.type === 'wait_file').length}</Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Conexões:</span>
                                <Badge variant="secondary">
                                    {nodes.reduce((acc, node) => acc + node.connections.length, 0)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'subflows',
            label: 'Subfluxos',
            content: (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900">Subfluxos</h3>
                        <Button size="sm" onClick={() => handleAddSubflow()}>
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Novo
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {flowData.subflows?.map((subflow: Subflow, index: number) => (
                            <div
                                key={subflow.id || index}
                                className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer"
                                onClick={() => handleSelectSubflow(subflow)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{subflow.name}</p>
                                        <p className="text-xs text-gray-500">
                                            Ordem: {subflow.order_index} • Ativo: {subflow.is_active ? 'Sim' : 'Não'}
                                        </p>
                                    </div>
                                    <Badge variant={subflow.is_active ? 'success' : 'secondary'} size="sm">
                                        {subflow.is_active ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </div>

                                {subflow.trigger_keywords && subflow.trigger_keywords.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 mb-1">Palavras-chave:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {subflow.trigger_keywords.slice(0, 3).map((keyword: string, idx: number) => (
                                                <Badge key={idx} variant="secondary" size="sm">
                                                    {keyword}
                                                </Badge>
                                            ))}
                                            {subflow.trigger_keywords.length > 3 && (
                                                <Badge variant="secondary" size="sm">
                                                    +{subflow.trigger_keywords.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {(!flowData.subflows || flowData.subflows.length === 0) && (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <span className="text-gray-400 text-xl">🔀</span>
                                </div>
                                <p className="text-sm text-gray-500">Nenhum subfluxo criado</p>
                                <Button size="sm" className="mt-2" onClick={() => handleAddSubflow()}>
                                    Criar primeiro subfluxo
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            id: 'tools',
            label: 'Ferramentas',
            content: (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Ações Rápidas</h3>
                        <div className="space-y-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowPreview(true)}
                                className="w-full justify-start"
                            >
                                <EyeIcon className="h-4 w-4 mr-2" />
                                Visualizar Preview
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowKeywordManager(true)}
                                className="w-full justify-start"
                            >
                                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                                Gerenciar Palavras-chave
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleValidateFlow}
                                className="w-full justify-start"
                            >
                                <CheckCircleIcon className="h-4 w-4 mr-2" />
                                Validar Fluxo
                            </Button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Configurações do Fluxo</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Nome do Fluxo
                                </label>
                                <Input
                                    size="sm"
                                    value={flowData.name}
                                    onChange={(e) => handleFlowUpdate({ name: e.target.value })}
                                    placeholder="Nome do fluxo"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Descrição
                                </label>
                                <Textarea
                                    value={flowData.description || ''}
                                    onChange={(e) => handleFlowUpdate({ description: e.target.value })}
                                    placeholder="Descrição do fluxo"
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-gray-700">
                                    Fluxo Ativo
                                </label>
                                <Switch
                                    checked={flowData.is_active}
                                    onCheckedChange={(checked) => handleFlowUpdate({ is_active: checked })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ], [nodes, flowData]);

    // Handlers
    const handleAddNodeByType = useCallback((type: FlowNode['type']) => {
        const newNode: FlowNode = {
            id: `node_${Date.now()}`,
            type,
            title: `Nova ${type === 'message' ? 'Mensagem' : type === 'question' ? 'Pergunta' : type === 'condition' ? 'Condição' : type === 'action' ? 'Ação' : 'Aguardar Arquivo'}`,
            content: '',
            position: { x: 100 + nodes.length * 50, y: 100 + nodes.length * 50 },
            connections: [],
            data: type === 'wait_file' ? {
                wait_for_file: true,
                expected_file_types: []
            } : {}
        };

        setNodes(prev => [...prev, newNode]);
        setSelectedNode(newNode);
        setActivePanel('properties');
        setIsUnsaved(true);
    }, [nodes.length]);

    const handleAddNode = useCallback((node: FlowCanvasNode) => {
        const flowNode: FlowNode = {
            ...node,
            content: node.content || ''
        };
        setNodes(prev => [...prev, flowNode]);
        setSelectedNode(flowNode);
        setActivePanel('properties');
        setIsUnsaved(true);
    }, []);

    const handleNodeSelect = useCallback((id: string) => {
        const node = nodes.find(n => n.id === id);
        if (node) {
            setSelectedNode(node);
            setActivePanel('properties');
        }
    }, [nodes]);

    const handleNodeUpdate = useCallback((id: string, updates: Partial<FlowNode>) => {
        setNodes(prev => prev.map(node =>
            node.id === id ? { ...node, ...updates } : node
        ));

        if (selectedNode?.id === id) {
            setSelectedNode(prev => prev ? { ...prev, ...updates } : null);
        }

        setIsUnsaved(true);
    }, [selectedNode]);

    const handleNodeDelete = useCallback((id: string) => {
        setNodes(prev => prev.filter(node => node.id !== id));

        if (selectedNode?.id === id) {
            setSelectedNode(null);
        }

        setIsUnsaved(true);
    }, [selectedNode]);

    const handleFlowUpdate = useCallback((updates: Partial<Flow>) => {
        setFlowData(prev => ({ ...prev, ...updates }));
        setIsUnsaved(true);
    }, []);

    const handleAddSubflow = useCallback(() => {
        const newSubflow: Subflow = {
            id: Date.now(),
            flow_id: flowData.id || 0,
            name: `Subfluxo ${(flowData.subflows?.length || 0) + 1}`,
            description: '',
            order_index: (flowData.subflows?.length || 0) + 1,
            is_active: true,
            trigger_keywords: [],
            messages_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        setFlowData(prev => ({
            ...prev,
            subflows: [...(prev.subflows || []), newSubflow]
        }));
        setIsUnsaved(true);
    }, [flowData.subflows, flowData.id]);

    const handleSelectSubflow = useCallback((subflow: Subflow) => {
        // TODO: Implementar seleção de subfluxo
        console.log('Subfluxo selecionado:', subflow);
    }, []);

    const handleValidateFlow = useCallback(() => {
        const issues = [];

        if (!flowData.name.trim()) {
            issues.push('Nome do fluxo é obrigatório');
        }

        if (nodes.length === 0) {
            issues.push('Fluxo deve ter pelo menos um elemento');
        }

        const orphanNodes = nodes.filter(node =>
            node.connections.length === 0 &&
            !nodes.some(n => n.connections.includes(node.id))
        );

        if (orphanNodes.length > 1) {
            issues.push(`${orphanNodes.length} elementos desconectados encontrados`);
        }

        if (issues.length === 0) {
            alert('✅ Fluxo validado com sucesso!');
        } else {
            alert('⚠️ Problemas encontrados:\n' + issues.join('\n'));
        }
    }, [flowData, nodes]);

    const handleSaveFlow = useCallback(async () => {
        try {
            const flowToSave = {
                ...flowData,
                // Converter nodes para o formato esperado pelo backend
                // TODO: Implementar conversão adequada
            };

            if (flowId) {
                await updateFlow(flowId, flowToSave);
            } else {
                await createFlow(flowToSave);
            }

            setIsUnsaved(false);
            onSave?.(flowToSave);
        } catch (error) {
            console.error('Erro ao salvar fluxo:', error);
        }
    }, [flowData, flowId, updateFlow, createFlow, onSave]);

    return (
        <div className={`h-screen flex flex-col bg-gray-50 ${className}`}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">
                                {flowId ? 'Editar Fluxo' : 'Criar Novo Fluxo'}
                            </h1>
                            <p className="text-sm text-gray-600">
                                Template ID: {templateId} {isUnsaved && '• Alterações não salvas'}
                            </p>
                        </div>

                        {isUnsaved && (
                            <Badge variant="warning" size="sm">
                                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                Não salvo
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowPreview(true)}
                        >
                            <PlayIcon className="h-4 w-4 mr-2" />
                            Preview
                        </Button>

                        {onCancel && (
                            <Button
                                variant="outline"
                                onClick={onCancel}
                            >
                                Cancelar
                            </Button>
                        )}

                        <Button
                            onClick={handleSaveFlow}
                            disabled={isLoading || !isUnsaved}
                        >
                            {isLoading ? (
                                <Loading size="sm" />
                            ) : (
                                <>
                                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                                    Salvar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    <Tabs
                        items={sidebarTabs}
                        defaultValue="elements"
                        className="flex-1"
                        orientation="vertical"
                    />
                </div>

                {/* Canvas Area */}
                <div className="flex-1 flex flex-col">
                    {/* Canvas Header */}
                    <div className="bg-white border-b border-gray-200 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <h2 className="font-medium text-gray-900">Canvas Visual</h2>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        size="sm"
                                        variant={activePanel === 'canvas' ? 'primary' : 'outline'}
                                        onClick={() => setActivePanel('canvas')}
                                    >
                                        Canvas
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={activePanel === 'properties' ? 'primary' : 'outline'}
                                        onClick={() => setActivePanel('properties')}
                                        disabled={!selectedNode}
                                    >
                                        Propriedades
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={activePanel === 'preview' ? 'primary' : 'outline'}
                                        onClick={() => setActivePanel('preview')}
                                    >
                                        Preview
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Badge variant="secondary" size="sm">
                                    {nodes.length} elementos
                                </Badge>
                                {selectedNode && (
                                    <Badge variant="info" size="sm">
                                        {selectedNode.title}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Canvas Content */}
                    <div className="flex-1 overflow-hidden">
                        {activePanel === 'canvas' && (
                            <FlowCanvas
                                nodes={nodes}
                                onNodeAdd={handleAddNode}
                                onNodeUpdate={handleNodeUpdate}
                                onNodeDelete={handleNodeDelete}
                                onNodeSelect={handleNodeSelect}
                                selectedNodeId={selectedNode?.id}
                                onConnectionCreate={(fromId, toId) => {
                                    handleNodeUpdate(fromId, {
                                        connections: [...(nodes.find(n => n.id === fromId)?.connections || []), toId]
                                    });
                                }}
                                onConnectionDelete={(fromId, toId) => {
                                    const node = nodes.find(n => n.id === fromId);
                                    if (node) {
                                        handleNodeUpdate(fromId, {
                                            connections: node.connections.filter(id => id !== toId)
                                        });
                                    }
                                }}
                            />
                        )}

                        {activePanel === 'properties' && selectedNode && (
                            <div className="p-6 overflow-y-auto">
                                <Card>
                                    <CardHeader>
                                        <h3 className="text-lg font-semibold">
                                            Propriedades - {selectedNode.title}
                                        </h3>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Título</label>
                                                <Input
                                                    value={selectedNode.title}
                                                    onChange={(e) => handleNodeUpdate(selectedNode.id, { title: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Conteúdo</label>
                                                <Textarea
                                                    value={selectedNode.content || ''}
                                                    onChange={(e) => handleNodeUpdate(selectedNode.id, { content: e.target.value })}
                                                    rows={4}
                                                />
                                            </div>

                                            {selectedNode.type === 'wait_file' && (
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Tipos de arquivo esperados</label>
                                                    <Input
                                                        placeholder="pdf,doc,jpg (separados por vírgula)"
                                                        value={selectedNode.data?.expected_file_types?.join(',') || ''}
                                                        onChange={(e) => {
                                                            const types = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                                                            handleNodeUpdate(selectedNode.id, {
                                                                data: { ...selectedNode.data, expected_file_types: types }
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {selectedNode.type === 'message' && (
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Delay (segundos)</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={selectedNode.data?.delay || 0}
                                                        onChange={(e) => handleNodeUpdate(selectedNode.id, {
                                                            data: { ...selectedNode.data, delay: Number(e.target.value) }
                                                        })}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activePanel === 'preview' && (
                            <div className="p-6 overflow-y-auto">
                                <FlowPreview
                                    subflows={(flowData.subflows || []).map(subflow => ({ ...subflow, messages: [] }))}
                                    onClose={() => setActivePanel('canvas')}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showPreview && (
                <Modal
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                    size="xl"
                >
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Preview do Fluxo</h3>
                        <FlowPreview
                            subflows={(flowData.subflows || []).map(subflow => ({ ...subflow, messages: [] }))}
                            onClose={() => setShowPreview(false)}
                        />
                    </div>
                </Modal>
            )}

            {showKeywordManager && (
                <Modal
                    isOpen={showKeywordManager}
                    onClose={() => setShowKeywordManager(false)}
                    size="lg"
                >
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Gerenciador de Palavras-chave</h3>
                        <KeywordManager
                            subflows={flowData.subflows || []}
                            onSubflowUpdate={(id: number, updates: Partial<Subflow>) => {
                                const updatedSubflows = (flowData.subflows || []).map(subflow =>
                                    subflow.id === id ? { ...subflow, ...updates } : subflow
                                );
                                setFlowData(prev => ({ ...prev, subflows: updatedSubflows }));
                                setIsUnsaved(true);
                            }}
                            onClose={() => setShowKeywordManager(false)}
                        />
                    </div>
                </Modal>
            )}

            {error && (
                <Alert variant="error" className="absolute bottom-4 right-4 w-96">
                    <p>Erro: {error}</p>
                </Alert>
            )}
        </div>
    );
};
