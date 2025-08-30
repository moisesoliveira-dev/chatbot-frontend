// Validation schemas using Zod

import { z } from 'zod';

// ===============================
// TEMPLATE VALIDATION SCHEMAS
// ===============================

export const templateSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    description: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional(),
    created_by: z.number().optional(),
});

export const templateUpdateSchema = templateSchema.partial();

// ===============================
// FLOW VALIDATION SCHEMAS
// ===============================

export const flowSchema = z.object({
    template_id: z.number({ message: 'Template é obrigatório' }),
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    description: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional(),
    is_default: z.boolean().optional().default(false),
    order_index: z.number().min(0, 'Ordem deve ser maior que 0').optional(),
});

export const flowUpdateSchema = flowSchema.partial().omit({ template_id: true });

// ===============================
// SUBFLOW VALIDATION SCHEMAS
// ===============================

export const subflowSchema = z.object({
    flow_id: z.number({ message: 'Fluxo é obrigatório' }),
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    description: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional(),
    parent_subflow_id: z.number().optional(),
    trigger_keywords: z.array(z.string().min(1, 'Palavra-chave não pode ser vazia')).min(1, 'Pelo menos uma palavra-chave é obrigatória'),
    order_index: z.number().min(0, 'Ordem deve ser maior que 0').optional(),
});

export const subflowUpdateSchema = subflowSchema.partial().omit({ flow_id: true });

// ===============================
// MESSAGE VALIDATION SCHEMAS
// ===============================

export const messageSchema = z.object({
    subflow_id: z.number({ message: 'Subfluxo é obrigatório' }),
    message_text: z.string().min(1, 'Texto da mensagem é obrigatório').max(4000, 'Mensagem deve ter no máximo 4000 caracteres'),
    message_type: z.enum(['text', 'image', 'document']),
    order_index: z.number().min(0, 'Ordem deve ser maior que 0').optional(),
    wait_for_response: z.boolean().optional().default(true),
    wait_for_file: z.boolean().optional().default(false), // ✓ CAMPO PRINCIPAL
    expected_file_types: z.array(z.string()).optional().default([]),
    delay_seconds: z.number().min(0, 'Delay deve ser maior ou igual a 0').max(300, 'Delay deve ser menor que 300 segundos').optional().default(0),
});

export const messageUpdateSchema = messageSchema.partial().omit({ subflow_id: true });

// ===============================
// CONVERSATION FILTERS SCHEMA
// ===============================

export const conversationFiltersSchema = z.object({
    status: z.enum(['active', 'completed', 'paused']).optional(),
    contact_id: z.number().optional(),
    flow_id: z.number().optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
    page: z.number().min(1, 'Página deve ser maior que 0').optional().default(1),
    per_page: z.number().min(1).max(100, 'Máximo 100 itens por página').optional().default(20),
});

// ===============================
// BOT CONTROLS SCHEMA
// ===============================

export const botTestModeSchema = z.object({
    enabled: z.boolean(),
    test_contact_id: z.string().optional(),
});

// ===============================
// SETTINGS SCHEMA
// ===============================

export const settingsSchema = z.object({
    key: z.string().min(1, 'Chave é obrigatória'),
    value: z.any(),
    type: z.enum(['string', 'number', 'boolean', 'json']).optional().default('string'),
});

// ===============================
// EXPORT OPTIONS SCHEMA
// ===============================

export const exportOptionsSchema = z.object({
    format: z.enum(['json', 'csv', 'xlsx']),
    include_metadata: z.boolean().optional().default(true),
    date_range: z.object({
        start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
        end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
    }).optional(),
});

// ===============================
// SEARCH SCHEMA
// ===============================

export const searchSchema = z.object({
    query: z.string().min(1, 'Termo de busca é obrigatório').max(100, 'Busca deve ter no máximo 100 caracteres'),
    filters: z.object({
        type: z.enum(['templates', 'flows', 'conversations', 'all']).optional().default('all'),
        status: z.enum(['active', 'inactive', 'all']).optional().default('all'),
        date_range: z.object({
            start: z.string().optional(),
            end: z.string().optional(),
        }).optional(),
    }).optional(),
    page: z.number().min(1).optional().default(1),
    per_page: z.number().min(1).max(50).optional().default(10),
});

// ===============================
// UTILITY VALIDATION FUNCTIONS
// ===============================

/**
 * Validate form data against a schema and return formatted errors
 */
export function validateFormData<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
    });

    return { success: false, errors };
}

/**
 * Get validation error for a specific field
 */
export function getFieldError(
    errors: Record<string, string>,
    fieldName: string
): string | undefined {
    return errors[fieldName];
}

/**
 * Check if form has any validation errors
 */
export function hasValidationErrors(errors: Record<string, string>): boolean {
    return Object.keys(errors).length > 0;
}

// ===============================
// EXPORT SCHEMA TYPES
// ===============================

export type TemplateFormData = z.infer<typeof templateSchema>;
export type FlowFormData = z.infer<typeof flowSchema>;
export type SubflowFormData = z.infer<typeof subflowSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type ConversationFilters = z.infer<typeof conversationFiltersSchema>;
export type BotTestModeData = z.infer<typeof botTestModeSchema>;
export type SettingsFormData = z.infer<typeof settingsSchema>;
export type ExportOptions = z.infer<typeof exportOptionsSchema>;
export type SearchQuery = z.infer<typeof searchSchema>;
