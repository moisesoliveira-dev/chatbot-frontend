// Constants for the chatbot admin frontend

// API Endpoints
export const API_ENDPOINTS = {
    TEMPLATES: '/flow-templates',
    FLOWS: '/flows',
    SUBFLOWS: '/subflows',
    MESSAGES: '/flow-messages',
    CONVERSATIONS: '/conversations',
    ANALYTICS: '/analytics',
    BOT_STATUS: '/bot/status',
    SETTINGS: '/settings',
} as const;

// Application Settings
export const APP_CONFIG = {
    NAME: 'Chatbot Admin',
    VERSION: '1.0.0',
    DESCRIPTION: 'Sistema administrativo para gerenciar fluxos conversacionais do chatbot',
    AUTHOR: 'Chatbot Admin Team',
} as const;

// Default values
export const DEFAULTS = {
    PAGE_SIZE: 20,
    DEBOUNCE_TIME: 300,
    REFRESH_INTERVAL: 30000, // 30 seconds
} as const;

// Status options
export const BOT_STATUS = {
    ACTIVE: 'active',
    PAUSED: 'paused',
    MAINTENANCE: 'maintenance',
} as const;

export const CONVERSATION_STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
} as const;

export const MESSAGE_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    DOCUMENT: 'document',
} as const;

// File type extensions
export const SUPPORTED_FILE_TYPES = {
    IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    DOCUMENTS: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    SPREADSHEETS: ['xls', 'xlsx', 'csv'],
    PRESENTATIONS: ['ppt', 'pptx'],
    ARCHIVES: ['zip', 'rar', '7z'],
    ALL: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'zip', 'rar', '7z']
} as const;

// Navigation items
export const NAVIGATION = [
    { name: 'Dashboard', href: '/dashboard', icon: 'HomeIcon' },
    { name: 'Templates', href: '/templates', icon: 'DocumentTextIcon' },
    { name: 'Conversas', href: '/conversations', icon: 'ChatBubbleLeftRightIcon' },
    { name: 'Analytics', href: '/analytics', icon: 'ChartBarIcon' },
    { name: 'Configurações', href: '/settings', icon: 'CogIcon' },
] as const;

// Color schemes
export const COLORS = {
    PRIMARY: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
    },
    SUCCESS: {
        500: '#22c55e',
        600: '#16a34a',
    },
    WARNING: {
        500: '#f97316',
        600: '#ea580c',
    },
    DANGER: {
        500: '#ef4444',
        600: '#dc2626',
    },
} as const;
