// Hook for managing flows

import useSWR, { mutate } from 'swr';
import { flowsApi, subflowsApi, messagesApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

export function useFlows(templateId: number | null) {
    const { data: flows, error, isLoading } = useSWR(
        templateId ? `/templates/${templateId}/flows` : null,
        () => templateId ? flowsApi.listByTemplate(templateId) : null,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
        }
    );

    const createFlow = async (data: any) => {
        try {
            const result = await flowsApi.create(data);

            if (templateId) {
                mutate(`/templates/${templateId}/flows`);
            }

            toast.success('Flow criado com sucesso!');
            return result;
        } catch (error: any) {
            toast.error(`Erro ao criar flow: ${error.message}`);
            throw error;
        }
    };

    const updateFlow = async (id: number, data: any) => {
        try {
            await flowsApi.update(id, data);

            if (templateId) {
                mutate(`/templates/${templateId}/flows`);
            }
            mutate(`/flows/${id}`);

            toast.success('Flow atualizado com sucesso!');
        } catch (error: any) {
            toast.error(`Erro ao atualizar flow: ${error.message}`);
            throw error;
        }
    };

    const deleteFlow = async (id: number) => {
        try {
            await flowsApi.delete(id);

            if (templateId) {
                mutate(`/templates/${templateId}/flows`);
            }

            toast.success('Flow excluído com sucesso!');
        } catch (error: any) {
            toast.error(`Erro ao excluir flow: ${error.message}`);
            throw error;
        }
    };

    return {
        flows: flows || [],
        isLoading,
        error,
        createFlow,
        updateFlow,
        deleteFlow,
        refreshFlows: () => templateId && mutate(`/templates/${templateId}/flows`),
    };
}

export function useFlow(id: number | null) {
    const { data: flow, error, isLoading } = useSWR(
        id ? `/flows/${id}` : null,
        () => id ? flowsApi.getById(id) : null,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        flow,
        isLoading,
        error,
        refreshFlow: () => mutate(`/flows/${id}`),
    };
}

export function useSubflows(flowId: number | null) {
    const { data: subflows, error, isLoading } = useSWR(
        flowId ? `/flows/${flowId}/subflows` : null,
        () => flowId ? subflowsApi.listByFlow(flowId) : null,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
        }
    );

    const createSubflow = async (data: any) => {
        try {
            const result = await subflowsApi.create(data);

            if (flowId) {
                mutate(`/flows/${flowId}/subflows`);
            }

            toast.success('Subflow criado com sucesso!');
            return result;
        } catch (error: any) {
            toast.error(`Erro ao criar subflow: ${error.message}`);
            throw error;
        }
    };

    const updateSubflow = async (id: number, data: any) => {
        try {
            await subflowsApi.update(id, data);

            if (flowId) {
                mutate(`/flows/${flowId}/subflows`);
            }
            mutate(`/subflows/${id}`);

            toast.success('Subflow atualizado com sucesso!');
        } catch (error: any) {
            toast.error(`Erro ao atualizar subflow: ${error.message}`);
            throw error;
        }
    };

    const deleteSubflow = async (id: number) => {
        try {
            await subflowsApi.delete(id);

            if (flowId) {
                mutate(`/flows/${flowId}/subflows`);
            }

            toast.success('Subflow excluído com sucesso!');
        } catch (error: any) {
            toast.error(`Erro ao excluir subflow: ${error.message}`);
            throw error;
        }
    };

    return {
        subflows: subflows || [],
        isLoading,
        error,
        createSubflow,
        updateSubflow,
        deleteSubflow,
        refreshSubflows: () => flowId && mutate(`/flows/${flowId}/subflows`),
    };
}

export function useMessages(subflowId: number | null) {
    const { data: messages, error, isLoading } = useSWR(
        subflowId ? `/subflows/${subflowId}/messages` : null,
        () => subflowId ? messagesApi.listBySubflow(subflowId) : null,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
        }
    );

    const createMessage = async (data: any) => {
        try {
            const result = await messagesApi.create(data);

            if (subflowId) {
                mutate(`/subflows/${subflowId}/messages`);
            }

            toast.success('Mensagem criada com sucesso!');
            return result;
        } catch (error: any) {
            toast.error(`Erro ao criar mensagem: ${error.message}`);
            throw error;
        }
    };

    const updateMessage = async (id: number, data: any) => {
        try {
            await messagesApi.update(id, data);

            if (subflowId) {
                mutate(`/subflows/${subflowId}/messages`);
            }
            mutate(`/messages/${id}`);

            toast.success('Mensagem atualizada com sucesso!');
        } catch (error: any) {
            toast.error(`Erro ao atualizar mensagem: ${error.message}`);
            throw error;
        }
    };

    const deleteMessage = async (id: number) => {
        try {
            await messagesApi.delete(id);

            if (subflowId) {
                mutate(`/subflows/${subflowId}/messages`);
            }

            toast.success('Mensagem excluída com sucesso!');
        } catch (error: any) {
            toast.error(`Erro ao excluir mensagem: ${error.message}`);
            throw error;
        }
    };

    return {
        messages: messages || [],
        isLoading,
        error,
        createMessage,
        updateMessage,
        deleteMessage,
        refreshMessages: () => subflowId && mutate(`/subflows/${subflowId}/messages`),
    };
}
