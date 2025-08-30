// Hook for managing bot status and controls

import useSWR, { mutate } from 'swr';
import { botApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { BotStatus } from '@/lib/types';

export function useBotStatus() {
    const { data: status, error, isLoading } = useSWR(
        '/bot/status',
        botApi.getStatus,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 3000,
            refreshInterval: 10000, // Check status every 10 seconds
        }
    );

    const enableBot = async () => {
        try {
            await botApi.enable();

            // Revalidate status
            mutate('/bot/status');

            toast.success('Bot ativado com sucesso!');
        } catch (error: any) {
            toast.error(`Erro ao ativar bot: ${error.message}`);
            throw error;
        }
    };

    const disableBot = async () => {
        try {
            await botApi.disable();

            // Revalidate status
            mutate('/bot/status');

            toast.success('Bot desativado com sucesso!');
        } catch (error: any) {
            toast.error(`Erro ao desativar bot: ${error.message}`);
            throw error;
        }
    };

    const toggleTestMode = async (enabled: boolean, testContactId?: string) => {
        try {
            await botApi.setTestMode(enabled, testContactId);

            // Revalidate status
            mutate('/bot/status');

            toast.success(enabled ? 'Modo de teste ativado!' : 'Modo de teste desativado!');
        } catch (error: any) {
            toast.error(`Erro ao alterar modo de teste: ${error.message}`);
            throw error;
        }
    };

    const healthCheck = async () => {
        try {
            const result = await botApi.getHealth();

            if (result.healthy) {
                toast.success('Bot está funcionando corretamente!');
            } else {
                toast.error('Bot apresenta problemas!');
            }

            return result;
        } catch (error: any) {
            toast.error(`Erro ao verificar saúde do bot: ${error.message}`);
            throw error;
        }
    };

    return {
        status: status as BotStatus | undefined,
        isLoading,
        error,
        enableBot,
        disableBot,
        toggleTestMode,
        healthCheck,
        refreshStatus: () => mutate('/bot/status'),

        // Helper computed properties
        isEnabled: status?.bot_enabled || false,
        isTestMode: status?.test_mode || false,
        currentStatus: status?.bot_status || 'paused',
        debounceTime: status?.debounce_time || 2000,
    };
}