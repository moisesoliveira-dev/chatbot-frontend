'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Subflow, FlowMessage } from '@/lib/types';

interface ExtendedSubflow extends Subflow {
    messages: FlowMessage[];
}

interface FlowPreviewProps {
    subflows: ExtendedSubflow[];
    onClose: () => void;
}

interface SimulationMessage {
    id: string;
    type: 'bot' | 'user';
    content: string;
    timestamp: Date;
    messageId?: number;
    waitingForFile?: boolean;
    expectedFileTypes?: string[];
}

export const FlowPreview: React.FC<FlowPreviewProps> = ({ subflows, onClose }) => {
    const [currentSubflow, setCurrentSubflow] = useState<ExtendedSubflow | null>(null);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [simulationMessages, setSimulationMessages] = useState<SimulationMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isWaitingForFile, setIsWaitingForFile] = useState(false);
    const [expectedFileTypes, setExpectedFileTypes] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [simulationMessages]);

    const startSimulation = (subflow: ExtendedSubflow) => {
        setCurrentSubflow(subflow);
        setCurrentMessageIndex(0);
        setSimulationMessages([
            {
                id: `start_${Date.now()}`,
                type: 'bot',
                content: `🚀 Simulação iniciada para o fluxo: "${subflow.name}"`,
                timestamp: new Date(),
            }
        ]);
        setIsWaitingForFile(false);
        setExpectedFileTypes([]);
        processNextMessage(subflow, 0);
    };

    const processNextMessage = (subflow: ExtendedSubflow, messageIndex: number) => {
        const sortedMessages = subflow.messages.sort((a, b) => a.order_index - b.order_index);

        if (messageIndex >= sortedMessages.length) {
            // End of subflow
            setSimulationMessages(prev => [...prev, {
                id: `end_${Date.now()}`,
                type: 'bot',
                content: '✅ Fim do fluxo de mensagens',
                timestamp: new Date(),
            }]);
            return;
        }

        const message = sortedMessages[messageIndex];

        // Simulate delay
        setTimeout(() => {
            const newMessage: SimulationMessage = {
                id: `msg_${Date.now()}`,
                type: 'bot',
                content: message.message_text,
                timestamp: new Date(),
                messageId: message.id,
                waitingForFile: message.wait_for_file,
                expectedFileTypes: message.expected_file_types,
            };

            setSimulationMessages(prev => [...prev, newMessage]);

            if (message.wait_for_file) {
                setIsWaitingForFile(true);
                setExpectedFileTypes(message.expected_file_types);
            } else if (message.wait_for_response) {
                // Bot is waiting for text response
                setIsWaitingForFile(false);
                setExpectedFileTypes([]);
            } else {
                // Continue to next message
                setCurrentMessageIndex(messageIndex + 1);
                processNextMessage(subflow, messageIndex + 1);
            }
        }, message.delay_seconds * 1000);
    };

    const handleUserMessage = () => {
        if (!userInput.trim()) return;

        const newMessage: SimulationMessage = {
            id: `user_${Date.now()}`,
            type: 'user',
            content: userInput,
            timestamp: new Date(),
        };

        setSimulationMessages(prev => [...prev, newMessage]);
        setUserInput('');

        // Continue to next message after user response
        if (currentSubflow && !isWaitingForFile) {
            setTimeout(() => {
                const nextIndex = currentMessageIndex + 1;
                setCurrentMessageIndex(nextIndex);
                processNextMessage(currentSubflow, nextIndex);
            }, 500);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const submitFile = () => {
        if (!selectedFile) return;

        const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || '';
        const isValidType = expectedFileTypes.includes(fileExtension);

        const fileMessage: SimulationMessage = {
            id: `file_${Date.now()}`,
            type: 'user',
            content: `📁 ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)}KB)`,
            timestamp: new Date(),
        };

        setSimulationMessages(prev => [...prev, fileMessage]);

        if (isValidType) {
            // File accepted
            setTimeout(() => {
                setSimulationMessages(prev => [...prev, {
                    id: `accept_${Date.now()}`,
                    type: 'bot',
                    content: `✅ Arquivo aceito! Continuando fluxo...`,
                    timestamp: new Date(),
                }]);

                setIsWaitingForFile(false);
                setExpectedFileTypes([]);
                setSelectedFile(null);

                // Continue to next message
                if (currentSubflow) {
                    const nextIndex = currentMessageIndex + 1;
                    setCurrentMessageIndex(nextIndex);
                    processNextMessage(currentSubflow, nextIndex);
                }
            }, 1000);
        } else {
            // File rejected
            setTimeout(() => {
                setSimulationMessages(prev => [...prev, {
                    id: `reject_${Date.now()}`,
                    type: 'bot',
                    content: `❌ Arquivo rejeitado. Tipos aceitos: ${expectedFileTypes.join(', ')}. Tente novamente.`,
                    timestamp: new Date(),
                }]);
                setSelectedFile(null);
            }, 1000);
        }
    };

    const resetSimulation = () => {
        setCurrentSubflow(null);
        setCurrentMessageIndex(0);
        setSimulationMessages([]);
        setUserInput('');
        setIsWaitingForFile(false);
        setExpectedFileTypes([]);
        setSelectedFile(null);
    };

    const handleKeywordSimulation = (keyword: string) => {
        const matchingSubflow = subflows.find(subflow =>
            subflow.trigger_keywords.some(kw =>
                kw.toLowerCase().includes(keyword.toLowerCase())
            )
        );

        if (matchingSubflow) {
            startSimulation(matchingSubflow);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            🎭 Preview de Fluxo - Simulador de Conversas
                        </h3>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={resetSimulation}>
                                🔄 Reiniciar
                            </Button>
                            <Button variant="outline" size="sm" onClick={onClose}>
                                Fechar
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Subflow Selection */}
                    {!currentSubflow && (
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">
                                Selecione um subfluxo para simular:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {subflows.map((subflow) => (
                                    <div
                                        key={subflow.id}
                                        className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200 bg-white rounded-lg border-l-4 border-l-blue-400"
                                        onClick={() => startSimulation(subflow)}
                                    >
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-medium text-gray-900 truncate">{subflow.name}</h5>
                                                <Badge variant={subflow.is_active ? 'success' : 'gray'} className="text-xs">
                                                    {subflow.is_active ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {subflow.description || 'Sem descrição'}
                                            </p>

                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {subflow.trigger_keywords.slice(0, 3).map((keyword) => (
                                                        <Badge key={keyword} variant="info" className="text-xs">
                                                            {keyword}
                                                        </Badge>
                                                    ))}
                                                    {subflow.trigger_keywords.length > 3 && (
                                                        <Badge variant="gray" className="text-xs">
                                                            +{subflow.trigger_keywords.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    {subflow.messages.length} mensagem{subflow.messages.length !== 1 ? 's' : ''} •
                                                    Ordem: {subflow.order_index}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {subflows.length === 0 && (
                                    <div className="col-span-full text-center py-8 text-gray-500">
                                        <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <p>Nenhum subfluxo disponível para simulação</p>
                                    </div>
                                )}
                            </div>

                            {/* Quick Keyword Test */}
                            {subflows.length > 0 && (
                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                        🔤 Teste rápido por palavra-chave:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from(new Set(subflows.flatMap(s => s.trigger_keywords))).slice(0, 8).map(keyword => (
                                            <Button
                                                key={keyword}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleKeywordSimulation(keyword)}
                                                className="text-xs"
                                            >
                                                &quot;{keyword}&quot;
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Chat Simulation */}
                    {currentSubflow && (
                        <div className="space-y-4">
                            {/* Current Flow Info */}
                            <div className="bg-blue-50 rounded-lg p-4 border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-blue-900">
                                            {currentSubflow.name}
                                        </h4>
                                        <p className="text-sm text-blue-600">
                                            Keywords: {currentSubflow.trigger_keywords.join(', ')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="info" className="text-xs">
                                            {currentMessageIndex + 1} / {currentSubflow.messages.length}
                                        </Badge>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Mensagem atual
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <Card className="bg-gray-50">
                                <CardContent className="p-0">
                                    <div className="h-96 overflow-y-auto p-4 space-y-3">
                                        {simulationMessages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.type === 'user'
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-white text-gray-800 border shadow-sm'
                                                        }`}
                                                >
                                                    <p className="text-sm">{msg.content}</p>
                                                    <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                                        {msg.timestamp.toLocaleTimeString()}
                                                    </p>

                                                    {msg.waitingForFile && (
                                                        <div className="mt-2 p-2 bg-orange-100 rounded border-l-4 border-orange-400">
                                                            <p className="text-xs text-orange-800">
                                                                📁 Aguardando arquivo: {msg.expectedFileTypes?.join(', ')}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Typing Indicator */}
                                        {isWaitingForFile && (
                                            <div className="flex justify-start">
                                                <div className="bg-white text-gray-800 border shadow-sm px-4 py-2 rounded-lg">
                                                    <p className="text-sm">🤖 Aguardando arquivo...</p>
                                                    <div className="flex space-x-1 mt-1">
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-100"></div>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-200"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Input Area */}
                            <div className="space-y-3">
                                {isWaitingForFile ? (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <p className="text-sm font-medium text-orange-800 mb-3">
                                            📁 Bot aguardando arquivo ({expectedFileTypes.join(', ')})
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                accept={expectedFileTypes.map(type => `.${type}`).join(',')}
                                            />
                                            <Button
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex-1"
                                            >
                                                {selectedFile ? `📄 ${selectedFile.name}` : '📁 Escolher arquivo'}
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={submitFile}
                                                disabled={!selectedFile}
                                            >
                                                Enviar
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex space-x-2">
                                        <Input
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            placeholder="Digite sua resposta..."
                                            onKeyPress={(e) => e.key === 'Enter' && handleUserMessage()}
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="primary"
                                            onClick={handleUserMessage}
                                            disabled={!userInput.trim()}
                                        >
                                            Enviar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
