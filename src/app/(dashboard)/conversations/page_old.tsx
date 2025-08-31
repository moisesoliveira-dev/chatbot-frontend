'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

interface Message {
    id: string;
    text: string;
    timestamp: Date;
    sender: 'user' | 'bot';
    status?: 'sent' | 'delivered' | 'read';
}

interface Conversation {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    status: 'active' | 'waiting' | 'closed';
    priority: 'low' | 'medium' | 'high';
    lastMessage: string;
    lastActivity: Date;
    unreadCount: number;
    tags: string[];
    messages: Message[];
}

const mockConversations: Conversation[] = [
    {
        id: '1',
        userId: 'user1',
        userName: 'João Silva',
        status: 'active',
        priority: 'high',
        lastMessage: 'Preciso de ajuda com meu pedido',
        lastActivity: new Date(Date.now() - 5 * 60 * 1000),
        unreadCount: 2,
        tags: ['suporte', 'pedido'],
        messages: [
            { id: '1', text: 'Olá! Preciso de ajuda', timestamp: new Date(Date.now() - 10 * 60 * 1000), sender: 'user' },
            { id: '2', text: 'Olá! Como posso ajudá-lo?', timestamp: new Date(Date.now() - 9 * 60 * 1000), sender: 'bot' },
            { id: '3', text: 'Preciso de ajuda com meu pedido', timestamp: new Date(Date.now() - 5 * 60 * 1000), sender: 'user' }
        ]
    },
    {
        id: '2',
        userId: 'user2',
        userName: 'Maria Santos',
        status: 'waiting',
        priority: 'medium',
        lastMessage: 'Obrigada pela ajuda!',
        lastActivity: new Date(Date.now() - 15 * 60 * 1000),
        unreadCount: 0,
        tags: ['suporte'],
        messages: [
            { id: '4', text: 'Oi, tenho uma dúvida', timestamp: new Date(Date.now() - 20 * 60 * 1000), sender: 'user' },
            { id: '5', text: 'Obrigada pela ajuda!', timestamp: new Date(Date.now() - 15 * 60 * 1000), sender: 'user' }
        ]
    },
];

export default function ConversationsPage() {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
    const [filter, setFilter] = useState<'all' | 'active' | 'waiting' | 'closed'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [newMessage, setNewMessage] = useState('');

    const filteredConversations = mockConversations.filter(conv => {
        const matchesFilter = filter === 'all' || conv.status === filter;
        const matchesSearch = searchTerm === '' ||
            conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));

        if (minutes < 1) return 'agora';
        if (minutes < 60) return `${minutes}m`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;

        const days = Math.floor(hours / 24);
        return `${days}d`;
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const message: Message = {
            id: Date.now().toString(),
            text: newMessage,
            timestamp: new Date(),
            sender: 'bot'
        };

        const updatedConversation = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, message],
            lastMessage: newMessage,
            lastActivity: new Date()
        };

        setSelectedConversation(updatedConversation);
        setNewMessage('');
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex space-x-6">
            {/* Conversations List */}
            <div className="w-1/3 flex flex-col">
                <Card className="flex-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Conversas</h2>
                            <Badge variant="secondary">{filteredConversations.length}</Badge>
                        </div>

                        <div className="space-y-3">
                            <Input
                                placeholder="Buscar conversas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <div className="flex space-x-2">
                                {(['all', 'active', 'waiting', 'closed'] as const).map(status => (
                                    <Button
                                        key={status}
                                        variant={filter === status ? 'primary' : 'secondary'}
                                        size="sm"
                                        onClick={() => setFilter(status)}
                                    >
                                        {status === 'all' ? 'Todas' :
                                            status === 'active' ? 'Ativas' :
                                                status === 'waiting' ? 'Aguardando' : 'Fechadas'}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {filteredConversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    onClick={() => setSelectedConversation(conversation)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedConversation?.id === conversation.id
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <Avatar
                                            fallback={conversation.userName.substring(0, 2)}
                                            size="sm"
                                        />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-medium truncate">
                                                    {conversation.userName}
                                                </h4>
                                                <span className="text-xs text-gray-500">
                                                    {formatTime(conversation.lastActivity)}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 truncate mt-1">
                                                {conversation.lastMessage}
                                            </p>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex space-x-1">
                                                    <Badge variant={conversation.status === 'active' ? 'success' : 'secondary'}>
                                                        {conversation.status === 'active' ? 'Ativa' :
                                                            conversation.status === 'waiting' ? 'Aguardando' : 'Fechada'}
                                                    </Badge>
                                                </div>

                                                {conversation.unreadCount > 0 && (
                                                    <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                                                        {conversation.unreadCount}
                                                    </span>
                                                )}
                                            </div>

                                            {conversation.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {conversation.tags.map((tag, index) => (
                                                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Avatar
                                        fallback={selectedConversation.userName.substring(0, 2)}
                                        size="md"
                                    />
                                    <div>
                                        <h3 className="font-medium">{selectedConversation.userName}</h3>
                                        <p className="text-sm text-gray-500">
                                            Última atividade: {formatTime(selectedConversation.lastActivity)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <Button variant="secondary" size="sm">
                                        Transferir
                                    </Button>
                                    <Button variant="secondary" size="sm">
                                        Fechar
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-4">
                                {selectedConversation.messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sender === 'bot' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'bot'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <p className="text-sm">{message.text}</p>
                                            <p className={`text-xs mt-1 ${message.sender === 'bot' ? 'text-blue-100' : 'text-gray-500'
                                                }`}>
                                                {message.timestamp.toLocaleTimeString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>

                        <div className="border-t p-4">
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="Digite sua mensagem..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    className="flex-1"
                                />
                                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                                    Enviar
                                </Button>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Selecione uma conversa</h3>
                            <p className="mt-1 text-sm text-gray-500">Escolha uma conversa da lista para começar.</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
