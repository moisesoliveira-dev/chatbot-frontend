'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
    ServerIcon,
    HomeIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function ServerError() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                <div className="mb-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
                        <ServerIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>

                    <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                        500
                    </h1>

                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
                        Erro interno do servidor
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Desculpe, algo deu errado no nosso servidor. Nossa equipe de desenvolvimento
                        foi notificada e está trabalhando para resolver o problema.
                    </p>
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        Recarregar página
                    </Button>

                    <Link href="/dashboard">
                        <Button
                            variant="secondary"
                            className="w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                            <HomeIcon className="w-5 h-5" />
                            Voltar ao Dashboard
                        </Button>
                    </Link>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Se o problema persistir, entre em contato com o suporte técnico.
                    </p>
                </div>
            </div>
        </div>
    );
}
