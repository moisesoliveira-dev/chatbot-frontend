'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface FlowNode {
    id: string;
    type: 'message' | 'question' | 'condition' | 'action';
    title: string;
    content?: string;
    position: { x: number; y: number };
    connections?: string[];
}

interface FlowBuilderProps {
    nodes: FlowNode[];
    onNodeAdd: (node: FlowNode) => void;
    onNodeUpdate: (id: string, updates: Partial<FlowNode>) => void;
    onNodeDelete: (id: string) => void;
    selectedNodeId?: string;
    onNodeSelect: (id: string) => void;
}

const nodeTypes = [
    { type: 'message', label: 'Mensagem', icon: '💬', color: 'bg-blue-100 text-blue-800' },
    { type: 'question', label: 'Pergunta', icon: '❓', color: 'bg-green-100 text-green-800' },
    { type: 'condition', label: 'Condição', icon: '🔀', color: 'bg-yellow-100 text-yellow-800' },
    { type: 'action', label: 'Ação', icon: '⚡', color: 'bg-purple-100 text-purple-800' },
];

export const FlowBuilder: React.FC<FlowBuilderProps> = ({
    nodes,
    onNodeAdd,
    onNodeUpdate,
    onNodeDelete,
    selectedNodeId,
    onNodeSelect,
}) => {
    const [draggedNode, setDraggedNode] = useState<FlowNode | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleDragStart = (e: React.MouseEvent, node: FlowNode) => {
        setDraggedNode(node);
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedNode) return;

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left - dragOffset.x;
        const y = e.clientY - rect.top - dragOffset.y;

        if (nodes.find(n => n.id === draggedNode.id)) {
            // Update existing node position
            onNodeUpdate(draggedNode.id, { position: { x, y } });
        } else {
            // Add new node
            const newNode: FlowNode = {
                ...draggedNode,
                id: `${draggedNode.type}_${Date.now()}`,
                position: { x, y },
            };
            onNodeAdd(newNode);
        }

        setDraggedNode(null);
    };

    const getNodeTypeConfig = (type: string) => {
        return nodeTypes.find(nt => nt.type === type) || nodeTypes[0];
    };

    return (
        <div className="h-full flex">
            {/* Toolbar */}
            <div className="w-64 bg-gray-50 border-r p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Componentes</h3>
                <div className="space-y-2">
                    {nodeTypes.map((nodeType) => (
                        <div
                            key={nodeType.type}
                            draggable
                            onDragStart={(e) => {
                                const node: FlowNode = {
                                    id: '',
                                    type: nodeType.type as FlowNode['type'],
                                    title: nodeType.label,
                                    content: '',
                                    position: { x: 0, y: 0 },
                                };
                                setDraggedNode(node);
                            }}
                            className="p-3 bg-white border rounded-lg cursor-move hover:shadow-sm transition-shadow"
                        >
                            <div className="flex items-center space-x-2">
                                <span className="text-lg">{nodeType.icon}</span>
                                <div>
                                    <p className="text-sm font-medium">{nodeType.label}</p>
                                    <Badge className={`text-xs ${nodeType.color}`}>
                                        {nodeType.type}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Canvas */}
            <div
                className="flex-1 relative bg-gray-100 overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{ backgroundImage: 'radial-gradient(circle, #e5e5e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            >
                {nodes.map((node) => {
                    const config = getNodeTypeConfig(node.type);
                    return (
                        <div
                            key={node.id}
                            className={`absolute bg-white border-2 rounded-lg p-3 cursor-move shadow-sm min-w-[150px] ${selectedNodeId === node.id ? 'border-blue-500' : 'border-gray-200'
                                }`}
                            style={{
                                left: node.position.x,
                                top: node.position.y,
                            }}
                            onMouseDown={(e) => handleDragStart(e, node)}
                            onClick={() => onNodeSelect(node.id)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <span>{config.icon}</span>
                                    <span className="text-sm font-medium">{node.title}</span>
                                </div>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onNodeDelete(node.id);
                                    }}
                                    className="opacity-0 hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </Button>
                            </div>

                            {node.content && (
                                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                    {node.content}
                                </p>
                            )}

                            <Badge className={`text-xs mt-2 ${config.color}`}>
                                {config.label}
                            </Badge>
                        </div>
                    );
                })}

                {/* Instructions */}
                {nodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <h3 className="text-lg font-medium mb-2">Crie seu primeiro fluxo</h3>
                            <p className="text-sm">Arraste componentes da barra lateral para começar</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
