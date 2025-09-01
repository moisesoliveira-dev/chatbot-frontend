'use client';

import React, { createContext, useContext, useCallback } from 'react';

interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    action: () => void;
    description: string;
    category?: string;
}

interface KeyboardShortcutsContextType {
    shortcuts: KeyboardShortcut[];
    registerShortcut: (shortcut: KeyboardShortcut) => void;
    unregisterShortcut: (key: string) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export const useKeyboardShortcuts = () => {
    const context = useContext(KeyboardShortcutsContext);
    if (!context) {
        throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
    }
    return context;
};

interface KeyboardShortcutsProviderProps {
    children: React.ReactNode;
}

const defaultShortcuts: KeyboardShortcut[] = [
    {
        key: '/',
        action: () => {
            const searchInput = document.querySelector('input[type="search"], input[placeholder*="Buscar"], input[placeholder*="Search"]') as HTMLInputElement;
            if (searchInput) {
                searchInput.focus();
            }
        },
        description: 'Focar no campo de busca',
        category: 'Navegação'
    },
    {
        key: 'Escape',
        action: () => {
            // Close modals, dropdowns, etc.
            const activeModal = document.querySelector('[role="dialog"]:not([hidden])');
            if (activeModal) {
                const closeButton = activeModal.querySelector('[aria-label*="Close"], [aria-label*="Fechar"], .modal-close') as HTMLButtonElement;
                if (closeButton) {
                    closeButton.click();
                }
            }
        },
        description: 'Fechar modais e dropdowns',
        category: 'Navegação'
    },
    {
        key: '?',
        shiftKey: true,
        action: () => {
            // Show keyboard shortcuts help
            window.dispatchEvent(new CustomEvent('show-shortcuts-help'));
        },
        description: 'Mostrar atalhos de teclado',
        category: 'Ajuda'
    }
];

export const KeyboardShortcutsProvider: React.FC<KeyboardShortcutsProviderProps> = ({ children }) => {
    const [shortcuts, setShortcuts] = React.useState<KeyboardShortcut[]>(defaultShortcuts);

    const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
        setShortcuts(prev => [...prev.filter(s => s.key !== shortcut.key), shortcut]);
    }, []);

    const unregisterShortcut = useCallback((key: string) => {
        setShortcuts(prev => prev.filter(s => s.key !== key));
    }, []);

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                event.target instanceof HTMLSelectElement ||
                (event.target as HTMLElement)?.contentEditable === 'true'
            ) {
                // Exception for Escape key - always allow it
                if (event.key !== 'Escape') {
                    return;
                }
            }

            const matchingShortcut = shortcuts.find(shortcut => {
                return (
                    shortcut.key.toLowerCase() === event.key.toLowerCase() &&
                    !!shortcut.ctrlKey === event.ctrlKey &&
                    !!shortcut.shiftKey === event.shiftKey &&
                    !!shortcut.altKey === event.altKey &&
                    !!shortcut.metaKey === event.metaKey
                );
            });

            if (matchingShortcut) {
                event.preventDefault();
                event.stopPropagation();
                matchingShortcut.action();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);

    const value: KeyboardShortcutsContextType = {
        shortcuts,
        registerShortcut,
        unregisterShortcut
    };

    return (
        <KeyboardShortcutsContext.Provider value={value}>
            {children}
        </KeyboardShortcutsContext.Provider>
    );
};
