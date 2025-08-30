# Documentação Frontend - Sistema de Chatbot Next.js

## Visão Geral

Frontend administrativo desenvolvido em Next.js para gerenciar o sistema de chatbot, permitindo a criação de fluxos conversacionais, monitoramento de conversas ativas e configuração do comportamento do bot.

## Tecnologias e Dependências

### Framework e Bibliotecas Core
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.2.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.8.0"
  }
}
```

### UI e Estilização
```json
{
  "dependencies": {
    "tailwindcss": "^3.3.0",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "clsx": "^2.0.0",
    "framer-motion": "^10.16.0"
  }
}
```

### Gerenciamento de Estado e Dados
```json
{
  "dependencies": {
    "swr": "^2.2.4",
    "axios": "^1.5.0",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.0"
  }
}
```

### Utilitários e Funcionalidades Específicas
```json
{
  "dependencies": {
    "date-fns": "^2.30.0",
    "react-hot-toast": "^2.4.1",
    "react-loading-skeleton": "^3.3.1",
    "recharts": "^2.8.0",
    "react-syntax-highlighter": "^15.5.0",
    "file-saver": "^2.0.5",
    "@types/file-saver": "^2.0.7"
  }
}
```

## Estrutura do Projeto

```
chatbot-frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── templates/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── flows/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx
│   │   │       │   └── [flowId]/
│   │   │       │       ├── page.tsx
│   │   │       │       └── edit/
│   │   │       │           └── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── conversations/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   └── api/
│       └── proxy/
│           └── [...path]/
│               └── route.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   ├── Table.tsx
│   │   ├── Badge.tsx
│   │   ├── Switch.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── Toast.tsx
│   │   └── Loading.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── Footer.tsx
│   ├── templates/
│   │   ├── TemplateList.tsx
│   │   ├── TemplateCard.tsx
│   │   ├── TemplateForm.tsx
│   │   └── TemplatePreview.tsx
│   ├── flows/
│   │   ├── FlowBuilder.tsx
│   │   ├── FlowCanvas.tsx
│   │   ├── SubflowEditor.tsx
│   │   ├── MessageEditor.tsx
│   │   ├── FlowPreview.tsx
│   │   └── KeywordManager.tsx
│   ├── conversations/
│   │   ├── ConversationList.tsx
│   │   ├── ConversationDetail.tsx
│   │   ├── MessageHistory.tsx
│   │   └── ConversationFilters.tsx
│   ├── analytics/
│   │   ├── DashboardStats.tsx
│   │   ├── ConversationCharts.tsx
│   │   ├── FileAnalytics.tsx
│   │   └── RealtimeMetrics.tsx
│   └── settings/
│       ├── BotControls.tsx
│       ├── SystemSettings.tsx
│       ├── ExportImport.tsx
│       └── ConfigurationPanel.tsx
├── lib/
│   ├── api.ts
│   ├── types.ts
│   ├── utils.ts
│   ├── validation.ts
│   ├── constants.ts
│   └── hooks/
│       ├── useTemplates.ts
│       ├── useFlows.ts
│       ├── useConversations.ts
│       ├── useAnalytics.ts
│       ├── useSettings.ts
│       └── useBotStatus.ts
├── public/
│   ├── icons/
│   └── images/
├── styles/
│   └── globals.css
├── tailwind.config.js
├── next.config.js
├── package.json
└── tsconfig.json
```

## Tipos TypeScript

### Tipos Base do Sistema
```typescript
// lib/types.ts
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

export interface FlowMessage {
  id: number;
  subflow_id: number;
  message_text: string;
  message_type: 'text' | 'image' | 'document';
  order_index: number;
  wait_for_response: boolean;
  wait_for_file: boolean; // ✓ PARÂMETRO PRINCIPAL
  expected_file_types: string[];
  delay_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
```

### Tipos para Analytics
```typescript
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
}

export interface FileAnalytics {
  files_by_type: Array<{
    file_type: string;
    count: number;
    avg_size_mb: number;
  }>;
}

export interface BotStatus {
  bot_enabled: boolean;
  bot_status: 'active' | 'paused' | 'maintenance';
  test_mode: boolean;
  test_contact_id: string;
  debounce_time: number;
}
```

### Tipos para Formulários
```typescript
export interface TemplateFormData {
  name: string;
  description?: string;
  created_by?: number;
}

export interface FlowFormData {
  template_id: number;
  name: string;
  description?: string;
  is_default?: boolean;
  order_index?: number;
}

