'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Alert } from '@/components/ui/Alert';
import {
    LazyComponent,
    VirtualizedList,
    usePerformanceMonitor,
    useMemoryMonitor
} from '@/components/ui/PerformanceOptimizations';
import {
    CpuChipIcon,
    ChartBarIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface PerformanceMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    status: 'good' | 'warning' | 'critical';
    description: string;
}

interface ListItem {
    id: number;
    name: string;
    description: string;
    value: number;
    status: 'active' | 'inactive';
}

const PerformanceDemo: React.FC = () => {
    const [largeDataSet, setLargeDataSet] = useState<ListItem[]>([]);
    const [showLazyComponents, setShowLazyComponents] = useState(false);
    const [memoryStats, setMemoryStats] = useState({ used: 0, total: 0, limit: 0 });
    const [domNodesCount, setDomNodesCount] = useState(0);

    // Use performance monitoring for this component
    usePerformanceMonitor('PerformanceDemo');
    useMemoryMonitor();    // Generate large dataset for virtualization demo
    useEffect(() => {
        const data = Array.from({ length: 10000 }, (_, index) => ({
            id: index,
            name: `Item ${index + 1}`,
            description: `This is a description for item ${index + 1}`,
            value: Math.random() * 1000,
            status: (Math.random() > 0.5 ? 'active' : 'inactive') as 'active' | 'inactive',
        }));
        setLargeDataSet(data);
    }, []);

    // Monitor memory usage
    useEffect(() => {
        const updateStats = () => {
            // Update DOM nodes count
            if (typeof document !== 'undefined') {
                setDomNodesCount(document.querySelectorAll('*').length);
            }

            // Update memory stats
            if ('memory' in performance) {
                const memory = (performance as any).memory;
                setMemoryStats({
                    used: memory.usedJSHeapSize / 1048576,
                    total: memory.totalJSHeapSize / 1048576,
                    limit: memory.jsHeapSizeLimit / 1048576,
                });
            }
        };

        updateStats();
        const interval = setInterval(updateStats, 2000);
        return () => clearInterval(interval);
    }, []);    // Simulate expensive operation
    const runExpensiveOperation = useCallback(() => {
        const start = performance.now();

        // Simulate heavy computation
        for (let i = 0; i < 1000000; i++) {
            Math.sqrt(i);
        }

        const end = performance.now();
        return end - start;
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'good': return <CheckCircleIcon className="w-4 h-4" />;
            case 'warning': return <ExclamationTriangleIcon className="w-4 h-4" />;
            case 'critical': return <ExclamationTriangleIcon className="w-4 h-4" />;
            default: return <ClockIcon className="w-4 h-4" />;
        }
    };

    const currentMetrics: PerformanceMetric[] = [
        {
            id: 'memory',
            name: 'Uso de Memória',
            value: memoryStats.used,
            unit: 'MB',
            status: memoryStats.used > 100 ? 'warning' : 'good',
            description: 'Memória JavaScript utilizada pela aplicação'
        },
        {
            id: 'load-time',
            name: 'Tempo de Carregamento',
            value: performance.now(),
            unit: 'ms',
            status: performance.now() > 3000 ? 'warning' : 'good',
            description: 'Tempo desde o início da página'
        },
        {
            id: 'dom-nodes',
            name: 'Nós DOM',
            value: domNodesCount,
            unit: 'elementos',
            status: domNodesCount > 2000 ? 'warning' : 'good',
            description: 'Número total de elementos DOM na página'
        },
        {
            id: 'dataset-size',
            name: 'Dataset Size',
            value: largeDataSet.length,
            unit: 'itens',
            status: largeDataSet.length > 5000 ? 'warning' : 'good',
            description: 'Tamanho do dataset virtualizado'
        },
    ];

    // Render item for virtualized list
    const renderListItem = useCallback((item: ListItem, index: number) => {
        return (
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {item.value.toFixed(2)}
                        </div>
                        <Badge variant={item.status === 'active' ? 'success' : 'secondary'}>
                            {item.status}
                        </Badge>
                    </div>
                </div>
            </div>
        );
    }, []);

    // Create lazy components
    const LazyAlert = LazyComponent(() => Promise.resolve({
        default: () => (
            <Alert>
                <CheckCircleIcon className="w-4 h-4" />
                <span>Este componente foi carregado dinamicamente!</span>
            </Alert>
        )
    }));

    const LazyCard = LazyComponent(() => Promise.resolve({
        default: () => (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
                <h3 className="font-semibold">Componente Lazy #2</h3>
                <p>Este é outro exemplo de carregamento lazy!</p>
            </div>
        )
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Performance Monitor
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Demonstração das otimizações de performance implementadas
                </p>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentMetrics.map((metric) => (
                    <Card key={metric.id} className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                {getStatusIcon(metric.status)}
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                    {metric.name}
                                </h3>
                            </div>
                            <Badge className={getStatusColor(metric.status)}>
                                {metric.status}
                            </Badge>
                        </div>

                        <div className="mt-4">
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {metric.value.toFixed(0)} {metric.unit}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {metric.description}
                            </p>
                        </div>

                        {/* Progress bar for visual representation */}
                        <div className="mt-4">
                            <Progress
                                value={Math.min(metric.value / (metric.id === 'memory' ? 200 : 5000) * 100, 100)}
                                className="w-full"
                            />
                        </div>
                    </Card>
                ))}
            </div>

            {/* Memory Usage Details */}
            <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                    <CpuChipIcon className="w-5 h-5 text-blue-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Detalhes de Memória
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Memória Usada
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {memoryStats.used.toFixed(1)} MB
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Limite de Memória
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {memoryStats.limit.toFixed(1)} MB
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Porcentagem Usada
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {((memoryStats.used / memoryStats.limit) * 100).toFixed(1)}%
                        </div>
                    </div>
                </div>
            </Card>

            {/* Lazy Loading Demo */}
            <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                    <ChartBarIcon className="w-5 h-5 text-green-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Lazy Loading Demo
                    </h2>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Componentes são carregados apenas quando necessário para melhorar performance.
                </p>

                <Button
                    onClick={() => setShowLazyComponents(!showLazyComponents)}
                    className="mb-4"
                >
                    {showLazyComponents ? 'Ocultar' : 'Mostrar'} Componentes Lazy
                </Button>

                {showLazyComponents && (
                    <div className="space-y-4">
                        <LazyAlert />
                        <LazyCard />
                    </div>
                )}
            </Card>

            {/* Virtualized List Demo */}
            <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                    <ChartBarIcon className="w-5 h-5 text-purple-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Lista Virtualizada ({largeDataSet.length.toLocaleString()} itens)
                    </h2>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Esta lista contém {largeDataSet.length.toLocaleString()} itens mas renderiza apenas os visíveis para otimizar performance.
                </p>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <VirtualizedList
                        items={largeDataSet}
                        itemHeight={80}
                        containerHeight={400}
                        renderItem={renderListItem}
                    />
                </div>

                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Total de itens: {largeDataSet.length.toLocaleString()}
                </div>
            </Card>

            {/* Performance Operations */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Teste de Performance
                </h2>

                <Button
                    onClick={() => {
                        const time = runExpensiveOperation();
                        alert(`Operação executada em ${time.toFixed(2)}ms`);
                    }}
                >
                    Executar Operação Custosa
                </Button>
            </Card>

            {/* Performance Tips */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Otimizações Implementadas
                </h2>

                <div className="space-y-3">
                    <Alert>
                        <CheckCircleIcon className="w-4 h-4" />
                        <span><strong>Lazy Loading:</strong> Componentes carregados sob demanda</span>
                    </Alert>

                    <Alert>
                        <CheckCircleIcon className="w-4 h-4" />
                        <span><strong>Virtualização:</strong> Renderização eficiente de listas grandes</span>
                    </Alert>

                    <Alert>
                        <CheckCircleIcon className="w-4 h-4" />
                        <span><strong>Code Splitting:</strong> Divisão automática do código pelo Next.js</span>
                    </Alert>

                    <Alert>
                        <CheckCircleIcon className="w-4 h-4" />
                        <span><strong>Monitoramento:</strong> Tracking contínuo de performance e memória</span>
                    </Alert>

                    <Alert>
                        <CheckCircleIcon className="w-4 h-4" />
                        <span><strong>Dark Mode:</strong> Sistema de temas otimizado com CSS variables</span>
                    </Alert>

                    <Alert>
                        <CheckCircleIcon className="w-4 h-4" />
                        <span><strong>Error Boundaries:</strong> Tratamento robusto de erros</span>
                    </Alert>
                </div>
            </Card>
        </div>
    );
};

export default PerformanceDemo;
