'use client';

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps {
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    options: SelectOption[];
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    error?: boolean;
    required?: boolean;
    className?: string;
    name?: string;
}

export const Select: React.FC<SelectProps> = ({
    value,
    defaultValue,
    placeholder = 'Selecione uma opção...',
    options,
    onValueChange,
    disabled = false,
    error = false,
    required = false,
    className,
    name,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(option => option.value === selectedValue);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        setSelectedValue(optionValue);
        setIsOpen(false);
        onValueChange?.(optionValue);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (disabled) return;

        switch (event.key) {
            case 'Enter':
            case 'Space':
                event.preventDefault();
                setIsOpen(!isOpen);
                break;
            case 'Escape':
                setIsOpen(false);
                break;
            case 'ArrowDown':
                event.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                } else {
                    const currentIndex = options.findIndex(option => option.value === selectedValue);
                    const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
                    const nextOption = options[nextIndex];
                    if (!nextOption.disabled) {
                        setSelectedValue(nextOption.value);
                    }
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                } else {
                    const currentIndex = options.findIndex(option => option.value === selectedValue);
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                    const prevOption = options[prevIndex];
                    if (!prevOption.disabled) {
                        setSelectedValue(prevOption.value);
                    }
                }
                break;
        }
    };

    return (
        <div
            ref={selectRef}
            className={clsx(
                'relative w-full',
                className
            )}
        >
            <div
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-required={required}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={handleKeyDown}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={clsx(
                    'flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md cursor-pointer bg-white',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    'transition-colors duration-200',
                    {
                        'border-gray-300 hover:border-gray-400': !error && !disabled,
                        'border-red-500': error,
                        'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-400': disabled,
                        'ring-2 ring-blue-500 border-blue-500': isOpen && !disabled && !error,
                    }
                )}
            >
                <span className={clsx(
                    'block truncate',
                    {
                        'text-gray-500': !selectedOption,
                        'text-gray-900': selectedOption && !disabled,
                        'text-gray-400': disabled
                    }
                )}>
                    {selectedOption?.label || placeholder}
                </span>
                <svg
                    className={clsx(
                        'w-4 h-4 transition-transform duration-200',
                        {
                            'text-gray-400': disabled,
                            'text-gray-500': !disabled,
                            'rotate-180': isOpen
                        }
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul role="listbox" className="py-1">
                        {options.map((option) => (
                            <li
                                key={option.value}
                                role="option"
                                aria-selected={option.value === selectedValue}
                                onClick={() => !option.disabled && handleSelect(option.value)}
                                className={clsx(
                                    'px-3 py-2 text-sm cursor-pointer',
                                    {
                                        'bg-blue-50 text-blue-600': option.value === selectedValue,
                                        'text-gray-900 hover:bg-gray-50': option.value !== selectedValue && !option.disabled,
                                        'text-gray-400 cursor-not-allowed': option.disabled,
                                    }
                                )}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Hidden input for form submission */}
            <input
                type="hidden"
                name={name}
                value={selectedValue}
            />
        </div>
    );
};