export interface SubflowFormData {
  flow_id: number;
  name: string;
  description?: string;
  parent_subflow_id?: number;
  trigger_keywords: string[];
  order_index?: number;
}

export interface MessageFormData {
  subflow_id: number;
  message_text: string;
  message_type: 'text' | 'image' | 'document';
  order_index?: number;
  wait_for_response?: boolean;
  wait_for_file?: boolean;
  expected_file_types: string[];
  delay_seconds?: number;
}
```

## Configuração da API

### Cliente HTTP
```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Funções de API
```typescript
// Templates
export const templatesApi = {
  list: () => api.get<FlowTemplate[]>('/flow-templates'),
  create: (data: TemplateFormData) => api.post<{id: number}>('/flow-templates', data),
  update: (id: number, data: Partial<TemplateFormData>) => api.put(`/flow-templates/${id}`, data),
  delete: (id: number) => api.delete(`/flow-templates/${id}`),
  export: (id: number) => api.get(`/export/flows/${id}`),
};

// Fluxos
export const flowsApi = {
  list: (templateId: number) => api.get<Flow[]>(`/templates/${templateId}/flows`),
  create: (data: FlowFormData) => api.post<{id: number}>('/flows', data),
  update: (id: number, data: Partial<FlowFormData>) => api.put(`/flows/${id}`, data),
  delete: (id: number) => api.delete(`/flows/${id}`),
};

// Subfluxos
export const subflowsApi = {
  list: (flowId: number) => api.get<Subflow[]>(`/flows/${flowId}/subflows`),
  create: (data: SubflowFormData) => api.post<{id: number}>('/subflows', data),
  update: (id: number, data: Partial<SubflowFormData>) => api.put(`/subflows/${id}`, data),
  delete: (id: number) => api.delete(`/subflows/${id}`),
};

// Mensagens
export const messagesApi = {
  list: (subflowId: number) => api.get<FlowMessage[]>(`/subflows/${subflowId}/messages`),
  create: (data: MessageFormData) => api.post<{id: number}>('/flow-messages', data),
  update: (id: number, data: Partial<MessageFormData>) => api.put(`/flow-messages/${id}`, data),
  delete: (id: number) => api.delete(`/flow-messages/${id}`),
};

// Conversas
export const conversationsApi = {
  list: (params?: ConversationFilters) => api.get<UserConversation[]>('/conversations', { params }),
  getHistory: (id: number) => api.get<MessageHistory[]>(`/conversations/${id}/history`),
  end: (id: number) => api.post(`/conversations/${id}/end`),
};

// Analytics
export const analyticsApi = {
  conversations: () => api.get<ConversationAnalytics>('/analytics/conversations'),
  files: () => api.get<FileAnalytics>('/analytics/files'),
};

// Bot Controls
export const botApi = {
  getStatus: () => api.get<BotStatus>('/bot/status'),
  enable: () => api.post('/bot/enable'),
  disable: () => api.post('/bot/disable'),
  setTestMode: (enabled: boolean) => api.post('/bot/test-mode', { enabled }),
};

// Settings
export const settingsApi = {
  get: () => api.get<SystemSettings>('/settings'),
  update: (key: string, value: any, type?: string) => api.put(`/settings/${key}`, { value, type }),
};
```

## Hooks Personalizados

### useTemplates
```typescript
// lib/hooks/useTemplates.ts
import useSWR from 'swr';
import { templatesApi } from '../api';

export function useTemplates() {
  const { data, error, isLoading, mutate } = useSWR(
    'templates',
    () => templatesApi.list().then(res => res.data)
  );

  const createTemplate = async (templateData: TemplateFormData) => {
    const response = await templatesApi.create(templateData);
    mutate(); // Revalidar dados
    return response.data;
  };

  const updateTemplate = async (id: number, templateData: Partial<TemplateFormData>) => {
    const response = await templatesApi.update(id, templateData);
    mutate();
    return response.data;
  };

  const deleteTemplate = async (id: number) => {
    await templatesApi.delete(id);
    mutate();
  };

  return {
    templates: data || [],
    isLoading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refresh: mutate
  };
}
```

