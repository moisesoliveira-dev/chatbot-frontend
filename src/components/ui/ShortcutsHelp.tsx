'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useKeyboardShortcuts } from './KeyboardShortcuts';
import {
    CommandLineIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

interface ShortcutsHelpProps {
    className?: string;
}

export const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({ className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { shortcuts } = useKeyboardShortcuts();

    useEffect(() => {
        const handleShowHelp = () => setIsOpen(true);
        window.addEventListener('show-shortcuts-help', handleShowHelp);
        return () => window.removeEventListener('show-shortcuts-help', handleShowHelp);
    }, []);

    const formatShortcut = (shortcut: any) => {
        const parts = [];

        if (shortcut.ctrlKey) parts.push('Ctrl');
        if (shortcut.metaKey) parts.push('Cmd');
        if (shortcut.altKey) parts.push('Alt');
        if (shortcut.shiftKey) parts.push('Shift');

        // Format special keys
        let key = shortcut.key;
        switch (key.toLowerCase()) {
            case ' ':
                key = 'Space';
                break;
            case 'arrowup':
                key = '↑';
                break;
            case 'arrowdown':
                key = '↓';
                break;
            case 'arrowleft':
                key = '←';
                break;
            case 'arrowright':
                key = '→';
                break;
            case 'enter':
                key = '↵';
                break;
            case 'escape':
                key = 'Esc';
                break;
            default:
                if (key.length === 1) {
                    key = key.toUpperCase();
                }
        }

        parts.push(key);
        return parts;
    };

    const groupedShortcuts = shortcuts.reduce((groups, shortcut) => {
        const category = shortcut.category || 'Geral';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(shortcut);
        return groups;
    }, {} as Record<string, typeof shortcuts>);

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ${className}`}
                title="Atalhos de Teclado (Shift + ?)"
            >
                <CommandLineIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Atalhos</span>
            </button>

            {/* Help Modal */}
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                className="max-w-2xl"
            >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CommandLineIcon className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Atalhos de Teclado
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 max-h-96 overflow-y-auto">
                        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                            <div key={category} className="mb-6 last:mb-0">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                                    {category}
                                </h3>
                                <div className="space-y-3">
                                    {categoryShortcuts.map((shortcut, index) => (
                                        <div
                                            key={`${shortcut.key}-${index}`}
                                            className="flex items-center justify-between"
                                        >
                                            <span className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                                                {shortcut.description}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {formatShortcut(shortcut).map((part, partIndex) => (
                                                    <React.Fragment key={partIndex}>
                                                        {partIndex > 0 && (
                                                            <span className="text-xs text-gray-400 mx-1">+</span>
                                                        )}
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs px-2 py-1 font-mono"
                                                        >
                                                            {part}
                                                        </Badge>
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {Object.keys(groupedShortcuts).length === 0 && (
                            <div className="text-center py-8">
                                <CommandLineIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    Nenhum atalho de teclado disponível
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            Dica: Pressione <Badge variant="secondary" className="mx-1 text-xs">Shift + ?</Badge>
                            a qualquer momento para ver esta ajuda
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
};
