'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Button } from './Button';
import {
    SunIcon,
    MoonIcon,
    ComputerDesktopIcon
} from '@heroicons/react/24/outline';

interface ThemeToggleProps {
    variant?: 'button' | 'dropdown' | 'compact';
    className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
    variant = 'button',
    className = ''
}) => {
    const { theme, setTheme, isDark } = useTheme();

    if (variant === 'compact') {
        return (
            <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
                aria-label="Toggle theme"
            >
                {isDark ? (
                    <SunIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                    <MoonIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
            </button>
        );
    }

    if (variant === 'dropdown') {
        return (
            <div className={`relative ${className}`}>
                <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                    className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                    <option value="system">Sistema</option>
                </select>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
            <Button
                variant={theme === 'light' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex items-center gap-2 px-3"
            >
                <SunIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Claro</span>
            </Button>

            <Button
                variant={theme === 'dark' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex items-center gap-2 px-3"
            >
                <MoonIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Escuro</span>
            </Button>

            <Button
                variant={theme === 'system' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTheme('system')}
                className="flex items-center gap-2 px-3"
            >
                <ComputerDesktopIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Auto</span>
            </Button>
        </div>
    );
};
