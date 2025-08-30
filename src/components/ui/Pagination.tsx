'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Button } from './Button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    showSizeChanger?: boolean;
    pageSize?: number;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
    showQuickJumper?: boolean;
    showTotal?: boolean;
    totalItems?: number;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    showSizeChanger = false,
    pageSize = 10,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100],
    showQuickJumper = false,
    showTotal = true,
    totalItems,
    className,
    size = 'md',
    disabled = false,
}) => {
    const [jumpPage, setJumpPage] = React.useState('');

    const handlePageChange = (page: number) => {
        if (disabled || page < 1 || page > totalPages || page === currentPage) return;
        onPageChange(page);
    };

    const handleQuickJump = () => {
        const page = parseInt(jumpPage);
        if (page >= 1 && page <= totalPages) {
            handlePageChange(page);
            setJumpPage('');
        }
    };

    const handlePageSizeChange = (newSize: number) => {
        if (disabled) return;
        onPageSizeChange?.(newSize);
    };

    const getVisiblePages = () => {
        const delta = 2; // Number of pages to show on each side of current page
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > delta + 2) {
                pages.push('...');
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - delta);
            const end = Math.min(totalPages - 1, currentPage + delta);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - delta - 1) {
                pages.push('...');
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    if (totalPages <= 1 && !showTotal) {
        return null;
    }

    return (
        <div className={clsx('flex items-center justify-between flex-wrap gap-4', className)}>
            {/* Total items info */}
            {showTotal && totalItems !== undefined && (
                <div className="text-sm text-gray-500">
                    Mostrando {Math.min((currentPage - 1) * pageSize + 1, totalItems)} até{' '}
                    {Math.min(currentPage * pageSize, totalItems)} de {totalItems} itens
                </div>
            )}

            <div className="flex items-center space-x-4">
                {/* Page size changer */}
                {showSizeChanger && onPageSizeChange && (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Itens por página:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                            disabled={disabled}
                            className={clsx(
                                'border border-gray-300 rounded px-2 py-1 text-sm',
                                'focus:outline-none focus:ring-1 focus:ring-blue-500',
                                {
                                    'bg-gray-100 cursor-not-allowed': disabled,
                                }
                            )}
                        >
                            {pageSizeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Pagination controls */}
                <div className="flex items-center space-x-1">
                    {/* Previous button */}
                    <Button
                        variant="outline"
                        size={size}
                        disabled={disabled || currentPage <= 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Button>

                    {/* Page numbers */}
                    {getVisiblePages().map((page, index) => {
                        if (page === '...') {
                            return (
                                <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-400">
                                    ...
                                </span>
                            );
                        }

                        const pageNumber = page as number;
                        const isActive = pageNumber === currentPage;

                        return (
                            <Button
                                key={pageNumber}
                                variant={isActive ? 'primary' : 'outline'}
                                size={size}
                                disabled={disabled}
                                onClick={() => handlePageChange(pageNumber)}
                                className={clsx(sizeClasses[size], 'min-w-[2.5rem]')}
                            >
                                {pageNumber}
                            </Button>
                        );
                    })}

                    {/* Next button */}
                    <Button
                        variant="outline"
                        size={size}
                        disabled={disabled || currentPage >= totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Button>
                </div>

                {/* Quick jumper */}
                {showQuickJumper && (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Ir para:</span>
                        <input
                            type="number"
                            min={1}
                            max={totalPages}
                            value={jumpPage}
                            onChange={(e) => setJumpPage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleQuickJump();
                                }
                            }}
                            disabled={disabled}
                            className={clsx(
                                'w-16 px-2 py-1 text-sm border border-gray-300 rounded',
                                'focus:outline-none focus:ring-1 focus:ring-blue-500',
                                {
                                    'bg-gray-100 cursor-not-allowed': disabled,
                                }
                            )}
                            placeholder="1"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={disabled}
                            onClick={handleQuickJump}
                        >
                            Ir
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
