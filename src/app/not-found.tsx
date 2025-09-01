'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
    ExclamationTriangleIcon,
    HomeIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                <div className="mb-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
                        <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>

                    <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                        404
                    </h1>

                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
                        Página não encontrada
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Desculpe, a página que você está procurando não existe ou foi removida.
                        Verifique a URL ou use os links abaixo para navegar.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link href="/dashboard">
                        <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
                            <HomeIcon className="w-5 h-5" />
                            Voltar ao Dashboard
                        </Button>
                    </Link>

                    <Link href="/">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            Voltar à página inicial
                        </Button>
                    </Link>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Links úteis
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <Link
                            href="/dashboard"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/dashboard/templates"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Templates
                        </Link>
                        <Link
                            href="/dashboard/conversations"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Conversas
                        </Link>
                        <Link
                            href="/dashboard/settings"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Configurações
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
