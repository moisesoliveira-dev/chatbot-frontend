'use client';

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface DropdownItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    divider?: boolean;
    onClick?: () => void;
    href?: string;
    items?: DropdownItem[]; // For submenus
}

interface DropdownMenuProps {
    trigger: React.ReactNode;
    items: DropdownItem[];
    position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    className?: string;
    menuClassName?: string;
    disabled?: boolean;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
    trigger,
    items,
    position = 'bottom-left',
    className,
    menuClassName,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setOpenSubmenus(new Set());
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                setOpenSubmenus(new Set());
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const handleTriggerClick = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
        setOpenSubmenus(new Set());
    };

    const handleItemClick = (item: DropdownItem) => {
        if (item.disabled) return;

        if (item.items) {
            // Toggle submenu
            setOpenSubmenus(prev => {
                const newSet = new Set(prev);
                if (newSet.has(item.id)) {
                    newSet.delete(item.id);
                } else {
                    newSet.add(item.id);
                }
                return newSet;
            });
        } else {
            // Execute action and close menu
            item.onClick?.();
            setIsOpen(false);
            setOpenSubmenus(new Set());
        }
    };

    const getMenuPosition = () => {
        const positions = {
            'bottom-left': 'top-full left-0 mt-2',
            'bottom-right': 'top-full right-0 mt-2',
            'top-left': 'bottom-full left-0 mb-2',
            'top-right': 'bottom-full right-0 mb-2',
        };
        return positions[position];
    };

    const renderItems = (menuItems: DropdownItem[], level = 0) => {
        return menuItems.map((item, index) => {
            if (item.divider) {
                return <div key={`divider-${index}`} className="border-t border-gray-200 my-1" />;
            }

            const hasSubmenu = item.items && item.items.length > 0;
            const isSubmenuOpen = openSubmenus.has(item.id);

            return (
                <div key={item.id} className="relative">
                    <button
                        type="button"
                        onClick={() => handleItemClick(item)}
                        disabled={item.disabled}
                        className={clsx(
                            'w-full text-left px-3 py-2 text-sm transition-colors duration-150',
                            'flex items-center justify-between',
                            {
                                'text-gray-900 hover:bg-gray-100': !item.disabled,
                                'text-gray-400 cursor-not-allowed': item.disabled,
                                'bg-gray-100': hasSubmenu && isSubmenuOpen,
                            }
                        )}
                    >
                        <div className="flex items-center space-x-2">
                            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                            <span>{item.label}</span>
                        </div>
                        {hasSubmenu && (
                            <svg
                                className={clsx(
                                    'w-4 h-4 transition-transform duration-150',
                                    { 'rotate-90': isSubmenuOpen }
                                )}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>

                    {/* Submenu */}
                    {hasSubmenu && isSubmenuOpen && (
                        <div className="pl-4 border-l border-gray-200 ml-3">
                            {renderItems(item.items!, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div ref={dropdownRef} className={clsx('relative inline-block', className)}>
            <div
                onClick={handleTriggerClick}
                className={clsx(
                    'cursor-pointer',
                    {
                        'cursor-not-allowed opacity-50': disabled,
                    }
                )}
            >
                {trigger}
            </div>

            {isOpen && !disabled && (
                <div
                    className={clsx(
                        'absolute z-50 min-w-[12rem] bg-white border border-gray-200 rounded-md shadow-lg',
                        'transform transition-all duration-150 ease-out',
                        'animate-in fade-in-0 zoom-in-95',
                        getMenuPosition(),
                        menuClassName
                    )}
                >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {renderItems(items)}
                    </div>
                </div>
            )}
        </div>
    );
};
