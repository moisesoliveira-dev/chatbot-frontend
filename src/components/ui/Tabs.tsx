'use client';

import React from 'react';
import { clsx } from 'clsx';

interface TabItem {
    id: string;
    label: string;
    content: React.ReactNode;
    disabled?: boolean;
    icon?: React.ReactNode;
    badge?: string | number;
}

interface TabsProps {
    items: TabItem[];
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    variant?: 'default' | 'pills' | 'underline';
    size?: 'sm' | 'md' | 'lg';
    orientation?: 'horizontal' | 'vertical';
    className?: string;
    tabListClassName?: string;
    tabClassName?: string;
    tabPanelClassName?: string;
}

export const Tabs: React.FC<TabsProps> = ({
    items,
    defaultValue,
    value,
    onValueChange,
    variant = 'default',
    size = 'md',
    orientation = 'horizontal',
    className,
    tabListClassName,
    tabClassName,
    tabPanelClassName,
}) => {
    const [activeTab, setActiveTab] = React.useState(
        value || defaultValue || items[0]?.id || ''
    );

    React.useEffect(() => {
        if (value !== undefined) {
            setActiveTab(value);
        }
    }, [value]);

    const handleTabChange = (tabId: string) => {
        if (items.find(item => item.id === tabId)?.disabled) return;

        setActiveTab(tabId);
        onValueChange?.(tabId);
    };

    const activeItem = items.find(item => item.id === activeTab);

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-2',
        lg: 'text-base px-4 py-3'
    };

    const getTabClasses = (item: TabItem, isActive: boolean) => {
        const baseClasses = clsx(
            'flex items-center space-x-2 font-medium transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            sizeClasses[size],
            {
                'cursor-pointer': !item.disabled,
                'cursor-not-allowed opacity-50': item.disabled,
            }
        );

        if (variant === 'pills') {
            return clsx(
                baseClasses,
                'rounded-md',
                {
                    'bg-blue-100 text-blue-700': isActive && !item.disabled,
                    'text-gray-500 hover:text-gray-700 hover:bg-gray-100': !isActive && !item.disabled,
                    'text-gray-400': item.disabled,
                }
            );
        }

        if (variant === 'underline') {
            return clsx(
                baseClasses,
                'border-b-2 rounded-none',
                {
                    'border-blue-500 text-blue-600': isActive && !item.disabled,
                    'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': !isActive && !item.disabled,
                    'border-transparent text-gray-400': item.disabled,
                }
            );
        }

        // Default variant
        return clsx(
            baseClasses,
            'border rounded-t-md border-b-0',
            {
                'bg-white border-gray-300 text-gray-900': isActive && !item.disabled,
                'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700': !isActive && !item.disabled,
                'bg-gray-50 border-gray-200 text-gray-400': item.disabled,
            }
        );
    };

    const getTabListClasses = () => {
        const baseClasses = clsx(
            'flex',
            {
                'flex-col space-y-1': orientation === 'vertical',
                'space-x-1': orientation === 'horizontal' && variant === 'pills',
                'space-x-0': orientation === 'horizontal' && variant !== 'pills',
            }
        );

        if (variant === 'underline') {
            return clsx(baseClasses, 'border-b border-gray-200');
        }

        if (variant === 'default') {
            return clsx(baseClasses, 'border-b border-gray-300');
        }

        return baseClasses;
    };

    const getContainerClasses = () => {
        return clsx(
            {
                'flex space-x-6': orientation === 'vertical',
                'space-y-4': orientation === 'horizontal',
            },
            className
        );
    };

    if (orientation === 'vertical') {
        return (
            <div className={getContainerClasses()}>
                <div className={clsx('flex-shrink-0', tabListClassName)}>
                    <nav className={getTabListClasses()} role="tablist">
                        {items.map((item) => {
                            const isActive = item.id === activeTab;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    aria-controls={`panel-${item.id}`}
                                    id={`tab-${item.id}`}
                                    disabled={item.disabled}
                                    onClick={() => handleTabChange(item.id)}
                                    className={clsx(getTabClasses(item, isActive), tabClassName)}
                                >
                                    {item.icon && <span>{item.icon}</span>}
                                    <span>{item.label}</span>
                                    {item.badge && (
                                        <span className="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-1">
                    {activeItem && (
                        <div
                            key={activeItem.id}
                            role="tabpanel"
                            id={`panel-${activeItem.id}`}
                            aria-labelledby={`tab-${activeItem.id}`}
                            className={tabPanelClassName}
                        >
                            {activeItem.content}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={getContainerClasses()}>
            <div className={tabListClassName}>
                <nav className={getTabListClasses()} role="tablist">
                    {items.map((item) => {
                        const isActive = item.id === activeTab;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`panel-${item.id}`}
                                id={`tab-${item.id}`}
                                disabled={item.disabled}
                                onClick={() => handleTabChange(item.id)}
                                className={clsx(getTabClasses(item, isActive), tabClassName)}
                            >
                                {item.icon && <span>{item.icon}</span>}
                                <span>{item.label}</span>
                                {item.badge && (
                                    <span className="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
            <div>
                {activeItem && (
                    <div
                        key={activeItem.id}
                        role="tabpanel"
                        id={`panel-${activeItem.id}`}
                        aria-labelledby={`tab-${activeItem.id}`}
                        className={tabPanelClassName}
                    >
                        {activeItem.content}
                    </div>
                )}
            </div>
        </div>
    );
};
