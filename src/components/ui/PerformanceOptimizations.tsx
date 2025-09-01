'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loading } from './Loading';

// Lazy loading wrapper with proper loading state
export const LazyComponent = <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ReactNode
) => {
    const Component = dynamic(importFn, {
        loading: () => fallback || <Loading className="p-8" />,
        ssr: true
    });

    return Component;
};

// Image optimization component with lazy loading
interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    sizes?: string;
    onLoad?: () => void;
    onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    width,
    height,
    className = '',
    priority = false,
    placeholder = 'empty',
    blurDataURL,
    sizes,
    onLoad,
    onError
}) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);

    const handleLoad = () => {
        setIsLoading(false);
        onLoad?.();
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
        onError?.();
    };

    if (hasError) {
        return (
            <div
                className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
                style={{ width, height }}
            >
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Erro ao carregar imagem
                </span>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {isLoading && placeholder === 'blur' && (
                <div
                    className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
                    style={{ width, height }}
                />
            )}
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'
                    } ${className}`}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={handleLoad}
                onError={handleError}
                sizes={sizes}
                {...(blurDataURL && { 'data-blur': blurDataURL })}
            />
        </div>
    );
};

// Virtual scrolling for large lists
interface VirtualizedListProps<T> {
    items: T[];
    itemHeight: number;
    containerHeight: number;
    renderItem: (item: T, index: number) => React.ReactNode;
    className?: string;
    overscan?: number;
}

export function VirtualizedList<T>({
    items,
    itemHeight,
    containerHeight,
    renderItem,
    className = '',
    overscan = 5
}: VirtualizedListProps<T>) {
    const [scrollTop, setScrollTop] = React.useState(0);

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex + 1);

    return (
        <div
            className={`overflow-auto ${className}`}
            style={{ height: containerHeight }}
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        >
            <div style={{ height: items.length * itemHeight, position: 'relative' }}>
                {visibleItems.map((item, index) => (
                    <div
                        key={startIndex + index}
                        style={{
                            position: 'absolute',
                            top: (startIndex + index) * itemHeight,
                            left: 0,
                            right: 0,
                            height: itemHeight
                        }}
                    >
                        {renderItem(item, startIndex + index)}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Code splitting utility for route-based splitting
export const createAsyncPage = (
    importFn: () => Promise<{ default: React.ComponentType<any> }>,
    fallback?: React.ReactNode
) => {
    const AsyncPage = LazyComponent(importFn, fallback);

    return function WrappedAsyncPage(props: any) {
        return (
            <Suspense fallback={fallback || <Loading className="min-h-screen" />}>
                <AsyncPage {...props} />
            </Suspense>
        );
    };
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
    React.useEffect(() => {
        const startTime = performance.now();

        return () => {
            const endTime = performance.now();
            const renderTime = endTime - startTime;

            if (process.env.NODE_ENV === 'development') {
                console.log(`[Performance] ${componentName} render time: ${renderTime.toFixed(2)}ms`);
            }

            // In production, you could send this to analytics
            if (process.env.NODE_ENV === 'production' && renderTime > 100) {
                // Log slow renders to monitoring service
                console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
            }
        };
    });
};

// Memory usage monitor (development only)
export const useMemoryMonitor = () => {
    React.useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;

        const monitor = () => {
            if ('memory' in performance) {
                const memory = (performance as any).memory;
                console.log('[Memory]', {
                    used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
                    total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
                    limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
                });
            }
        };

        const interval = setInterval(monitor, 10000); // Every 10 seconds
        return () => clearInterval(interval);
    }, []);
};
