'use client';

import { Bars3Icon } from '@heroicons/react/24/outline';
import Breadcrumb from './Breadcrumb';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    return (
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
            {/* Menu button para mobile */}
            <button
                type="button"
                className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
                onClick={onMenuClick}
            >
                <span className="sr-only">Abrir sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Breadcrumb e conteúdo principal */}
            <div className="flex-1 px-4 flex justify-between items-center">
                <div className="flex-1">
                    <Breadcrumb />
                </div>

                {/* Actions do lado direito */}
                <div className="ml-4 flex items-center md:ml-6">
                    {/* Status do sistema */}
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                            <div className="h-2 w-2 bg-success-500 rounded-full"></div>
                            <span className="ml-1 text-xs text-gray-500">Sistema Online</span>
                        </div>
                    </div>

                    {/* Menu do usuário - placeholder */}
                    <div className="ml-3 relative">
                        <div className="flex items-center">
                            <span className="text-sm text-gray-700">Admin</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
