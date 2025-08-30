'use client';

import React from 'react';
import { clsx } from 'clsx';

interface Column<T> {
    key: string;
    header: string;
    accessor?: keyof T | ((item: T) => React.ReactNode);
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, item: T, index: number) => React.ReactNode;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    empty?: React.ReactNode;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    onRowClick?: (item: T, index: number) => void;
    rowClassName?: (item: T, index: number) => string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    striped?: boolean;
    hoverable?: boolean;
    bordered?: boolean;
}

export function Table<T extends Record<string, any>>({
    data,
    columns,
    loading = false,
    empty,
    sortBy,
    sortDirection,
    onSort,
    onRowClick,
    rowClassName,
    className,
    size = 'md',
    striped = false,
    hoverable = true,
    bordered = true,
}: TableProps<T>) {
    const handleSort = (column: Column<T>) => {
        if (!column.sortable || !onSort) return;

        const newDirection =
            sortBy === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
        onSort(column.key, newDirection);
    };

    const getCellValue = (item: T, column: Column<T>) => {
        if (column.render) {
            const value = column.accessor
                ? typeof column.accessor === 'function'
                    ? column.accessor(item)
                    : item[column.accessor]
                : item[column.key];
            return column.render(value, item, data.indexOf(item));
        }

        if (column.accessor) {
            return typeof column.accessor === 'function'
                ? column.accessor(item)
                : item[column.accessor];
        }

        return item[column.key];
    };

    const sizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    const cellPadding = {
        sm: 'px-3 py-2',
        md: 'px-4 py-3',
        lg: 'px-6 py-4'
    };

    if (loading) {
        return (
            <div className={clsx('overflow-hidden', bordered && 'border border-gray-200 rounded-lg')}>
                <div className="animate-pulse">
                    <div className="bg-gray-50 border-b border-gray-200">
                        <div className="flex">
                            {columns.map((column) => (
                                <div
                                    key={column.key}
                                    className={clsx('flex-1', cellPadding[size])}
                                    style={{ width: column.width }}
                                >
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="border-b border-gray-200 last:border-b-0">
                            <div className="flex">
                                {columns.map((column) => (
                                    <div
                                        key={column.key}
                                        className={clsx('flex-1', cellPadding[size])}
                                        style={{ width: column.width }}
                                    >
                                        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className={clsx('overflow-hidden', bordered && 'border border-gray-200 rounded-lg')}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    scope="col"
                                    style={{ width: column.width }}
                                    className={clsx(
                                        'font-medium text-gray-500 uppercase tracking-wider',
                                        cellPadding[size],
                                        sizeClasses[size],
                                        {
                                            'text-left': column.align === 'left' || !column.align,
                                            'text-center': column.align === 'center',
                                            'text-right': column.align === 'right',
                                        }
                                    )}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                </table>
                <div className={clsx('text-center py-12', sizeClasses[size])}>
                    {empty || (
                        <div className="text-gray-500">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <p className="text-lg font-medium text-gray-900 mb-1">Nenhum dado encontrado</p>
                            <p className="text-gray-500">Não há informações para exibir nesta tabela.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={clsx(
            'overflow-hidden',
            bordered && 'border border-gray-200 rounded-lg',
            className
        )}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    scope="col"
                                    style={{ width: column.width }}
                                    className={clsx(
                                        'font-medium text-gray-500 uppercase tracking-wider',
                                        cellPadding[size],
                                        sizeClasses[size],
                                        {
                                            'text-left': column.align === 'left' || !column.align,
                                            'text-center': column.align === 'center',
                                            'text-right': column.align === 'right',
                                            'cursor-pointer hover:bg-gray-100 select-none': column.sortable,
                                        }
                                    )}
                                    onClick={() => handleSort(column)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{column.header}</span>
                                        {column.sortable && (
                                            <div className="flex flex-col">
                                                <svg
                                                    className={clsx(
                                                        'w-3 h-3',
                                                        sortBy === column.key && sortDirection === 'asc'
                                                            ? 'text-gray-900'
                                                            : 'text-gray-400'
                                                    )}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M5.293 9.707a1 1 0 011.414 0L10 6.414l3.293 3.293a1 1 0 001.414-1.414l-4-4a1 1 0 00-1.414 0l-4 4a1 1 0 000 1.414z" />
                                                </svg>
                                                <svg
                                                    className={clsx(
                                                        'w-3 h-3 -mt-1',
                                                        sortBy === column.key && sortDirection === 'desc'
                                                            ? 'text-gray-900'
                                                            : 'text-gray-400'
                                                    )}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M14.707 10.293a1 1 0 00-1.414 0L10 13.586 6.707 10.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className={clsx(
                        'bg-white divide-y divide-gray-200',
                        striped && 'divide-y-0'
                    )}>
                        {data.map((item, index) => (
                            <tr
                                key={index}
                                className={clsx(
                                    'transition-colors duration-150',
                                    {
                                        'hover:bg-gray-50': hoverable,
                                        'cursor-pointer': onRowClick,
                                        'bg-gray-50': striped && index % 2 === 1,
                                    },
                                    rowClassName?.(item, index)
                                )}
                                onClick={() => onRowClick?.(item, index)}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        style={{ width: column.width }}
                                        className={clsx(
                                            'text-gray-900 whitespace-nowrap',
                                            cellPadding[size],
                                            sizeClasses[size],
                                            {
                                                'text-left': column.align === 'left' || !column.align,
                                                'text-center': column.align === 'center',
                                                'text-right': column.align === 'right',
                                            }
                                        )}
                                    >
                                        {getCellValue(item, column)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
