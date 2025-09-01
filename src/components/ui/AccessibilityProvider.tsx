'use client';

import React, { createContext, useContext, useEffect } from 'react';

// Accessibility Context
interface A11yContextType {
    announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
    focusElement: (elementId: string) => void;
    trapFocus: (containerRef: React.RefObject<HTMLElement>) => () => void;
    reducedMotion: boolean;
    highContrast: boolean;
}

const A11yContext = createContext<A11yContextType | undefined>(undefined);

export const useAccessibility = () => {
    const context = useContext(A11yContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};

interface AccessibilityProviderProps {
    children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
    const [reducedMotion, setReducedMotion] = React.useState(false);
    const [highContrast, setHighContrast] = React.useState(false);
    const announcerRef = React.useRef<HTMLDivElement>(null);

    // Detect user preferences
    useEffect(() => {
        const mediaQueryMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const mediaQueryContrast = window.matchMedia('(prefers-contrast: high)');

        setReducedMotion(mediaQueryMotion.matches);
        setHighContrast(mediaQueryContrast.matches);

        const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches);

        mediaQueryMotion.addEventListener('change', handleMotionChange);
        mediaQueryContrast.addEventListener('change', handleContrastChange);

        return () => {
            mediaQueryMotion.removeEventListener('change', handleMotionChange);
            mediaQueryContrast.removeEventListener('change', handleContrastChange);
        };
    }, []);

    const announceToScreenReader = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        if (announcerRef.current) {
            announcerRef.current.textContent = message;
            announcerRef.current.setAttribute('aria-live', priority);

            // Clear after announcing
            setTimeout(() => {
                if (announcerRef.current) {
                    announcerRef.current.textContent = '';
                }
            }, 1000);
        }
    }, []);

    const focusElement = React.useCallback((elementId: string) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.focus();
            // Announce focus change to screen readers
            const label = element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent;
            if (label) {
                announceToScreenReader(`Focado em: ${label}`);
            }
        }
    }, [announceToScreenReader]);

    const trapFocus = React.useCallback((containerRef: React.RefObject<HTMLElement>) => {
        const container = containerRef.current;
        if (!container) return () => { };

        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;

        if (focusableElements.length === 0) return () => { };

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        // Focus first element
        firstElement.focus();

        document.addEventListener('keydown', handleTabKey);
        return () => document.removeEventListener('keydown', handleTabKey);
    }, []);

    const value: A11yContextType = {
        announceToScreenReader,
        focusElement,
        trapFocus,
        reducedMotion,
        highContrast
    };

    return (
        <A11yContext.Provider value={value}>
            {children}
            {/* Screen reader announcer */}
            <div
                ref={announcerRef}
                className="sr-only"
                aria-live="polite"
                aria-atomic="true"
            />
        </A11yContext.Provider>
    );
};

// Skip to content link
interface SkipLinkProps {
    href: string;
    children: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
    return (
        <a
            href={href}
            className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:no-underline"
        >
            {children}
        </a>
    );
};

// Focus visible utility
export const useFocusVisible = () => {
    const [isFocusVisible, setIsFocusVisible] = React.useState(false);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') {
                setIsFocusVisible(true);
            }
        };

        const handleMouseDown = () => {
            setIsFocusVisible(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);

    return isFocusVisible;
};

// ARIA live region hook
export const useLiveRegion = () => {
    const { announceToScreenReader } = useAccessibility();

    return React.useCallback((message: string, priority?: 'polite' | 'assertive') => {
        announceToScreenReader(message, priority);
    }, [announceToScreenReader]);
};

// Screen reader only text component
interface ScreenReaderOnlyProps {
    children: React.ReactNode;
}

export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ children }) => {
    return (
        <span className="sr-only">
            {children}
        </span>
    );
};

// Focus management hook for modals/dialogs
export const useFocusManagement = (isOpen: boolean, containerRef: React.RefObject<HTMLElement>) => {
    const { trapFocus } = useAccessibility();
    const previousFocusRef = React.useRef<HTMLElement | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            // Store current focus
            previousFocusRef.current = document.activeElement as HTMLElement;

            // Trap focus in container
            const cleanup = trapFocus(containerRef);

            return () => {
                cleanup();
                // Restore focus
                if (previousFocusRef.current) {
                    previousFocusRef.current.focus();
                }
            };
        }
    }, [isOpen, trapFocus, containerRef]);
};

// Reduced motion wrapper
interface ReducedMotionWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const ReducedMotionWrapper: React.FC<ReducedMotionWrapperProps> = ({
    children,
    fallback
}) => {
    const { reducedMotion } = useAccessibility();

    if (reducedMotion && fallback) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

// High contrast mode detector
export const useHighContrast = () => {
    const { highContrast } = useAccessibility();
    return highContrast;
};

// Custom hook for handling keyboard navigation
export const useKeyboardNavigation = (
    items: string[],
    onSelect: (item: string, index: number) => void,
    options: {
        loop?: boolean;
        orientation?: 'horizontal' | 'vertical';
    } = {}
) => {
    const { loop = true, orientation = 'vertical' } = options;
    const [activeIndex, setActiveIndex] = React.useState(-1);

    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
        const { key } = event;

        const isVertical = orientation === 'vertical';
        const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
        const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

        switch (key) {
            case nextKey:
                event.preventDefault();
                setActiveIndex(prevIndex => {
                    const newIndex = prevIndex + 1;
                    if (newIndex >= items.length) {
                        return loop ? 0 : prevIndex;
                    }
                    return newIndex;
                });
                break;

            case prevKey:
                event.preventDefault();
                setActiveIndex(prevIndex => {
                    const newIndex = prevIndex - 1;
                    if (newIndex < 0) {
                        return loop ? items.length - 1 : prevIndex;
                    }
                    return newIndex;
                });
                break;

            case 'Home':
                event.preventDefault();
                setActiveIndex(0);
                break;

            case 'End':
                event.preventDefault();
                setActiveIndex(items.length - 1);
                break;

            case 'Enter':
            case ' ':
                event.preventDefault();
                if (activeIndex >= 0 && activeIndex < items.length) {
                    onSelect(items[activeIndex], activeIndex);
                }
                break;
        }
    }, [items, onSelect, loop, orientation, activeIndex]);

    return {
        activeIndex,
        setActiveIndex,
        handleKeyDown,
        getItemProps: (index: number) => ({
            'aria-selected': activeIndex === index,
            tabIndex: activeIndex === index ? 0 : -1,
            onFocus: () => setActiveIndex(index)
        })
    };
};
