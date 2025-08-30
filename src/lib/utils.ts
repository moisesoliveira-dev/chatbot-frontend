// Utility functions for the chatbot admin frontend

import { clsx, type ClassValue } from "clsx";

/**
 * Utility function to merge class names with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format date for relative display (e.g., "2 hours ago")
 */
export function formatRelativeDate(date: string | Date) {
    const now = new Date();
    const then = new Date(date);
    const diffInMs = now.getTime() - then.getTime();

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInDays < 7) return `${diffInDays}d atrás`;

    return formatDate(date);
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number = 100) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Sleep utility for testing
 */
export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random ID
 */
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}
