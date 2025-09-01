'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
    ExclamationTriangleIcon,
    ArrowPathIcon,
    HomeIcon
} from '@heroicons/react/24/outline';

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);

        // In production, you could send this to an external service
        if (process.env.NODE_ENV === 'production') {
            // Example: logErrorToService(error);
        }
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                <div className="mb-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
                        <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Algo deu errado!
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada
                        e está trabalhando para resolver o problema.
                    </p>

                    {error.message && (
                        <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                                {error.message}
                            </p>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={reset}
                        className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        Tentar novamente
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => window.location.href = '/dashboard'}
                        className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        <HomeIcon className="w-5 h-5" />
                        Voltar ao Dashboard
                    </Button>
                </div>

                <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                    {error.digest && (
                        <p>ID do erro: <code className="font-mono">{error.digest}</code></p>
                    )}
                </div>
            </div>
        </div>
    );
}
