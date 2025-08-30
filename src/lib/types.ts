// TypeScript types for the chatbot admin frontend

// ===============================
// BASE TYPES
// ===============================

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

// ===============================
// FLOW TEMPLATE TYPES  
// ===============================

export interface FlowTemplate {
    id: number;
    name: string;
    description?: string;
    is_active: boolean;
    flows_count: number;
    created_by?: number;
    created_at: string;
    updated_at: string;
}

export interface TemplateFormData {
    name: string;
    description?: string;
    created_by?: number;
}

// ===============================
// FLOW TYPES
// ===============================

export interface Flow {
    id: number;
    template_id: number;
    name: string;
    description?: string;
    is_default: boolean;
    is_active: boolean;
    order_index: number;
    subflows_count: number;
    created_at: string;
    updated_at: string;
}

export interface FlowFormData {
    template_id: number;
    name: string;
    description?: string;
    is_default?: boolean;
    order_index?: number;
}

// ===============================
// SUBFLOW TYPES
// ===============================

export interface Subflow {
    id: number;
    flow_id: number;
    name: string;
    description?: string;
    parent_subflow_id?: number;
    trigger_keywords: string[];
    order_index: number;
    is_active: boolean;
    messages_count: number;
    created_at: string;
    updated_at: string;
}

export interface SubflowFormData {
    flow_id: number;
    name: string;
    description?: string;
    parent_subflow_id?: number;
    trigger_keywords: string[];
    order_index?: number;
}

// ===============================
// MESSAGE TYPES
// ===============================

export type MessageType = 'text' | 'image' | 'document';

export interface FlowMessage {
    id: number;
    subflow_id: number;
    message_text: string;
    message_type: MessageType;
    order_index: number;
    wait_for_response: boolean;
    wait_for_file: boolean; // ✓ CAMPO PRINCIPAL para arquivos
    expected_file_types: string[];
    delay_seconds: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface MessageFormData {
    subflow_id: number;
    message_text: string;
    message_type: MessageType;
    order_index?: number;
    wait_for_response?: boolean;
    wait_for_file?: boolean; // ✓ CAMPO PRINCIPAL
    expected_file_types: string[];
    delay_seconds?: number;
}

// ===============================
// CONVERSATION TYPES
// ===============================

export type ConversationState = 'active' | 'completed' | 'paused';

export interface UserConversation {
    id: number;
    contact_id: number;
    ticket_id?: number;
    current_flow_id?: number;
    current_subflow_id?: number;
    current_message_id?: number;
    template_name?: string;
    flow_name?: string;
    subflow_name?: string;
    current_message?: string;
    conversation_state: Record<string, any>;
    variables: Record<string, any>;
    started_at: string;
    last_interaction: string;
    is_completed: boolean;
    is_active: boolean;
}

export interface MessageHistory {
    id: number;
    conversation_id: number;
    contact_id: number;
    ticket_id?: number;
    message_text?: string;
    message_type?: string;
    media_url?: string;
    media_path?: string;
    is_from_bot: boolean;
    flow_message_id?: number;
    created_at: string;
}

export interface ConversationFilters {
    status?: ConversationState;
    contact_id?: number;
    flow_id?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
}

// ===============================
// ANALYTICS TYPES
// ===============================

export interface ConversationAnalytics {
    by_status: Array<{
        status: 'completed' | 'active';
        count: number;
    }>;
    by_flow: Array<{
        flow_name: string;
        count: number;
    }>;
    daily_messages: Array<{
        date: string;
        messages_count: number;
        conversations_count: number;
    }>;
    summary: {
        total_conversations: number;
        active_conversations: number;
        completed_conversations: number;
        total_messages: number;
        avg_messages_per_conversation: number;
    };
}

export interface FileAnalytics {
    files_by_type: Array<{
        file_type: string;
        count: number;
        avg_size_mb: number;
    }>;
    files_by_flow: Array<{
        flow_name: string;
        file_count: number;
        total_size_mb: number;
    }>;
    summary: {
        total_files: number;
        total_size_mb: number;
        most_common_type: string;
    };
}

// ===============================
// BOT STATUS & SETTINGS TYPES
// ===============================

export type BotStatusType = 'active' | 'paused' | 'maintenance';

export interface BotStatus {
    bot_enabled: boolean;
    bot_status: BotStatusType;
    test_mode: boolean;
    test_contact_id: string;
    debounce_time: number;
    last_heartbeat?: string;
    uptime_seconds?: number;
}

export interface SystemSettings {
    id: number;
    key: string;
    value: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    description?: string;
    updated_at: string;
}

export interface SettingsFormData {
    key: string;
    value: any;
    type?: 'string' | 'number' | 'boolean' | 'json';
}

// ===============================
// UI COMPONENT TYPES
// ===============================

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface TableColumn<T = any> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: any, item: T) => React.ReactNode;
}

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    showFirstLast?: boolean;
}

// ===============================
// FORM VALIDATION TYPES
// ===============================

export interface ValidationError {
    field: string;
    message: string;
}

export interface FormState<T = any> {
    data: T;
    errors: ValidationError[];
    isLoading: boolean;
    isSubmitting: boolean;
}

// ===============================
// EXPORT TYPES
// ===============================

export interface ExportOptions {
    format: 'json' | 'csv' | 'xlsx';
    include_metadata?: boolean;
    date_range?: {
        start: string;
        end: string;
    };
}

export interface ExportResult {
    filename: string;
    url: string;
    size_bytes: number;
    exported_at: string;
}

// ===============================
// DASHBOARD TYPES
// ===============================

export interface DashboardStats {
    active_conversations: number;
    total_messages_today: number;
    total_files_received: number;
    bot_uptime_hours: number;
    most_active_flow: string;
    avg_response_time_ms: number;
}

export interface RealtimeMetric {
    timestamp: string;
    conversations: number;
    messages: number;
    files: number;
}
