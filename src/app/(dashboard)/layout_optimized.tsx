'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { GuidedTour } from '@/components/ui/GuidedTour';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ShortcutsHelp } from '@/components/ui/ShortcutsHelp';
import { Toaster } from 'react-hot-toast';

const tourSteps = [
    {
        id: 'sidebar',
        target: '.sidebar',
        title: 'Navegação Principal',
        content: 'Use a barra lateral para navegar entre as diferentes seções do sistema.',
        position: 'right' as const,
    },
    {
        id: 'header',
        target: '.header',
        title: 'Cabeçalho',
        content: 'Acesse configurações, notificações e seu perfil através do cabeçalho.',
        position: 'bottom' as const,
    },
    {
        id: 'dashboard',
        target: '[data-tour="dashboard"]',
        title: 'Dashboard',
        content: 'Visualize estatísticas e métricas importantes do seu chatbot.',
        position: 'bottom' as const,
    },
    {
        id: 'conversations',
        target: '[data-tour="conversations"]',
        title: 'Conversas',
        content: 'Monitore e gerencie todas as conversas do chatbot.',
        position: 'bottom' as const,
    },
    {
        id: 'templates',
        target: '[data-tour="templates"]',
        title: 'Templates',
        content: 'Crie e edite templates de mensagens para o chatbot.',
        position: 'bottom' as const,
    },
    {
        id: 'analytics',
        target: '[data-tour="analytics"]',
        title: 'Analytics',
        content: 'Analise o desempenho e obtenha insights detalhados.',
        position: 'bottom' as const,
    },
    {
        id: 'theme-toggle',
        target: '[data-tour="theme-toggle"]',
        title: 'Alternar Tema',
        content: 'Mude entre tema claro e escuro conforme sua preferência.',
        position: 'left' as const,
    },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showGuidedTour, setShowGuidedTour] = useState(false);
    const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

    useEffect(() => {
        // Check if user is new and should see the tour
        const hasSeenTour = localStorage.getItem('hasSeenGuidedTour');
        if (!hasSeenTour) {
            // Show tour after a brief delay to let the page load
            setTimeout(() => setShowGuidedTour(true), 1000);
        }

        // Listen for keyboard shortcuts to show help
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '?' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                setShowShortcutsHelp(true);
            }
            if (e.key === 'h' && e.altKey) {
                e.preventDefault();
                setShowGuidedTour(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            {/* Sidebar para desktop */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64 sidebar">
                    <Sidebar />
                </div>
            </div>

            {/* Sidebar móvel */}
            <div className="md:hidden">
                <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}>
                    <div
                        className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-800 dark:bg-opacity-75"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}>
                        <Sidebar />
                    </div>
                </div>
            </div>

            {/* Área principal */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <div className="header">
                    <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                </div>

                <main className="flex-1 relative overflow-y-auto focus:outline-none bg-white dark:bg-gray-900 transition-colors duration-200">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            {/* Theme Toggle - Fixed position */}
            <div className="fixed bottom-4 right-4 z-30" data-tour="theme-toggle">
                <ThemeToggle />
            </div>

            {/* Help Button - Fixed position */}
            <div className="fixed bottom-4 right-20 z-30">
                <button
                    onClick={() => setShowShortcutsHelp(true)}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                    title="Ajuda e Atalhos (Ctrl+?)"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>

            {/* Tour Button - Fixed position */}
            <div className="fixed bottom-4 right-36 z-30">
                <button
                    onClick={() => setShowGuidedTour(true)}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                    title="Tour Guiado (Alt+H)"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </button>
            </div>

            {/* Guided Tour */}
            <GuidedTour
                steps={tourSteps}
                tourKey="dashboard-tour"
                autoStart={showGuidedTour}
                onComplete={() => {
                    setShowGuidedTour(false);
                    localStorage.setItem('hasSeenGuidedTour', 'true');
                }}
                onSkip={() => {
                    setShowGuidedTour(false);
                    localStorage.setItem('hasSeenGuidedTour', 'true');
                }}
            />

            {/* Shortcuts Help Modal */}
            <div className={showShortcutsHelp ? 'block' : 'hidden'}>
                <ShortcutsHelp />
            </div>

            {/* Toast notifications with dark mode support */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'var(--toast-bg)',
                        color: 'var(--toast-color)',
                        border: '1px solid var(--toast-border)',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#22c55e',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 5000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            {/* CSS Variables for toast styling */}
            <style jsx global>{`
                :root {
                    --toast-bg: #363636;
                    --toast-color: #fff;
                    --toast-border: #4a4a4a;
                }
                
                [data-theme="light"] {
                    --toast-bg: #ffffff;
                    --toast-color: #1f2937;
                    --toast-border: #d1d5db;
                }
                
                [data-theme="dark"] {
                    --toast-bg: #374151;
                    --toast-color: #f9fafb;
                    --toast-border: #6b7280;
                }
            `}</style>
        </div>
    );
}
