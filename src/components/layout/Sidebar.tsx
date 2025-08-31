'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HomeIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
    ChartBarIcon,
    CogIcon,
    Squares2X2Icon,
    DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Templates', href: '/templates', icon: DocumentTextIcon },
    { name: 'Conversas', href: '/conversations', icon: ChatBubbleLeftRightIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Relatórios', href: '/reports', icon: DocumentChartBarIcon },
    { name: 'Configurações', href: '/settings', icon: CogIcon },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
            {/* Logo */}
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                    <div className="flex items-center">
                        <Squares2X2Icon className="h-8 w-8 text-primary-600" />
                        <span className="ml-2 text-xl font-bold text-gray-900">
                            Chatbot Admin
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="mt-8 flex-1 px-2 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                                    isActive
                                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                <item.icon
                                    className={clsx(
                                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200',
                                        isActive
                                            ? 'text-primary-600'
                                            : 'text-gray-400 group-hover:text-gray-500'
                                    )}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex-shrink-0 w-full group block">
                    <div className="flex items-center">
                        <div className="ml-3">
                            <p className="text-xs text-gray-500">
                                Versão {process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
                            </p>
                            <p className="text-xs text-gray-400">
                                {process.env.NEXT_PUBLIC_ENVIRONMENT || 'development'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
