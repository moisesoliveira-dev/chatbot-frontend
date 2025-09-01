'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
    PlayIcon,
    ArrowRightIcon,
    XMarkIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface TourStep {
    id: string;
    title: string;
    content: string;
    target: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    optional?: boolean;
}

interface GuidedTourProps {
    steps: TourStep[];
    onComplete?: () => void;
    onSkip?: () => void;
    autoStart?: boolean;
    tourKey: string;
}

const defaultSteps: TourStep[] = [
    {
        id: 'welcome',
        title: 'Bem-vindo ao ChatBot Admin!',
        content: 'Este tour irá te guiar pelas principais funcionalidades do sistema. Você pode pular a qualquer momento.',
        target: 'body',
        position: 'bottom'
    },
    {
        id: 'dashboard',
        title: 'Dashboard Principal',
        content: 'Aqui você vê um resumo geral do sistema: conversas ativas, métricas e status do bot.',
        target: '[data-tour="dashboard"]',
        position: 'bottom'
    },
    {
        id: 'navigation',
        title: 'Navegação',
        content: 'Use a barra lateral para navegar entre as diferentes seções: Templates, Conversas, Analytics e Configurações.',
        target: '[data-tour="sidebar"]',
        position: 'right'
    },
    {
        id: 'templates',
        title: 'Gerenciamento de Templates',
        content: 'Crie e edite templates de conversa que definem como o bot interage com os usuários.',
        target: '[data-tour="templates"]',
        position: 'right'
    },
    {
        id: 'conversations',
        title: 'Monitoramento de Conversas',
        content: 'Acompanhe conversas ativas e veja o histórico de interações com os usuários.',
        target: '[data-tour="conversations"]',
        position: 'right'
    },
    {
        id: 'settings',
        title: 'Configurações',
        content: 'Configure o sistema, controle o bot e gerencie backups nas configurações.',
        target: '[data-tour="settings"]',
        position: 'right'
    }
];

export const GuidedTour: React.FC<GuidedTourProps> = ({
    steps = defaultSteps,
    onComplete,
    onSkip,
    autoStart = false,
    tourKey
}) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [hasCompletedTour, setHasCompletedTour] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem(`tour-completed-${tourKey}`);
        setHasCompletedTour(!!completed);

        if (autoStart && !completed) {
            const timer = setTimeout(() => {
                setIsActive(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [autoStart, tourKey]);

    const startTour = useCallback(() => {
        setCurrentStep(0);
        setIsActive(true);
    }, []);

    const nextStep = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTour();
        }
    }, [currentStep, steps.length]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }, [currentStep]);

    const skipTour = useCallback(() => {
        setIsActive(false);
        localStorage.setItem(`tour-completed-${tourKey}`, 'true');
        onSkip?.();
    }, [onSkip, tourKey]);

    const completeTour = useCallback(() => {
        setIsActive(false);
        setHasCompletedTour(true);
        localStorage.setItem(`tour-completed-${tourKey}`, 'true');
        onComplete?.();
    }, [onComplete, tourKey]);

    const resetTour = useCallback(() => {
        localStorage.removeItem(`tour-completed-${tourKey}`);
        setHasCompletedTour(false);
        setCurrentStep(0);
    }, [tourKey]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isActive) return;

            switch (event.key) {
                case 'Escape':
                    skipTour();
                    break;
                case 'ArrowRight':
                case ' ':
                    event.preventDefault();
                    nextStep();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    prevStep();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isActive, nextStep, prevStep, skipTour]);

    const highlightElement = useCallback((target: string) => {
        if (target === 'body') return;

        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('tour-highlight');

            const cleanup = () => {
                element.classList.remove('tour-highlight');
            };

            setTimeout(cleanup, 5000);
            return cleanup;
        }
    }, []);

    useEffect(() => {
        if (isActive && steps[currentStep]) {
            const cleanup = highlightElement(steps[currentStep].target);
            return cleanup;
        }
    }, [isActive, currentStep, steps, highlightElement]);

    if (!isActive) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                {!hasCompletedTour && (
                    <Button
                        onClick={startTour}
                        className="flex items-center gap-2 shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <PlayIcon className="w-4 h-4" />
                        Iniciar Tour
                    </Button>
                )}

                {hasCompletedTour && (
                    <Button
                        variant="secondary"
                        onClick={resetTour}
                        className="flex items-center gap-2 shadow-lg"
                    >
                        <PlayIcon className="w-4 h-4" />
                        Repetir Tour
                    </Button>
                )}
            </div>
        );
    }

    const currentStepData = steps[currentStep];
    if (!currentStepData) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 z-40" />

            {/* Tour Modal */}
            <Modal isOpen={isActive} onClose={skipTour} className="z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Badge variant="primary" className="text-sm">
                                    {currentStep + 1} de {steps.length}
                                </Badge>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {currentStepData.title}
                                </h3>
                            </div>
                            <button
                                onClick={skipTour}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="mb-6">
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {currentStepData.content}
                            </p>
                        </div>

                        {/* Progress */}
                        <div className="mb-6">
                            <div className="flex items-center gap-1 mb-2">
                                {steps.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-2 flex-1 rounded ${index <= currentStep
                                                ? 'bg-blue-500'
                                                : 'bg-gray-200 dark:bg-gray-600'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Progresso: {Math.round(((currentStep + 1) / steps.length) * 100)}%
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <div>
                                {currentStep > 0 && (
                                    <Button
                                        variant="secondary"
                                        onClick={prevStep}
                                        size="sm"
                                    >
                                        Anterior
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={skipTour}
                                    size="sm"
                                    className="text-gray-600 dark:text-gray-400"
                                >
                                    Pular Tour
                                </Button>

                                <Button
                                    onClick={nextStep}
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    {currentStep === steps.length - 1 ? (
                                        <>
                                            <CheckCircleIcon className="w-4 h-4" />
                                            Concluir
                                        </>
                                    ) : (
                                        <>
                                            Próximo
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Keyboard shortcuts */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Use as setas ← → ou barra de espaço para navegar. ESC para sair.
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* CSS for highlighting */}
            <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 41;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          border-radius: 8px;
          animation: tour-pulse 2s infinite;
        }
        
        @keyframes tour-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3);
          }
        }
      `}</style>
        </>
    );
};
