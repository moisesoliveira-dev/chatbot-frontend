'use client';

import React from 'react';
import { clsx } from 'clsx';

interface AvatarProps {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    shape?: 'circle' | 'square';
    className?: string;
    onClick?: () => void;
}

const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
};

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = '',
    fallback,
    size = 'md',
    shape = 'circle',
    className,
    onClick,
}) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
        setImageError(false);
    };

    const showFallback = !src || imageError || !imageLoaded;

    const getFallbackText = () => {
        if (fallback) return fallback;
        if (alt) {
            return alt
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        return '?';
    };

    return (
        <div
            className={clsx(
                'relative inline-flex items-center justify-center overflow-hidden',
                'bg-gray-100 text-gray-600 font-medium',
                sizeClasses[size],
                {
                    'rounded-full': shape === 'circle',
                    'rounded-md': shape === 'square',
                    'cursor-pointer hover:opacity-80 transition-opacity': onClick,
                },
                className
            )}
            onClick={onClick}
        >
            {!showFallback && (
                <img
                    src={src}
                    alt={alt}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    className={clsx(
                        'h-full w-full object-cover',
                        {
                            'rounded-full': shape === 'circle',
                            'rounded-md': shape === 'square',
                        }
                    )}
                />
            )}

            {showFallback && (
                <span className="select-none">
                    {getFallbackText()}
                </span>
            )}
        </div>
    );
};
