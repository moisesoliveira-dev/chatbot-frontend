// Hook for managing conversations and message history

import useSWR, { mutate } from 'swr';
import { conversationsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { UserConversation, MessageHistory, ConversationFilters } from '@/lib/types';

export function useConversations(filters?: ConversationFilters) {
    const { data: conversations, error, isLoading } = useSWR(
        ['/conversations', filters],
        () => conversationsApi.list(filters),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            refreshInterval: 10000, // Refresh every 10 seconds for real-time monitoring
        }
    );

    const endConversation = async (id: number) => {
        try {
            await conversationsApi.end(id);

            // Revalidate conversations list
            mutate(['/conversations', filters]);

            toast.success('Conversa finalizada com sucesso!');
        } catch (error: any) {
            toast.error(`Erro ao finalizar conversa: ${error.message}`);
            throw error;
        }
    };

    const restartConversation = async (id: number) => {
        try {
            await conversationsApi.restart(id);

            // Revalidate conversations list
            mutate(['/conversations', filters]);

            toast.success('Conversa reiniciada com sucesso!');
        } catch (error: any) {
            toast.error(`Erro ao reiniciar conversa: ${error.message}`);
            throw error;
        }
    };

    return {
        conversations: conversations || [],
        isLoading,
        error,
        endConversation,
        restartConversation,
        refreshConversations: () => mutate(['/conversations', filters]),
    };
}

export function useConversation(id: number | null) {
    const { data: conversation, error, isLoading } = useSWR(
        id ? `/conversations/${id}` : null,
        () => id ? conversationsApi.getById(id) : null,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 3000,
        }
    );

    return {
        conversation,
        isLoading,
        error,
        refreshConversation: () => id && mutate(`/conversations/${id}`),
    };
}

export function useConversationHistory(conversationId: number | null) {
    const { data: history, error, isLoading } = useSWR(
        conversationId ? `/conversations/${conversationId}/history` : null,
        () => conversationId ? conversationsApi.getHistory(conversationId) : null,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 2000,
            refreshInterval: 5000, // Refresh every 5 seconds for real-time chat
        }
    );

    return {
        history: history || [],
        isLoading,
        error,
        refreshHistory: () => conversationId && mutate(`/conversations/${conversationId}/history`),
    };
}