'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FlowMessage } from '@/lib/types';

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

interface FlowCanvasProps {
    nodes: FlowCanvasNode[];
    onNodeAdd: (node: FlowCanvasNode) => void;
    onNodeUpdate: (id: string, updates: Partial<FlowCanvasNode>) => void;
    onNodeDelete: (id: string) => void;
    onNodeSelect: (id: string) => void;
    selectedNodeId?: string;
    onConnectionCreate: (fromId: string, toId: string) => void;
    onConnectionDelete: (fromId: string, toId: string) => void;
}

const nodeTypeConfig = {
    message: { icon: '💬', color: 'bg-blue-100 border-blue-300 text-blue-800', label: 'Mensagem' },
    question: { icon: '❓', color: 'bg-green-100 border-green-300 text-green-800', label: 'Pergunta' },
    condition: { icon: '🔀', color: 'bg-yellow-100 border-yellow-300 text-yellow-800', label: 'Condição' },
    action: { icon: '⚡', color: 'bg-purple-100 border-purple-300 text-purple-800', label: 'Ação' },
    wait_file: { icon: '📁', color: 'bg-orange-100 border-orange-300 text-orange-800', label: 'Aguardar Arquivo' },
};

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
    nodes,
    onNodeAdd,
    onNodeUpdate,
    onNodeDelete,
    onNodeSelect,
    selectedNodeId,
    onConnectionCreate,
    onConnectionDelete,
}) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [draggedNode, setDraggedNode] = useState<FlowCanvasNode | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [connectionMode, setConnectionMode] = useState(false);
    const [connectionStart, setConnectionStart] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Zoom functionality
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setScale(prev => Math.min(Math.max(prev * delta, 0.2), 2));
        }
    }, []);

    // Pan functionality
    const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle mouse or Alt+click
            e.preventDefault();
            const startPan = { x: e.clientX - pan.x, y: e.clientY - pan.y };

            const handleMouseMove = (moveEvent: MouseEvent) => {
                setPan({
                    x: moveEvent.clientX - startPan.x,
                    y: moveEvent.clientY - startPan.y,
                });
            };

            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    }, [pan]);

    // Node dragging
    const handleNodeMouseDown = useCallback((e: React.MouseEvent, node: FlowCanvasNode) => {
        e.stopPropagation();

        if (connectionMode) {
            if (connectionStart && connectionStart !== node.id) {
                onConnectionCreate(connectionStart, node.id);
                setConnectionMode(false);
                setConnectionStart(null);
            } else {
                setConnectionStart(node.id);
            }
            return;
        }

        setDraggedNode(node);
        setIsDragging(true);
        onNodeSelect(node.id);

        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
                x: (e.clientX - rect.left - pan.x) / scale - node.position.x,
                y: (e.clientY - rect.top - pan.y) / scale - node.position.y,
            });
        }
    }, [connectionMode, connectionStart, onConnectionCreate, onNodeSelect, pan, scale]);

    // Handle mouse move for dragging
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });

            if (isDragging && draggedNode && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const newX = (e.clientX - rect.left - pan.x) / scale - dragOffset.x;
                const newY = (e.clientY - rect.top - pan.y) / scale - dragOffset.y;

                onNodeUpdate(draggedNode.id, {
                    position: { x: newX, y: newY }
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setDraggedNode(null);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, draggedNode, dragOffset, pan, scale, onNodeUpdate]);

    // Render connections
    const renderConnections = () => {
        return nodes.flatMap(node =>
            node.connections.map(targetId => {
                const targetNode = nodes.find(n => n.id === targetId);
                if (!targetNode) return null;

                const startX = node.position.x * scale + pan.x + 100;
                const startY = node.position.y * scale + pan.y + 30;
                const endX = targetNode.position.x * scale + pan.x + 100;
                const endY = targetNode.position.y * scale + pan.y + 30;

                return (
                    <line
                        key={`${node.id}-${targetId}`}
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke="#6B7280"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                        className="cursor-pointer hover:stroke-blue-500"
                        onClick={() => onConnectionDelete(node.id, targetId)}
                    />
                );
            })
        ).filter(Boolean);
    };

    // Add new node
    const addNode = useCallback((type: keyof typeof nodeTypeConfig) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const centerX = (rect.width / 2 - pan.x) / scale;
        const centerY = (rect.height / 2 - pan.y) / scale;

        const newNode: FlowCanvasNode = {
            id: `node_${Date.now()}`,
            type,
            title: `${nodeTypeConfig[type].label} ${nodes.length + 1}`,
            content: '',
            position: { x: centerX - 100, y: centerY - 30 },
            connections: [],
            data: type === 'wait_file' ? { wait_for_file: true, expected_file_types: ['pdf', 'doc', 'docx'] } : {}
        };

        onNodeAdd(newNode);
    }, [nodes.length, onNodeAdd, pan, scale]);

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">Editor de Fluxo</h3>
                    <Badge variant="gray" className="text-xs">
                        {nodes.length} {nodes.length === 1 ? 'nó' : 'nós'}
                    </Badge>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Node type buttons */}
                    {Object.entries(nodeTypeConfig).map(([type, config]) => (
                        <Button
                            key={type}
                            variant="outline"
                            size="sm"
                            onClick={() => addNode(type as keyof typeof nodeTypeConfig)}
                            className="flex items-center space-x-1"
                        >
                            <span>{config.icon}</span>
                            <span className="hidden sm:inline">{config.label}</span>
                        </Button>
                    ))}

                    <div className="border-l border-gray-300 h-6 mx-2" />

                    {/* Tools */}
                    <Button
                        variant={connectionMode ? "primary" : "outline"}
                        size="sm"
                        onClick={() => {
                            setConnectionMode(!connectionMode);
                            setConnectionStart(null);
                        }}
                    >
                        🔗 Conectar
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setScale(1);
                            setPan({ x: 0, y: 0 });
                        }}
                    >
                        ⌂ Centralizar
                    </Button>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Zoom: {Math.round(scale * 100)}%</span>
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative overflow-hidden">
                {connectionMode && (
                    <div className="absolute top-2 left-2 z-10 bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm">
                        {connectionStart ? 'Clique no nó destino' : 'Clique no nó origem'}
                    </div>
                )}

                <div
                    ref={canvasRef}
                    className="w-full h-full cursor-grab active:cursor-grabbing"
                    onMouseDown={handleCanvasMouseDown}
                    onWheel={handleWheel}
                >
                    {/* SVG for connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                            <marker
                                id="arrowhead"
                                markerWidth="10"
                                markerHeight="7"
                                refX="9"
                                refY="3.5"
                                orient="auto"
                            >
                                <polygon
                                    points="0 0, 10 3.5, 0 7"
                                    fill="#6B7280"
                                />
                            </marker>
                        </defs>
                        <g className="pointer-events-auto">
                            {renderConnections()}
                        </g>
                    </svg>

                    {/* Nodes */}
                    <div
                        className="absolute"
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                            transformOrigin: '0 0',
                        }}
                    >
                        {nodes.map((node) => {
                            const config = nodeTypeConfig[node.type];
                            const isSelected = selectedNodeId === node.id;
                            const isConnectionSource = connectionStart === node.id;

                            return (
                                <div
                                    key={node.id}
                                    className={`absolute w-48 cursor-pointer transition-all duration-200 ${config.color} ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-md'
                                        } ${isConnectionSource ? 'ring-2 ring-green-500' : ''} bg-white border-2 rounded-lg`}
                                    style={{
                                        left: node.position.x,
                                        top: node.position.y,
                                    }}
                                    onMouseDown={(e: React.MouseEvent) => handleNodeMouseDown(e, node)}
                                >
                                    <div className="p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg">{config.icon}</span>
                                                <span className="font-medium text-sm truncate">{node.title}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onNodeDelete(node.id);
                                                }}
                                            >
                                                ×
                                            </Button>
                                        </div>

                                        {node.content && (
                                            <p className="text-xs text-gray-600 truncate">{node.content}</p>
                                        )}

                                        {node.data?.wait_for_file && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {node.data.expected_file_types?.map(type => (
                                                    <Badge key={type} variant="gray" className="text-xs">
                                                        .{type}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {node.connections.length > 0 && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                → {node.connections.length} conexão{node.connections.length !== 1 ? 'ões' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 border-t">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="font-medium">Controles:</span> Ctrl+Scroll (zoom) • Alt+Arraste (pan) • Arrastar nós (mover)
                    </div>
                    <div>
                        Nós: {nodes.length} • Conexões: {nodes.reduce((acc, node) => acc + node.connections.length, 0)}
                    </div>
                </div>
            </div>
        </div>
    );
};
