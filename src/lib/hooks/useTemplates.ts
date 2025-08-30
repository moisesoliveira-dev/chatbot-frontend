// Hook for managing flow templates

import useSWR, { mutate } from 'swr';
import { templatesApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

export function useTemplates() {
    const { data: templates, error, isLoading } = useSWR(
        '/templates',
        templatesApi.list,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
        }
    );

    const createTemplate = async (data: any) => {
        try {
            const result = await templatesApi.create(data);

            // Revalidate templates list
            mutate('/templates');

            toast.success('Template criado com sucesso!');
            return result;
        } catch (error: any) {
            toast.error(`Erro ao criar template: ${error.message}`);
            throw error;
        }
    };

    const updateTemplate = async (id: number, data: any) => {
        try {
            await templatesApi.update(id, data);

            // Revalidate templates list and specific template
            mutate('/templates');
            mutate(`/templates/${id}`);

            toast.success('Template atualizado com sucesso!');
        } catch (error: any) {
            toast.error(`Erro ao atualizar template: ${error.message}`);
            throw error;
        }
    };

    const deleteTemplate = async (id: number) => {
        try {
            await templatesApi.delete(id);

            // Revalidate templates list
            mutate('/templates');

            toast.success('Template excluído com sucesso!');
        } catch (error: any) {
            toast.error(`Erro ao excluir template: ${error.message}`);
            throw error;
        }
    };

    const exportTemplate = async (id: number) => {
        try {
            const data = await templatesApi.export(id);

            // Create and download file
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `template-${id}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Template exportado com sucesso!');
        } catch (error: any) {
            toast.error(`Erro ao exportar template: ${error.message}`);
            throw error;
        }
    };

    return {
        templates: templates || [],
        isLoading,
        error,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        exportTemplate,
        refreshTemplates: () => mutate('/templates'),
    };
}

export function useTemplate(id: number | null) {
    const { data: template, error, isLoading } = useSWR(
        id ? `/templates/${id}` : null,
        () => id ? templatesApi.getById(id) : null,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        template,
        isLoading,
        error,
        refreshTemplate: () => mutate(`/templates/${id}`),
    };
}
