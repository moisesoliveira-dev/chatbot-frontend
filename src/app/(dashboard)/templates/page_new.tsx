'use client';

import { useTemplates } from '@/lib/hooks/useTemplates';
import { toast } from 'react-hot-toast';
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardTitle,
    CardDescription,
    Badge,
    StatusBadge,
    PageLoading
} from '@/components/ui';

export default function TemplatesPage() {
    const { templates, isLoading, error } = useTemplates();

    const handleTestCreate = async () => {
        try {
            toast.success('Testando criação de template (mock)');
        } catch (error) {
            console.error('Erro no teste:', error);
        }
    };

    if (isLoading) {
        return <PageLoading text="Carregando templates..." />;
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Templates de Fluxo
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Gerencie os templates de fluxos conversacionais
                        </p>
                    </div>
                </div>

                <Card>
                    <CardBody className="text-center py-12">
                        <div className="text-red-500 mb-2 text-2xl">⚠️</div>
                        <p className="text-sm text-red-600">
                            Erro ao carregar templates: {error.message}
                        </p>
                        <Badge variant="warning" className="mt-2">
                            Backend não está rodando
                        </Badge>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Templates de Fluxo
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Gerencie os templates de fluxos conversacionais
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="secondary"
                        onClick={handleTestCreate}
                    >
                        Testar Hook
                    </Button>
                    <Button variant="primary">
                        Novo Template
                    </Button>
                </div>
            </div>

            {/* Status da Fase 3 */}
            <Card>
                <CardHeader>
                    <CardTitle>Status da Implementação</CardTitle>
                    <CardDescription>
                        Estado atual das fases de desenvolvimento
                    </CardDescription>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Fase 2 - Tipos e API</span>
                            <StatusBadge status="completed" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Fase 3 - Componentes UI</span>
                            <StatusBadge status="processing" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Componentes Criados</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    <Badge variant="success" size="sm">Button</Badge>
                                    <Badge variant="success" size="sm">Input</Badge>
                                    <Badge variant="success" size="sm">Card</Badge>
                                    <Badge variant="success" size="sm">Badge</Badge>
                                    <Badge variant="success" size="sm">Loading</Badge>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Hooks Implementados</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    <Badge variant="primary" size="sm">useTemplates</Badge>
                                    <Badge variant="primary" size="sm">useFlows</Badge>
                                    <Badge variant="primary" size="sm">useConversations</Badge>
                                    <Badge variant="primary" size="sm">useBotStatus</Badge>
                                    <Badge variant="primary" size="sm">useAnalytics</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Templates Content */}
            <Card>
                <CardBody>
                    {templates && templates.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Templates encontrados</h3>
                                <Badge variant="info">{templates.length} templates</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {templates.map((template: any) => (
                                    <Card key={template.id} hover className="p-0">
                                        <CardBody>
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-medium text-gray-900">{template.name}</h4>
                                                <StatusBadge status={template.is_active ? 'active' : 'inactive'} />
                                            </div>
                                            {template.description && (
                                                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>ID: {template.id}</span>
                                                <span>{template.flows_count} fluxos</span>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Nenhum template encontrado
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Aguardando conexão com backend para exibir templates.
                            </p>
                            <Button variant="primary">
                                Criar Primeiro Template
                            </Button>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