### useFlowBuilder
```typescript
// lib/hooks/useFlowBuilder.ts
import { useState, useCallback } from 'react';
import { Flow, Subflow, FlowMessage } from '../types';

export function useFlowBuilder(templateId: number) {
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [selectedSubflow, setSelectedSubflow] = useState<Subflow | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<FlowMessage | null>(null);
  
  const { flows } = useFlows(templateId);
  const { subflows } = useSubflows(selectedFlow?.id);
  const { messages } = useMessages(selectedSubflow?.id);

  const selectFlow = useCallback((flow: Flow) => {
    setSelectedFlow(flow);
    setSelectedSubflow(null);
    setSelectedMessage(null);
  }, []);

  const selectSubflow = useCallback((subflow: Subflow) => {
    setSelectedSubflow(subflow);
    setSelectedMessage(null);
  }, []);

  const selectMessage = useCallback((message: FlowMessage) => {
    setSelectedMessage(message);
  }, []);

  return {
    flows,
    subflows,
    messages,
    selectedFlow,
    selectedSubflow,
    selectedMessage,
    selectFlow,
    selectSubflow,
    selectMessage
  };
}
```

### useBotStatus
```typescript
// lib/hooks/useBotStatus.ts
import useSWR from 'swr';
import { botApi } from '../api';
import { toast } from 'react-hot-toast';

export function useBotStatus() {
  const { data, error, isLoading, mutate } = useSWR(
    'bot-status',
    () => botApi.getStatus().then(res => res.data),
    { refreshInterval: 30000 } // Refresh a cada 30s
  );

  const enableBot = async () => {
    try {
      await botApi.enable();
      mutate();
      toast.success('Bot ativado com sucesso');
    } catch (error) {
      toast.error('Erro ao ativar bot');
    }
  };

  const disableBot = async () => {
    try {
      await botApi.disable();
      mutate();
      toast.success('Bot desativado com sucesso');
    } catch (error) {
      toast.error('Erro ao desativar bot');
    }
  };

  const toggleTestMode = async (enabled: boolean) => {
    try {
      await botApi.setTestMode(enabled);
      mutate();
      toast.success(`Modo teste ${enabled ? 'ativado' : 'desativado'}`);
    } catch (error) {
      toast.error('Erro ao alterar modo teste');
    }
  };

  return {
    status: data,
    isLoading,
    error,
    enableBot,
    disableBot,
    toggleTestMode,
    refresh: mutate
  };
}
```

## Páginas Principais

### Dashboard
```typescript
// app/(dashboard)/dashboard/page.tsx
import { DashboardStats } from '@/components/analytics/DashboardStats';
import { ConversationCharts } from '@/components/analytics/ConversationCharts';
import { RealtimeMetrics } from '@/components/analytics/RealtimeMetrics';
import { BotControls } from '@/components/settings/BotControls';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <BotControls />
      </div>
      
      <DashboardStats />
      <RealtimeMetrics />
      <ConversationCharts />
    </div>
  );
}
```

### Templates
```typescript
// app/(dashboard)/templates/page.tsx
import { TemplateList } from '@/components/templates/TemplateList';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Templates de Fluxo</h1>
        <Link href="/templates/new">
          <Button>Novo Template</Button>
        </Link>
      </div>
      
      <TemplateList />
    </div>
  );
}
```

### Flow Builder
```typescript
// app/(dashboard)/templates/[id]/flows/[flowId]/page.tsx
import { FlowBuilder } from '@/components/flows/FlowBuilder';

interface Props {
  params: { id: string; flowId: string };
}

export default function FlowBuilderPage({ params }: Props) {
  const templateId = parseInt(params.id);
  const flowId = parseInt(params.flowId);

  return (
    <div className="h-full">
      <FlowBuilder templateId={templateId} flowId={flowId} />
    </div>
  );
}
```

### Conversas
```typescript
// app/(dashboard)/conversations/page.tsx
import { ConversationList } from '@/components/conversations/ConversationList';
import { ConversationFilters } from '@/components/conversations/ConversationFilters';

export default function ConversationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Conversas Ativas</h1>
      </div>
      
      <ConversationFilters />
      <ConversationList />
    </div>
  );
}
```

## Componentes Principais

### FlowBuilder
```typescript
// components/flows/FlowBuilder.tsx
interface FlowBuilderProps {
  templateId: number;
  flowId: number;
}

export function FlowBuilder({ templateId, flowId }: FlowBuilderProps) {
  const flowBuilder = useFlowBuilder(templateId);

  return (
    <div className="grid grid-cols-12 h-full">
      {/* Sidebar com fluxos e subfluxos */}
      <div className="col-span-3 border-r bg-gray-50">
        <FlowSidebar {...flowBuilder} />
      </div>
      
      {/* Canvas principal */}
      <div className="col-span-6">
        <FlowCanvas {...flowBuilder} />
      </div>
      
      {/* Painel de propriedades */}
      <div className="col-span-3 border-l bg-gray-50">
        <FlowPropertiesPanel {...flowBuilder} />
      </div>
    </div>
  );
}
```

