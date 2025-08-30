'use client';

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    disabled?: boolean;
    className?: string;
    arrow?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    delay = 200,
    disabled = false,
    className,
    arrow = true,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [actualPosition, setActualPosition] = useState(position);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const showTooltip = () => {
        if (disabled || !content) return;

        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            updatePosition();
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    const updatePosition = () => {
        if (!tooltipRef.current || !triggerRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let newPosition = position;

        // Check if tooltip would go outside viewport and adjust position
        switch (position) {
            case 'top':
                if (triggerRect.top - tooltipRect.height < 0) {
                    newPosition = 'bottom';
                }
                break;
            case 'bottom':
                if (triggerRect.bottom + tooltipRect.height > viewportHeight) {
                    newPosition = 'top';
                }
                break;
            case 'left':
                if (triggerRect.left - tooltipRect.width < 0) {
                    newPosition = 'right';
                }
                break;
            case 'right':
                if (triggerRect.right + tooltipRect.width > viewportWidth) {
                    newPosition = 'left';
                }
                break;
        }

        setActualPosition(newPosition);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const getTooltipClasses = () => {
        const baseClasses = clsx(
            'absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg',
            'transition-opacity duration-200 pointer-events-none',
            'max-w-xs break-words',
            {
                'opacity-100': isVisible,
                'opacity-0': !isVisible,
            }
        );

        const positionClasses = {
            top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
            bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
            left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
            right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
        };

        return clsx(baseClasses, positionClasses[actualPosition], className);
    };

    const getArrowClasses = () => {
        if (!arrow) return '';

        const arrowClasses = {
            top: 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900',
            bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900',
            left: 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900',
            right: 'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900',
        };

        return clsx('absolute w-0 h-0', arrowClasses[actualPosition]);
    };

    return (
        <div className="relative inline-block">
            <div
                ref={triggerRef}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
            >
                {children}
            </div>
            {(isVisible || true) && ( // Keep in DOM for position calculation
                <div
                    ref={tooltipRef}
                    className={getTooltipClasses()}
                    role="tooltip"
                    aria-hidden={!isVisible}
                >
                    {content}
                    {arrow && <div className={getArrowClasses()} />}
                </div>
            )}
        </div>
    );
};
