'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';

interface BreadcrumbItem {
    name: string;
    href?: string;
    current: boolean;
}

function generateBreadcrumb(pathname: string): BreadcrumbItem[] {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Adicionar home
    breadcrumbs.push({
        name: 'Dashboard',
        href: '/dashboard',
        current: false,
    });

    // Mapear segmentos para nomes amigáveis
    const segmentNames: { [key: string]: string } = {
        'dashboard': 'Dashboard',
        'templates': 'Templates',
        'flows': 'Fluxos',
        'conversations': 'Conversas',
        'analytics': 'Analytics',
        'settings': 'Configurações',
        'new': 'Novo',
        'edit': 'Editar',
    };

    let currentPath = '';

    segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === segments.length - 1;

        // Verificar se é um ID (número)
        if (/^\d+$/.test(segment)) {
            breadcrumbs.push({
                name: `#${segment}`,
                href: isLast ? undefined : currentPath,
                current: isLast,
            });
        } else {
            const name = segmentNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
            breadcrumbs.push({
                name,
                href: isLast ? undefined : currentPath,
                current: isLast,
            });
        }
    });

    return breadcrumbs;
}

export default function Breadcrumb() {
    const pathname = usePathname();
    const breadcrumbs = generateBreadcrumb(pathname);

    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-1">
                {breadcrumbs.map((item, index) => (
                    <li key={item.name} className="flex">
                        {index === 0 ? (
                            <div className="flex items-center">
                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                                    >
                                        <HomeIcon className="flex-shrink-0 h-4 w-4" aria-hidden="true" />
                                        <span className="sr-only">{item.name}</span>
                                    </Link>
                                ) : (
                                    <HomeIcon className="flex-shrink-0 h-4 w-4 text-gray-400" aria-hidden="true" />
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <ChevronRightIcon className="flex-shrink-0 h-4 w-4 text-gray-400 mx-1" aria-hidden="true" />
                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                    >
                                        {item.name}
                                    </Link>
                                ) : (
                                    <span className="text-sm font-medium text-gray-900">
                                        {item.name}
                                    </span>
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
