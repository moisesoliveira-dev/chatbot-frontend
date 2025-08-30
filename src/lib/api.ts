// HTTP client configuration and API functions

import axios, { AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

// ===============================
// AXIOS INSTANCE CONFIGURATION
// ===============================

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add authorization token if available
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for debugging
        (config as any).requestStartedAt = new Date().getTime();

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Calculate request duration
        const requestStartedAt = (response.config as any).requestStartedAt;
        if (requestStartedAt) {
            const requestDuration = new Date().getTime() - requestStartedAt;
            console.log(`API Request to ${response.config.url} took ${requestDuration}ms`);
        }

        return response;
    },
    (error: AxiosError) => {
        // Handle different error status codes
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                toast.error('Sessão expirada. Faça login novamente.');
                window.location.href = '/login';
            }
        } else if (error.response?.status === 403) {
            toast.error('Acesso negado. Você não tem permissão para esta ação.');
        } else if (error.response && error.response.status >= 500) {
            toast.error('Erro interno do servidor. Tente novamente mais tarde.');
        } else if (error.code === 'ECONNABORTED') {
            toast.error('Tempo limite da requisição excedido.');
        } else if (!error.response) {
            toast.error('Erro de conexão. Verifique sua internet.');
        }

        return Promise.reject(error);
    }
);

// ===============================
// TEMPLATE API FUNCTIONS
// ===============================

export const templatesApi = {
    async list() {
        const response = await api.get('/flow-templates');
        return response.data.data || response.data;
    },

    async getById(id: number) {
        const response = await api.get(`/flow-templates/${id}`);
        return response.data.data || response.data;
    },

    async create(data: any) {
        const response = await api.post('/flow-templates', data);
        return response.data.data || response.data;
    },

    async update(id: number, data: any) {
        const response = await api.put(`/flow-templates/${id}`, data);
        return response.data.data || response.data;
    },

    async delete(id: number) {
        const response = await api.delete(`/flow-templates/${id}`);
        return response.data.data || response.data;
    },

    async export(id: number) {
        const response = await api.get(`/export/flows/${id}`);
        return response.data.data || response.data;
    },
};

// ===============================
// FLOW API FUNCTIONS
// ===============================

export const flowsApi = {
    async listByTemplate(templateId: number) {
        const response = await api.get(`/templates/${templateId}/flows`);
        return response.data.data || response.data;
    },

    async getById(id: number) {
        const response = await api.get(`/flows/${id}`);
        return response.data.data || response.data;
    },

    async create(data: any) {
        const response = await api.post('/flows', data);
        return response.data.data || response.data;
    },

    async update(id: number, data: any) {
        const response = await api.put(`/flows/${id}`, data);
        return response.data.data || response.data;
    },

    async delete(id: number) {
        const response = await api.delete(`/flows/${id}`);
        return response.data.data || response.data;
    },
};

// ===============================
// SUBFLOW API FUNCTIONS
// ===============================

export const subflowsApi = {
    async listByFlow(flowId: number) {
        const response = await api.get(`/flows/${flowId}/subflows`);
        return response.data.data || response.data;
    },

    async getById(id: number) {
        const response = await api.get(`/subflows/${id}`);
        return response.data.data || response.data;
    },

    async create(data: any) {
        const response = await api.post('/subflows', data);
        return response.data.data || response.data;
    },

    async update(id: number, data: any) {
        const response = await api.put(`/subflows/${id}`, data);
        return response.data.data || response.data;
    },

    async delete(id: number) {
        const response = await api.delete(`/subflows/${id}`);
        return response.data.data || response.data;
    },
};

// ===============================
// MESSAGES API FUNCTIONS
// ===============================

export const messagesApi = {
    async listBySubflow(subflowId: number) {
        const response = await api.get(`/subflows/${subflowId}/messages`);
        return response.data.data || response.data;
    },

    async getById(id: number) {
        const response = await api.get(`/flow-messages/${id}`);
        return response.data.data || response.data;
    },

    async create(data: any) {
        const response = await api.post('/flow-messages', data);
        return response.data.data || response.data;
    },

    async update(id: number, data: any) {
        const response = await api.put(`/flow-messages/${id}`, data);
        return response.data.data || response.data;
    },

    async delete(id: number) {
        const response = await api.delete(`/flow-messages/${id}`);
        return response.data.data || response.data;
    },
};

// ===============================
// CONVERSATIONS API FUNCTIONS
// ===============================

export const conversationsApi = {
    async list(filters?: any) {
        const response = await api.get('/conversations', { params: filters });
        return response.data.data || response.data;
    },

    async getById(id: number) {
        const response = await api.get(`/conversations/${id}`);
        return response.data.data || response.data;
    },

    async getHistory(id: number) {
        const response = await api.get(`/conversations/${id}/history`);
        return response.data.data || response.data;
    },

    async end(id: number) {
        const response = await api.post(`/conversations/${id}/end`);
        return response.data.data || response.data;
    },

    async restart(id: number) {
        const response = await api.post(`/conversations/${id}/restart`);
        return response.data.data || response.data;
    },
};

// ===============================
// ANALYTICS API FUNCTIONS
// ===============================

export const analyticsApi = {
    async conversations(dateRange?: { start: string; end: string }) {
        const response = await api.get('/analytics/conversations', { params: dateRange });
        return response.data.data || response.data;
    },

    async files(dateRange?: { start: string; end: string }) {
        const response = await api.get('/analytics/files', { params: dateRange });
        return response.data.data || response.data;
    },

    async dashboard() {
        const response = await api.get('/analytics/dashboard');
        return response.data.data || response.data;
    },
};

// ===============================
// BOT CONTROL API FUNCTIONS
// ===============================

export const botApi = {
    async getStatus() {
        const response = await api.get('/bot/status');
        return response.data.data || response.data;
    },

    async enable() {
        const response = await api.post('/bot/enable');
        toast.success('Bot ativado com sucesso');
        return response.data.data || response.data;
    },

    async disable() {
        const response = await api.post('/bot/disable');
        toast.success('Bot desativado com sucesso');
        return response.data.data || response.data;
    },

    async setTestMode(enabled: boolean, testContactId?: string) {
        const response = await api.post('/bot/test-mode', {
            enabled,
            test_contact_id: testContactId
        });
        toast.success(`Modo teste ${enabled ? 'ativado' : 'desativado'}`);
        return response.data.data || response.data;
    },

    async getHealth() {
        const response = await api.get('/bot/health');
        return response.data.data || response.data;
    },
};

// ===============================
// SETTINGS API FUNCTIONS
// ===============================

export const settingsApi = {
    async list() {
        const response = await api.get('/settings');
        return response.data.data || response.data;
    },

    async get(key: string) {
        const response = await api.get(`/settings/${key}`);
        return response.data.data || response.data;
    },

    async update(key: string, data: any) {
        const response = await api.put(`/settings/${key}`, data);
        toast.success('Configuração atualizada com sucesso');
        return response.data.data || response.data;
    },
};

// ===============================
// EXPORT DEFAULT API CLIENT
// ===============================

export default api;
