'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { FlowBuilder, FlowBuilderAdvanced } from '@/components/flows';
import { NodeEditor } from '@/components/flows/NodeEditor';

interface FlowNode {
    id: string;
    type: 'message' | 'question' | 'condition' | 'action';
    title: string;
    content?: string;
    position: { x: number; y: number };
    connections?: string[];
}

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    nodes: FlowNode[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    usageCount: number;
}

const mockTemplates: Template[] = [
    {
        id: '1',
        name: 'Atendimento ao Cliente',
        description: 'Fluxo básico para atendimento inicial',
        category: 'Suporte',
        nodes: [
            {
                id: '1',
                type: 'message',
                title: 'Saudação',
                content: 'Olá! Bem-vindo ao nosso atendimento. Como posso ajudá-lo hoje?',
                position: { x: 100, y: 100 }
            },
            {
                id: '2',
                type: 'question',
                title: 'Tipo de Problema',
                content: 'Qual é o tipo do seu problema?\n1. Técnico\n2. Comercial\n3. Outro',
                position: { x: 300, y: 100 }
            }
        ],
        isActive: true,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15'),
        usageCount: 142
    },
    {
        id: '2',
        name: 'Vendas Online',
        description: 'Processo de vendas e informações de produtos',
        category: 'Vendas',
        nodes: [
            {
                id: '3',
                type: 'message',
                title: 'Boas-vindas Vendas',
                content: 'Olá! Interessado em nossos produtos? Posso ajudá-lo a encontrar o que procura!',
                position: { x: 100, y: 100 }
            }
        ],
        isActive: true,
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-14'),
        usageCount: 87
    },
    {
        id: '3',
        name: 'Suporte Técnico',
        description: 'Fluxo especializado em problemas técnicos',
        category: 'Suporte',
        nodes: [],
        isActive: false,
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08'),
        usageCount: 23
    }
];

