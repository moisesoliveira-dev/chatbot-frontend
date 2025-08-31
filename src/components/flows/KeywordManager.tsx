'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Alert } from '@/components/ui/Alert';
import { Subflow } from '@/lib/types';

interface KeywordConflict {
    keyword: string;
    subflows: { id: number; name: string }[];
}

interface KeywordManagerProps {
    subflows: Subflow[];
    onSubflowUpdate: (id: number, updates: Partial<Subflow>) => void;
    onClose: () => void;
}

export const KeywordManager: React.FC<KeywordManagerProps> = ({
    subflows,
    onSubflowUpdate,
    onClose,
}) => {
    const [newKeyword, setNewKeyword] = useState('');
    const [selectedSubflowId, setSelectedSubflowId] = useState<number | null>(null);
    const [conflicts, setConflicts] = useState<KeywordConflict[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [bulkKeywords, setBulkKeywords] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        detectConflicts();
        generateSuggestions();
    }, [subflows]);

    const detectConflicts = () => {
        const keywordMap = new Map<string, { id: number; name: string }[]>();

        // Build keyword map
        subflows.forEach(subflow => {
            subflow.trigger_keywords.forEach(keyword => {
                if (!keywordMap.has(keyword)) {
                    keywordMap.set(keyword, []);
                }
                keywordMap.get(keyword)!.push({ id: subflow.id, name: subflow.name });
            });
        });

        // Find conflicts (keywords used by multiple subflows)
        const conflictList: KeywordConflict[] = [];
        keywordMap.forEach((subflowList, keyword) => {
            if (subflowList.length > 1) {
                conflictList.push({ keyword, subflows: subflowList });
            }
        });

        setConflicts(conflictList);
    };

    const generateSuggestions = () => {
        // Common keywords that might be useful
        const commonKeywords = [
            'ajuda', 'suporte', 'informação', 'preço', 'valor', 'comprar', 'vender',
            'contato', 'telefone', 'email', 'endereço', 'horário', 'funcionamento',
            'produto', 'serviço', 'dúvida', 'problema', 'reclamação', 'elogio',
            'cancelar', 'alterar', 'confirmar', 'agendar', 'reagendar',
            'sim', 'não', 'talvez', 'ok', 'obrigado', 'obrigada'
        ];

        // Filter out already used keywords
        const usedKeywords = new Set(subflows.flatMap(s => s.trigger_keywords));
        const availableSuggestions = commonKeywords.filter(keyword => !usedKeywords.has(keyword));

        setSuggestions(availableSuggestions.slice(0, 10));
    };

    const addKeywordToSubflow = (subflowId: number, keyword: string) => {
        const subflow = subflows.find(s => s.id === subflowId);
        if (subflow && !subflow.trigger_keywords.includes(keyword.toLowerCase())) {
            const updatedKeywords = [...subflow.trigger_keywords, keyword.toLowerCase()];
            onSubflowUpdate(subflowId, { trigger_keywords: updatedKeywords });
        }
    };

    const removeKeywordFromSubflow = (subflowId: number, keyword: string) => {
        const subflow = subflows.find(s => s.id === subflowId);
        if (subflow) {
            const updatedKeywords = subflow.trigger_keywords.filter(k => k !== keyword);
            onSubflowUpdate(subflowId, { trigger_keywords: updatedKeywords });
        }
    };

    const handleQuickAdd = () => {
        if (newKeyword.trim() && selectedSubflowId) {
            addKeywordToSubflow(selectedSubflowId, newKeyword.trim());
            setNewKeyword('');
        }
    };

    const handleBulkAdd = () => {
        if (bulkKeywords.trim() && selectedSubflowId) {
            const keywords = bulkKeywords
                .split(/[,\n]/)
                .map(k => k.trim().toLowerCase())
                .filter(k => k.length > 0);

            keywords.forEach(keyword => {
                addKeywordToSubflow(selectedSubflowId, keyword);
            });

            setBulkKeywords('');
        }
    };

    const handleSuggestionAdd = (suggestion: string) => {
        if (selectedSubflowId) {
            addKeywordToSubflow(selectedSubflowId, suggestion);
        }
    };

    const resolveConflict = (keyword: string, keepInSubflowId: number) => {
        // Remove keyword from all subflows except the selected one
        subflows.forEach(subflow => {
            if (subflow.id !== keepInSubflowId && subflow.trigger_keywords.includes(keyword)) {
                removeKeywordFromSubflow(subflow.id, keyword);
            }
        });
    };

    const getAllKeywords = () => {
        const allKeywords = subflows.flatMap(s => s.trigger_keywords);
        return Array.from(new Set(allKeywords));
    };

    const getKeywordStats = () => {
        const allKeywords = getAllKeywords();
        const totalKeywords = allKeywords.length;
        const conflictCount = conflicts.length;
        const activeSubflows = subflows.filter(s => s.is_active).length;

        return {
            totalKeywords,
            conflictCount,
            activeSubflows,
            averageKeywordsPerSubflow: subflows.length > 0 ?
                Math.round((subflows.reduce((acc, s) => acc + s.trigger_keywords.length, 0) / subflows.length) * 10) / 10 : 0
        };
    };

    const stats = getKeywordStats();
    const filteredSubflows = searchTerm ?
        subflows.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.trigger_keywords.some(k => k.includes(searchTerm.toLowerCase()))
        ) : subflows;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            🔤 Gerenciador de Palavras-chave Inteligente
                        </h3>
                        <Button variant="outline" size="sm" onClick={onClose}>
                            Fechar
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Statistics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">{stats.totalKeywords}</div>
                                <div className="text-sm text-blue-600">Palavras-chave</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-green-50 border-green-200">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.activeSubflows}</div>
                                <div className="text-sm text-green-600">Subfluxos ativos</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-yellow-50 border-yellow-200">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-yellow-600">{stats.conflictCount}</div>
                                <div className="text-sm text-yellow-600">Conflitos</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-purple-50 border-purple-200">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600">{stats.averageKeywordsPerSubflow}</div>
                                <div className="text-sm text-purple-600">Média/subfluxo</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Conflicts Alert */}
                    {conflicts.length > 0 && (
                        <Alert variant="warning">
                            <div>
                                <p className="font-medium mb-2">⚠️ Conflitos de palavras-chave detectados:</p>
                                <div className="space-y-2">
                                    {conflicts.slice(0, 3).map(conflict => (
                                        <div key={conflict.keyword} className="text-sm">
                                            <strong>&quot;{conflict.keyword}&quot;</strong> está sendo usado por: {' '}
                                            {conflict.subflows.map(s => s.name).join(', ')}
                                        </div>
                                    ))}
                                    {conflicts.length > 3 && (
                                        <p className="text-sm text-gray-600">...e mais {conflicts.length - 3} conflitos</p>
                                    )}
                                </div>
                            </div>
                        </Alert>
                    )}

                    {/* Quick Add */}
                    <Card className="bg-green-50 border-green-200">
                        <CardHeader>
                            <h4 className="font-medium text-green-800">⚡ Adicionar palavra-chave rapidamente</h4>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <select
                                    value={selectedSubflowId || ''}
                                    onChange={(e) => setSelectedSubflowId(Number(e.target.value) || null)}
                                    className="px-3 py-2 border border-green-300 rounded-md bg-white text-sm"
                                >
                                    <option value="">Selecionar subfluxo...</option>
                                    {subflows.map(subflow => (
                                        <option key={subflow.id} value={subflow.id}>
                                            {subflow.name} ({subflow.trigger_keywords.length} keywords)
                                        </option>
                                    ))}
                                </select>

                                <Input
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    placeholder="Nova palavra-chave..."
                                    onKeyPress={(e) => e.key === 'Enter' && handleQuickAdd()}
                                    className="border-green-300"
                                />

                                <Button
                                    onClick={handleQuickAdd}
                                    disabled={!newKeyword.trim() || !selectedSubflowId}
                                    variant="success"
                                >
                                    Adicionar
                                </Button>
                            </div>

                            {/* Suggestions */}
                            {suggestions.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-green-700 mb-2">
                                        Sugestões inteligentes:
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.map(suggestion => (
                                            <Button
                                                key={suggestion}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSuggestionAdd(suggestion)}
                                                disabled={!selectedSubflowId}
                                                className="text-xs border-green-300 hover:bg-green-100"
                                            >
                                                + {suggestion}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Bulk Add */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <h4 className="font-medium text-blue-800">📝 Adicionar múltiplas palavras-chave</h4>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <textarea
                                value={bulkKeywords}
                                onChange={(e) => setBulkKeywords(e.target.value)}
                                placeholder="Digite múltiplas palavras-chave separadas por vírgula ou quebra de linha..."
                                rows={3}
                                className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-sm"
                            />
                            <Button
                                onClick={handleBulkAdd}
                                disabled={!bulkKeywords.trim() || !selectedSubflowId}
                                variant="primary"
                            >
                                Adicionar em lote
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Search */}
                    <div>
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="🔍 Buscar subfluxos ou palavras-chave..."
                            className="w-full"
                        />
                    </div>

                    {/* Subflows List */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">
                            Subfluxos ({filteredSubflows.length})
                        </h4>

                        {filteredSubflows.map(subflow => (
                            <Card key={subflow.id} className={`${subflow.is_active ? 'border-green-200' : 'border-gray-200'}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h5 className="font-medium text-gray-900">{subflow.name}</h5>
                                                <Badge variant={subflow.is_active ? 'success' : 'gray'} className="text-xs">
                                                    {subflow.is_active ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                                <Badge variant="info" className="text-xs">
                                                    Ordem: {subflow.order_index}
                                                </Badge>
                                            </div>

                                            {subflow.description && (
                                                <p className="text-sm text-gray-600 mb-3">{subflow.description}</p>
                                            )}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedSubflowId(subflow.id)}
                                            className={selectedSubflowId === subflow.id ? 'bg-blue-50 border-blue-300' : ''}
                                        >
                                            {selectedSubflowId === subflow.id ? 'Selecionado' : 'Selecionar'}
                                        </Button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Palavras-chave ({subflow.trigger_keywords.length})
                                        </label>
                                        <div className="flex flex-wrap gap-2 min-h-[32px]">
                                            {subflow.trigger_keywords.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic">Nenhuma palavra-chave configurada</p>
                                            ) : (
                                                subflow.trigger_keywords.map(keyword => {
                                                    const hasConflict = conflicts.some(c => c.keyword === keyword);
                                                    return (
                                                        <div
                                                            key={keyword}
                                                            className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs ${hasConflict
                                                                ? 'bg-red-100 border border-red-300 text-red-800'
                                                                : 'bg-gray-100 border border-gray-300 text-gray-800'
                                                                }`}
                                                        >
                                                            {hasConflict && <span>⚠️</span>}
                                                            <span>{keyword}</span>
                                                            <button
                                                                onClick={() => removeKeywordFromSubflow(subflow.id, keyword)}
                                                                className="text-red-500 hover:text-red-700 ml-1"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {filteredSubflows.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>Nenhum subfluxo encontrado para &quot;{searchTerm}&quot;</p>
                            </div>
                        )}
                    </div>

                    {/* Conflict Resolution */}
                    {conflicts.length > 0 && (
                        <Card className="bg-red-50 border-red-200">
                            <CardHeader>
                                <h4 className="font-medium text-red-800">🚨 Resolver Conflitos</h4>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {conflicts.map(conflict => (
                                    <div key={conflict.keyword} className="bg-white rounded-lg p-4 border border-red-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <h5 className="font-medium text-gray-900">
                                                Palavra-chave: &quot;<strong>{conflict.keyword}</strong>&quot;
                                            </h5>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-3">
                                            Esta palavra-chave está sendo usada por múltiplos subfluxos. Escolha em qual manter:
                                        </p>

                                        <div className="space-y-2">
                                            {conflict.subflows.map(subflow => (
                                                <div key={subflow.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <span className="text-sm font-medium">{subflow.name}</span>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => resolveConflict(conflict.keyword, subflow.id)}
                                                    >
                                                        Manter apenas aqui
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
