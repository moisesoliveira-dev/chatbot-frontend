'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
    ExclamationTriangleIcon,
    HomeIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo);

        // Log error to external service (in production)
        if (process.env.NODE_ENV === 'production') {
            // Example: Sentry, LogRocket, etc.
            // logErrorToService(error, errorInfo);
        }

        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            const CustomFallback = this.props.fallback;

            if (CustomFallback) {
                return (
                    <CustomFallback
                        error={this.state.error!}
                        reset={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                    />
                );
            }

            return <DefaultErrorFallback
                error={this.state.error!}
                errorInfo={this.state.errorInfo}
                reset={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            />;
        }

        return this.props.children;
    }
}

interface DefaultErrorFallbackProps {
    error: Error;
    errorInfo: React.ErrorInfo | null;
    reset: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
    error,
    errorInfo,
    reset
}) => {
    const [showDetails, setShowDetails] = React.useState(false);

    const copyErrorToClipboard = async () => {
        const errorText = `
Error: ${error.name}
Message: ${error.message}
Stack: ${error.stack}
Component Stack: ${errorInfo?.componentStack}
    `.trim();

        try {
            await navigator.clipboard.writeText(errorText);
            // Could show a toast here
        } catch (err) {
            console.error('Failed to copy error to clipboard', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>

                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Ops! Algo deu errado
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando na correção.
                    </p>

                    <div className="space-y-3 mb-6">
                        <Button
                            onClick={reset}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                            Tentar Novamente
                        </Button>

                        <Link href="/">
                            <Button
                                variant="secondary"
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <HomeIcon className="w-4 h-4" />
                                Voltar ao Início
                            </Button>
                        </Link>
                    </div>

                    {/* Error Details Toggle */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                            {showDetails ? 'Ocultar' : 'Mostrar'} detalhes técnicos
                        </button>

                        {showDetails && (
                            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left">
                                <div className="mb-3">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                        Erro:
                                    </h4>
                                    <p className="text-sm text-red-600 dark:text-red-400 font-mono">
                                        {error.name}: {error.message}
                                    </p>
                                </div>

                                {error.stack && (
                                    <div className="mb-3">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                            Stack Trace:
                                        </h4>
                                        <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-32 overflow-y-auto">
                                            {error.stack}
                                        </pre>
                                    </div>
                                )}

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={copyErrorToClipboard}
                                    className="w-full"
                                >
                                    Copiar Detalhes do Erro
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Hook version for functional components
export const useErrorBoundary = () => {
    const [error, setError] = React.useState<Error | null>(null);

    const resetError = React.useCallback(() => {
        setError(null);
    }, []);

    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    const captureError = React.useCallback((error: Error) => {
        setError(error);
    }, []);

    return { captureError, resetError };
};

// Main export
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback }) => {
    return (
        <ErrorBoundaryClass fallback={fallback}>
            {children}
        </ErrorBoundaryClass>
    );
};