### MessageEditor
```typescript
// components/flows/MessageEditor.tsx
interface MessageEditorProps {
  message?: FlowMessage;
  subflowId: number;
  onSave: (data: MessageFormData) => void;
  onCancel: () => void;
}

export function MessageEditor({ message, subflowId, onSave, onCancel }: MessageEditorProps) {
  const { register, handleSubmit, watch, setValue } = useForm<MessageFormData>({
    defaultValues: message || {
      subflow_id: subflowId,
      message_text: '',
      message_type: 'text',
      wait_for_response: true,
      wait_for_file: false, // ✓ Campo principal
      expected_file_types: [],
      delay_seconds: 0,
    }
  });

  const waitForFile = watch('wait_for_file');

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Texto da Mensagem
        </label>
        <textarea
          {...register('message_text', { required: true })}
          rows={4}
          className="w-full border rounded-md p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Tipo de Mensagem
        </label>
        <select {...register('message_type')} className="w-full border rounded-md p-2">
          <option value="text">Texto</option>
          <option value="image">Imagem</option>
          <option value="document">Documento</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          {...register('wait_for_response')}
          id="wait_response"
        />
        <label htmlFor="wait_response" className="text-sm">
          Aguardar resposta do usuário
        </label>
      </div>

      {/* ✓ Campo específico para recebimento de arquivos */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          {...register('wait_for_file')}
          id="wait_file"
        />
        <label htmlFor="wait_file" className="text-sm">
          Aguardar envio de arquivo
        </label>
      </div>

      {waitForFile && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Tipos de arquivo esperados
          </label>
          <input
            type="text"
            {...register('expected_file_types')}
            placeholder="pdf, doc, jpg, png (separados por vírgula)"
            className="w-full border rounded-md p-2"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          Delay (segundos)
        </label>
        <input
          type="number"
          {...register('delay_seconds')}
          min="0"
          className="w-full border rounded-md p-2"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {message ? 'Atualizar' : 'Criar'} Mensagem
        </Button>
      </div>
    </form>
  );
}
```

### BotControls
```typescript
// components/settings/BotControls.tsx
export function BotControls() {
  const { status, enableBot, disableBot, toggleTestMode } = useBotStatus();

  if (!status) return <div>Carregando...</div>;

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="text-lg font-medium mb-4">Controle do Bot</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Status do Bot</span>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={status.bot_enabled ? 'success' : 'danger'}
            >
              {status.bot_enabled ? 'Ativo' : 'Inativo'}
            </Badge>
            <Switch 
              checked={status.bot_enabled}
              onChange={status.bot_enabled ? disableBot : enableBot}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Modo Teste</span>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={status.test_mode ? 'warning' : 'default'}
            >
              {status.test_mode ? 'Ativo' : 'Inativo'}
            </Badge>
            <Switch 
              checked={status.test_mode}
              onChange={toggleTestMode}
            />
          </div>
        </div>

        {status.test_mode && (
          <div className="text-xs text-gray-500">
            Testando apenas com contato: {status.test_contact_id}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Validação com Zod

### Schemas de Validação
```typescript
// lib/validation.ts
import { z } from 'zod';

export const templateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  description: z.string().optional(),
  created_by: z.number().optional(),
});

export const flowSchema = z.object({
  template_id: z.number(),
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  description: z.string().optional(),
  is_default: z.boolean().optional(),
  order_index: z.number().min(0).optional(),
});

export const subflowSchema = z.object({
  flow_id: z.number(),
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  description: z.string().optional(),
  parent_subflow_id: z.number().optional(),
  trigger_keywords: z.array(z.string()),
  order_index: z.number().min(0).optional(),
});

export const messageSchema = z.object({
  subflow_id: z.number(),
  message_text: z.string().min(1, 'Texto da mensagem é obrigatório'),
  message_type: z.enum(['text', 'image', 'document']),
  order_index: z.number().min(0).optional(),
  wait_for_response: z.boolean().optional(),
  wait_for_file: z.boolean().optional(), // ✓ Validação do campo principal
  expected_file_types: z.array(z.string()),
  delay_seconds: z.number().min(0).optional(),
});
```

## Configuração do Next.js

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

### Variáveis de Ambiente
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Chatbot Admin
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Funcionalidades Específicas

### Export/Import de Templates
```typescript
// lib/hooks/useExportImport.ts
export function useExportImport() {
  const exportTemplate = async (templateId: number) => {
    try {
      const response = await templatesApi.export(templateId);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      saveAs(blob, `template-${templateId}.json`);