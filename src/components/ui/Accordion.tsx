'use client';

import React, { useState, createContext, useContext } from 'react';
import { clsx } from 'clsx';

interface AccordionContextType {
    openItems: string[];
    toggleItem: (value: string) => void;
    multiple: boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

interface AccordionProps {
    children: React.ReactNode;
    type?: 'single' | 'multiple';
    defaultValue?: string | string[];
    className?: string;
}

interface AccordionItemProps {
    children: React.ReactNode;
    value: string;
    className?: string;
}

interface AccordionTriggerProps {
    children: React.ReactNode;
    className?: string;
}

interface AccordionContentProps {
    children: React.ReactNode;
    className?: string;
}

const useAccordion = () => {
    const context = useContext(AccordionContext);
    if (!context) {
        throw new Error('Accordion components must be used within an Accordion');
    }
    return context;
};

export const Accordion: React.FC<AccordionProps> = ({
    children,
    type = 'single',
    defaultValue,
    className,
}) => {
    const multiple = type === 'multiple';

    const [openItems, setOpenItems] = useState<string[]>(() => {
        if (!defaultValue) return [];
        return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    });

    const toggleItem = (value: string) => {
        setOpenItems(prev => {
            if (multiple) {
                return prev.includes(value)
                    ? prev.filter(item => item !== value)
                    : [...prev, value];
            } else {
                return prev.includes(value) ? [] : [value];
            }
        });
    };

    return (
        <AccordionContext.Provider value={{ openItems, toggleItem, multiple }}>
            <div className={clsx('border border-gray-200 rounded-md', className)}>
                {children}
            </div>
        </AccordionContext.Provider>
    );
};

const AccordionItemContext = createContext<{ value: string; isOpen: boolean } | undefined>(undefined);

export const AccordionItem: React.FC<AccordionItemProps> = ({
    children,
    value,
    className,
}) => {
    const { openItems } = useAccordion();
    const isOpen = openItems.includes(value);

    return (
        <AccordionItemContext.Provider value={{ value, isOpen }}>
            <div className={clsx('border-b border-gray-200 last:border-b-0', className)}>
                {children}
            </div>
        </AccordionItemContext.Provider>
    );
};

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
    children,
    className,
}) => {
    const { toggleItem } = useAccordion();
    const itemContext = useContext(AccordionItemContext);

    if (!itemContext) {
        throw new Error('AccordionTrigger must be used within an AccordionItem');
    }

    const { value, isOpen } = itemContext;

    return (
        <button
            type="button"
            onClick={() => toggleItem(value)}
            className={clsx(
                'flex w-full items-center justify-between p-4 text-left',
                'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
                'transition-colors duration-200',
                className
            )}
        >
            <span className="text-sm font-medium text-gray-900">{children}</span>
            <svg
                className={clsx(
                    'h-4 w-4 text-gray-400 transition-transform duration-200',
                    {
                        'rotate-180': isOpen,
                    }
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    );
};

export const AccordionContent: React.FC<AccordionContentProps> = ({
    children,
    className,
}) => {
    const itemContext = useContext(AccordionItemContext);

    if (!itemContext) {
        throw new Error('AccordionContent must be used within an AccordionItem');
    }

    const { isOpen } = itemContext;

    return (
        <div
            className={clsx(
                'overflow-hidden transition-all duration-200',
                {
                    'max-h-0': !isOpen,
                    'max-h-[1000px]': isOpen,
                }
            )}
        >
            <div className={clsx('p-4 pt-0 text-sm text-gray-700', className)}>
                {children}
            </div>
        </div>
    );
};