export default function TemplatesPage() {
    const [templates, setTemplates] = useState(mockTemplates);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateDescription, setNewTemplateDescription] = useState('');

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = searchTerm === '' ||
            template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(templates.map(t => t.category)));

    const handleCreateTemplate = () => {
        if (!newTemplateName.trim()) return;

        const newTemplate: Template = {
            id: Date.now().toString(),
            name: newTemplateName,
            description: newTemplateDescription,
            category: 'Personalizado',
            nodes: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            usageCount: 0
        };

        setTemplates([...templates, newTemplate]);
        setSelectedTemplate(newTemplate);
        setIsEditing(true);
        setShowCreateModal(false);
        setNewTemplateName('');
        setNewTemplateDescription('');
    };

    // Funções para NodeEditor
    const handleNodeAdd = (node: FlowNode) => {
        if (!selectedTemplate) return;

        const updatedTemplate = {
            ...selectedTemplate,
            nodes: [...selectedTemplate.nodes, node],
            updatedAt: new Date()
        };

        setSelectedTemplate(updatedTemplate);
        setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    };

    const handleNodeUpdate = (id: string, updates: Partial<FlowNode>) => {
        if (!selectedTemplate) return;

        const updatedTemplate = {
            ...selectedTemplate,
            nodes: selectedTemplate.nodes.map(node =>
                node.id === id ? { ...node, ...updates } : node
            ),
            updatedAt: new Date()
        };

        setSelectedTemplate(updatedTemplate);
        setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    };

    // Função comentada pois não está sendo usada no momento
    // const handleNodeDelete = (id: string) => {
    //     if (!selectedTemplate) return;

    //     const updatedTemplate = {
    //         ...selectedTemplate,
    //         nodes: selectedTemplate.nodes.filter(node => node.id !== id),
    //         updatedAt: new Date()
    //     };

    //     setSelectedTemplate(updatedTemplate);
    //     setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    //     setSelectedNodeId('');
    // };

    const toggleTemplateStatus = (templateId: string) => {
        setTemplates(templates.map(template =>
            template.id === templateId
                ? { ...template, isActive: !template.isActive, updatedAt: new Date() }
                : template
        ));
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR');
    };

    const selectedNode = selectedTemplate?.nodes.find(n => n.id === selectedNodeId) || null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Templates de Fluxo</h1>
                    <p className="text-gray-600">Crie e gerencie fluxos de conversa</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    Novo Template
                </Button>
            </div>

            {isEditing && selectedTemplate ? (
                isAdvancedMode ? (
                    /* Advanced Flow Builder - Full Screen */
                    <div className="h-[calc(100vh-12rem)]">
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">{selectedTemplate.name}</h2>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="secondary">Avançado</Badge>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsAdvancedMode(false)}
                                        >
                                            Modo Simples
                                        </Button>
                                        <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                            Voltar
                                        </Button>
                                        <Button onClick={() => setIsEditing(false)}>
                                            Salvar
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="h-full p-0">
                                <FlowBuilderAdvanced
                                    templateId={Number(selectedTemplate.id)}
                                    onSave={(flow) => {
                                        console.log('Flow saved:', flow);
                                        setIsEditing(false);
                                    }}
                                    onCancel={() => setIsEditing(false)}
                                    className="h-full"
                                />
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* Standard Flow Editor */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                        {/* FlowBuilder - Ocupa 2/3 da tela */}
                        <div className="lg:col-span-2">
                            <Card className="h-full">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold">{selectedTemplate.name}</h2>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="secondary">Simples</Badge>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsAdvancedMode(true)}
                                            >
                                                Modo Avançado
                                            </Button>
                                            <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                                Voltar
                                            </Button>
                                            <Button onClick={() => setIsEditing(false)}>
                                                Salvar
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="h-full p-0">
                                    <FlowBuilder
                                        templateId={selectedTemplate.id}
                                        subflows={[]} // Converter nodes para subflows se necessário
                                        onSubflowsUpdate={(subflows: any[]) => {
                                            console.log('Subflows updated:', subflows);
                                            // Aqui você pode implementar a lógica para atualizar o template
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* NodeEditor - Ocupa 1/3 da tela */}
                        <div className="lg:col-span-1">
                            <NodeEditor
                                node={selectedNode}
                                onNodeUpdate={handleNodeUpdate}
                                onClose={() => setSelectedNodeId('')}
                            />

                            {/* Seção adicional para mostrar nodes do template */}
                            <Card className="mt-4">
                                <CardHeader>
                                    <h3 className="text-md font-semibold">Nodes do Template</h3>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {selectedTemplate.nodes.map((node) => (
                                            <div
                                                key={node.id}
                                                className={`p-2 border rounded cursor-pointer text-sm ${selectedNodeId === node.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => setSelectedNodeId(node.id)}
                                            >
                                                <div className="font-medium">{node.title}</div>
                                                <div className="text-gray-500">{node.type}</div>
                                            </div>
                                        ))}

                                        <Button
                                            size="sm"
                                            className="w-full mt-2"
                                            onClick={() => {
                                                const newNode: FlowNode = {
                                                    id: `node_${Date.now()}`,
                                                    type: 'message',
                                                    title: 'Novo Node',
                                                    content: 'Conteúdo do novo node',
                                                    position: { x: 100, y: 100 }
                                                };
                                                handleNodeAdd(newNode);
                                                setSelectedNodeId(newNode.id);
                                            }}
                                        >
                                            + Adicionar Node
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )
            ) : (
                /* Templates List */
                <>
                    {/* Filters */}
                    <div className="flex space-x-4">
                        <Input
                            placeholder="Buscar templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="all">Todas as categorias</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    {/* Templates Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map((template) => (
                            <Card key={template.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">{template.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                                        </div>
                                        <Badge
                                            variant={template.isActive ? 'success' : 'secondary'}
                                        >
                                            {template.isActive ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Categoria:</span>
                                            <Badge variant="secondary">{template.category}</Badge>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Nós:</span>
                                            <span className="font-medium">{template.nodes.length}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Usos:</span>
                                            <span className="font-medium">{template.usageCount}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Atualizado:</span>
                                            <span>{formatDate(template.updatedAt)}</span>
                                        </div>

                                        <div className="flex space-x-2 pt-3 border-t">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedTemplate(template);
                                                    setIsEditing(true);
                                                }}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                variant={template.isActive ? 'danger' : 'success'}
                                                size="sm"
                                                onClick={() => toggleTemplateStatus(template.id)}
                                            >
                                                {template.isActive ? 'Desativar' : 'Ativar'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredTemplates.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum template encontrado</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || categoryFilter !== 'all' ? 'Tente ajustar os filtros' : 'Comece criando seu primeiro template'}
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Create Template Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Novo Template"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome do Template
                        </label>
                        <Input
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            placeholder="Ex: Atendimento ao Cliente"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição
                        </label>
                        <Input
                            value={newTemplateDescription}
                            onChange={(e) => setNewTemplateDescription(e.target.value)}
                            placeholder="Breve descrição do template"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateTemplate} disabled={!newTemplateName.trim()}>
                            Criar Template
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
