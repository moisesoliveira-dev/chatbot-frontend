'use client';

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface DatePickerProps {
    value?: Date | null;
    onChange?: (date: Date | null) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    className?: string;
    dateFormat?: string;
    minDate?: Date;
    maxDate?: Date;
    showTime?: boolean;
    clearable?: boolean;
}

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    placeholder = 'Selecione uma data',
    disabled = false,
    error = false,
    className,
    dateFormat = 'dd/MM/yyyy',
    minDate,
    maxDate,
    showTime = false,
    clearable = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value || new Date());
    const [inputValue, setInputValue] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (value) {
            setInputValue(formatDate(value));
            setViewDate(value);
        } else {
            setInputValue('');
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
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

    const formatDate = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        if (showTime) {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        }

        return `${day}/${month}/${year}`;
    };

    const parseDate = (dateString: string): Date | null => {
        const parts = dateString.split(/[\/\s:]/);
        if (parts.length < 3) return null;

        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);

        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

        const date = new Date(year, month, day);

        if (showTime && parts.length >= 5) {
            const hours = parseInt(parts[3]) || 0;
            const minutes = parseInt(parts[4]) || 0;
            date.setHours(hours, minutes);
        }

        return date;
    };

    const isDateInRange = (date: Date): boolean => {
        if (minDate && date < minDate) return false;
        if (maxDate && date > maxDate) return false;
        return true;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        const parsedDate = parseDate(newValue);
        if (parsedDate && isDateInRange(parsedDate)) {
            onChange?.(parsedDate);
            setViewDate(parsedDate);
        }
    };

    const handleInputClick = () => {
        if (!disabled) {
            setIsOpen(true);
        }
    };

    const handleDateSelect = (date: Date) => {
        if (!isDateInRange(date)) return;

        const newDate = new Date(date);
        if (showTime && value) {
            newDate.setHours(value.getHours(), value.getMinutes());
        }

        onChange?.(newDate);
        if (!showTime) {
            setIsOpen(false);
        }
    };

    const handleTimeChange = (hours: number, minutes: number) => {
        if (!value) return;

        const newDate = new Date(value);
        newDate.setHours(hours, minutes);
        onChange?.(newDate);
    };

    const handleClear = () => {
        onChange?.(null);
        setInputValue('');
        setIsOpen(false);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setViewDate(newDate);
    };

    const navigateYear = (direction: 'prev' | 'next') => {
        const newDate = new Date(viewDate);
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        setViewDate(newDate);
    };

    const generateCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days: Date[] = [];
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 41); // 6 weeks

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            days.push(new Date(date));
        }

        return days;
    };

    const isSelectedDate = (date: Date): boolean => {
        if (!value) return false;
        return (
            date.getFullYear() === value.getFullYear() &&
            date.getMonth() === value.getMonth() &&
            date.getDate() === value.getDate()
        );
    };

    const isToday = (date: Date): boolean => {
        const today = new Date();
        return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );
    };

    const isCurrentMonth = (date: Date): boolean => {
        return date.getMonth() === viewDate.getMonth();
    };

    return (
        <div ref={containerRef} className={clsx('relative', className)}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onClick={handleInputClick}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={clsx(
                        'w-full px-3 py-2 border rounded-md text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'transition-colors duration-200',
                        {
                            'border-gray-300': !error && !disabled,
                            'border-red-500': error,
                            'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-400': disabled,
                            'pr-20': clearable && value,
                            'pr-10': !clearable || !value,
                        }
                    )}
                />

                <div className="absolute inset-y-0 right-0 flex items-center">
                    {clearable && value && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 text-gray-400 hover:text-gray-600 mr-1"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleInputClick}
                        disabled={disabled}
                        className="p-2 text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 min-w-[300px]">
                    {/* Calendar header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={() => navigateYear('prev')}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigateMonth('prev')}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>

                        <h3 className="text-sm font-medium text-gray-900">
                            {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </h3>

                        <button
                            type="button"
                            onClick={() => navigateMonth('next')}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigateYear('next')}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {WEEKDAYS.map(day => (
                            <div key={day} className="text-xs font-medium text-gray-500 text-center p-2">
                                {day}
                            </div>
                        ))}
                        {generateCalendarDays().map((date, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleDateSelect(date)}
                                disabled={!isDateInRange(date)}
                                className={clsx(
                                    'p-2 text-sm rounded hover:bg-blue-50 transition-colors duration-150',
                                    {
                                        'text-gray-400': !isCurrentMonth(date),
                                        'text-gray-900': isCurrentMonth(date) && !isSelectedDate(date),
                                        'bg-blue-500 text-white': isSelectedDate(date),
                                        'bg-blue-100 text-blue-900': isToday(date) && !isSelectedDate(date),
                                        'cursor-not-allowed opacity-50': !isDateInRange(date),
                                    }
                                )}
                            >
                                {date.getDate()}
                            </button>
                        ))}
                    </div>

                    {/* Time picker */}
                    {showTime && value && (
                        <div className="border-t pt-3 mt-3">
                            <div className="flex items-center justify-center space-x-2">
                                <select
                                    value={value.getHours()}
                                    onChange={(e) => handleTimeChange(parseInt(e.target.value), value.getMinutes())}
                                    className="px-2 py-1 border rounded text-sm"
                                >
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i}>
                                            {i.toString().padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-gray-500">:</span>
                                <select
                                    value={value.getMinutes()}
                                    onChange={(e) => handleTimeChange(value.getHours(), parseInt(e.target.value))}
                                    className="px-2 py-1 border rounded text-sm"
                                >
                                    {Array.from({ length: 60 }, (_, i) => (
                                        <option key={i} value={i}>
                                            {i.toString().padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
