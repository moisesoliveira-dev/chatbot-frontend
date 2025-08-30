# Chatbot Admin - Frontend Next.js

Sistema administrativo frontend para gerenciamento do sistema de chatbot em Python/Flask.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **SWR** - Cache e sincronização de dados
- **React Hook Form + Zod** - Formulários e validação
- **Framer Motion** - Animações
- **Recharts** - Gráficos e visualizações

## 🏗️ Estrutura do Projeto

```
src/
├── app/                        # App Router (Next.js 14)
│   ├── (dashboard)/           # Grupo de rotas do dashboard
│   │   ├── dashboard/         # 📊 Dashboard principal
│   │   ├── templates/         # 📄 Gerenciamento de templates
│   │   ├── conversations/     # 💬 Conversas ativas
│   │   ├── analytics/         # 📈 Analytics e relatórios
│   │   └── settings/          # ⚙️ Configurações
│   └── layout.tsx            # Layout raiz
├── components/
│   ├── ui/                   # 🎨 Componentes base reutilizáveis
│   ├── layout/               # 🏗️ Layout (Sidebar, Header, Breadcrumb)
│   ├── templates/            # 📄 Componentes de templates
│   ├── flows/                # 🔀 Construtor de fluxos
│   ├── conversations/        # 💬 Componentes de conversas
│   ├── analytics/            # 📈 Componentes de analytics
│   └── settings/             # ⚙️ Componentes de configurações
└── lib/
    ├── api.ts               # Cliente HTTP para backend
    ├── types.ts             # Tipos TypeScript
    ├── utils.ts             # Utilitários
    ├── validation.ts        # Schemas Zod
    └── hooks/               # Custom hooks
```

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Backend Python/Flask rodando

### Instalação

1. **Clone e instale dependências:**
```bash
cd chatbot-frontend
npm install
```

2. **Configure variáveis de ambiente:**
```bash
cp .env.example .env.local
```

Edite `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Chatbot Admin
NEXT_PUBLIC_APP_VERSION=1.0.0
```

3. **Execute o servidor de desenvolvimento:**
```bash
npm run dev
```

4. **Abra no navegador:**
```
http://localhost:3000
```

## 📋 Status do Desenvolvimento

### ✅ FASE 1 - ESTRUTURA BÁSICA (CONCLUÍDA)
- [x] Setup Next.js 14 com TypeScript
- [x] Configuração Tailwind CSS personalizado
- [x] Sistema de rotas com App Router
- [x] Layout responsivo com Sidebar/Header
- [x] Páginas básicas criadas
- [x] Sistema de navegação funcional

### 🔄 PRÓXIMAS FASES
- **FASE 2** - Sistema de tipos e API client
- **FASE 3** - Componentes UI básicos
- **FASE 4** - Dashboard com dados reais
- **FASE 5** - CRUD de templates
- **FASE 6** - Construtor visual de fluxos
- **FASE 7** - Monitoramento de conversas
- **FASE 8** - Analytics e relatórios
- **FASE 9** - Configurações avançadas
- **FASE 10** - Otimização e polish
- **FASE 11** - Deploy e produção

## 🔗 Integração com Backend

O frontend se conecta com o backend Python/Flask através de:

- **Proxy automático** - `/api/backend/*` → `http://localhost:8000/api/*`
- **Cliente HTTP Axios** - Configurado com interceptors
- **SWR para cache** - Gerenciamento inteligente de cache
- **Tipos TypeScript** - Matching com APIs do backend

## 🎨 Componentes Principais

### Layout
- **Sidebar** - Navegação principal
- **Header** - Breadcrumbs e controles
- **Dashboard** - Métricas em tempo real

### Funcionalidades Planejadas
- **FlowBuilder** - Editor visual de fluxos
- **MessageEditor** - Com suporte a `wait_for_file`
- **ConversationMonitor** - Monitoramento em tempo real
- **Analytics** - Gráficos e relatórios
- **BotControls** - Controle do bot (ativar/pausar/teste)

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting com ESLint
npm run type-check   # Verificação de tipos TypeScript
```

## 📚 Documentação Adicional

- [Status Detalhado do Projeto](../projeto_chatbot_frontend_status.md)
- [Documentação do Backend](../chatbot_documentation.md)
- [Status do Backend](../projeto_chatbot_status.md)

## 🎯 Próximos Passos

1. **Implementar FASE 2** - Cliente API e tipos TypeScript
2. **Conectar com backend real** - Teste de integração
3. **Criar componentes UI** - Sistema de design consistente
4. **Dashboard funcional** - Métricas em tempo real

---

**Status atual:** ✅ FASE 1 CONCLUÍDA - Estrutura básica funcionando
**Próximo objetivo:** 🎯 FASE 2 - Sistema de tipos e API client
