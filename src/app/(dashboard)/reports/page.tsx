'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { ReportBuilder, ScheduleManager } from '@/components/reports';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('builder');

    const tabItems = [
        {
            id: 'builder',
            label: 'Construtor de Relatórios',
            content: (
                <ReportBuilder className="mt-6" />
            )
        },
        {
            id: 'schedule',
            label: 'Agendamentos',
            content: (
                <ScheduleManager className="mt-6" />
            )
        },
        {
            id: 'history',
            label: 'Histórico',
            content: (
                <Card className="mt-6">
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Histórico de Relatórios
                        </h3>
                        <p className="text-sm text-gray-600">
                            Visualize os relatórios gerados anteriormente
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-5xl mb-4">📊</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Histórico de Relatórios
                            </h3>
                            <p className="text-gray-600">
                                Os relatórios gerados aparecerão aqui
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Relatórios
                </h1>
                <p className="text-gray-600">
                    Crie, agende e gerencie relatórios personalizados do seu chatbot
                </p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Relatórios Criados</p>
                                <p className="text-2xl font-semibold text-gray-900">12</p>
                            </div>
                            <div className="text-blue-500 text-2xl">📊</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Agendamentos Ativos</p>
                                <p className="text-2xl font-semibold text-gray-900">3</p>
                            </div>
                            <div className="text-green-500 text-2xl">⏰</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Última Execução</p>
                                <p className="text-sm font-medium text-gray-900">Hoje, 08:00</p>
                            </div>
                            <div className="text-purple-500 text-2xl">🚀</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Formatos Disponíveis</p>
                                <p className="text-sm font-medium text-gray-900">PDF, Excel</p>
                            </div>
                            <div className="text-orange-500 text-2xl">📄</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs
                defaultValue="builder"
                value={activeTab}
                onValueChange={setActiveTab}
                items={tabItems}
                className="space-y-0"
            />
        </div>
    );
}
