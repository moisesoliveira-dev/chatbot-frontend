'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import {
    ArrowPathIcon,
    ExclamationTriangleIcon,
    WifiIcon
} from '@heroicons/react/24/outline';

interface RetryConfig {
    maxAttempts?: number;
    delay?: number;
    exponentialBackoff?: boolean;
    onRetry?: (attempt: number) => void;
    onMaxAttemptsReached?: () => void;
}

interface UseRetryOptions extends RetryConfig {
    shouldRetry?: (error: any) => boolean;
}

export const useRetry = (options: UseRetryOptions = {}) => {
    const {
        maxAttempts = 3,
        delay = 1000,
        exponentialBackoff = true,
        shouldRetry = () => true,
        onRetry,
        onMaxAttemptsReached
    } = options;

    const [isRetrying, setIsRetrying] = useState(false);
    const [attemptCount, setAttemptCount] = useState(0);

    const retry = useCallback(async <T,>(
        asyncFunction: () => Promise<T>
    ): Promise<T> => {
        let lastError: any;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                setAttemptCount(attempt);

                if (attempt > 1) {
                    setIsRetrying(true);
                    onRetry?.(attempt);

                    const delayTime = exponentialBackoff
                        ? delay * Math.pow(2, attempt - 2)
                        : delay;

                    await new Promise(resolve => setTimeout(resolve, delayTime));
                }

                const result = await asyncFunction();
                setIsRetrying(false);
                setAttemptCount(0);
                return result;

            } catch (error) {
                lastError = error;

                if (attempt === maxAttempts || !shouldRetry(error)) {
                    break;
                }
            }
        }

        setIsRetrying(false);
        onMaxAttemptsReached?.();
        throw lastError;
    }, [maxAttempts, delay, exponentialBackoff, shouldRetry, onRetry, onMaxAttemptsReached]);

    return {
        retry,
        isRetrying,
        attemptCount,
        reset: () => {
            setIsRetrying(false);
            setAttemptCount(0);
        }
    };
};

interface RetryableComponentProps {
    children: React.ReactNode;
    onRetry: () => Promise<void>;
    error?: Error | null;
    isLoading?: boolean;
    retryConfig?: RetryConfig;
    fallbackMessage?: string;
    className?: string;
}

export const RetryableComponent: React.FC<RetryableComponentProps> = ({
    children,
    onRetry,
    error,
    isLoading = false,
    retryConfig = {},
    fallbackMessage = "Algo deu errado. Tente novamente.",
    className = ""
}) => {
    const { retry, isRetrying, attemptCount } = useRetry({
        ...retryConfig,
        shouldRetry: (err) => {
            // Don't retry client errors (4xx), only server errors and network issues
            return !err?.response?.status || err.response.status >= 500 || err.code === 'NETWORK_ERROR';
        }
    });

    const [hasError, setHasError] = useState(false);

    React.useEffect(() => {
        setHasError(!!error);
    }, [error]);

    const handleRetry = async () => {
        try {
            setHasError(false);
            await retry(onRetry);
        } catch (err) {
            setHasError(true);
        }
    };

    if (hasError && error) {
        return (
            <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
                <div className="mb-4">
                    {navigator.onLine === false ? (
                        <WifiIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    ) : (
                        <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-2" />
                    )}
                </div>

                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {navigator.onLine === false ? 'Sem Conexão' : 'Erro no Carregamento'}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                    {navigator.onLine === false
                        ? 'Verifique sua conexão com a internet e tente novamente.'
                        : fallbackMessage
                    }
                </p>

                {error.message && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">
                        {error.message}
                    </p>
                )}

                <div className="flex flex-col items-center gap-3">
                    <Button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        loading={isRetrying}
                        className="flex items-center gap-2"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        {isRetrying ? 'Tentando...' : 'Tentar Novamente'}
                    </Button>

                    {attemptCount > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Tentativa {attemptCount} de {retryConfig.maxAttempts || 3}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    if (isLoading || isRetrying) {
        return (
            <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                    {isRetrying ? `Tentando novamente... (${attemptCount}/${retryConfig.maxAttempts || 3})` : 'Carregando...'}
                </p>
            </div>
        );
    }

    return <>{children}</>;
};

// Network status hook
export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(true);

    React.useEffect(() => {
        const updateNetworkStatus = () => setIsOnline(navigator.onLine);

        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);

        // Initial check
        updateNetworkStatus();

        return () => {
            window.removeEventListener('online', updateNetworkStatus);
            window.removeEventListener('offline', updateNetworkStatus);
        };
    }, []);

    return isOnline;
};
