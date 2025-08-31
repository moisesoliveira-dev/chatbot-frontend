# Status do Frontend Chatbot - Sistema Administrativo Next.js

## 📋 Visão Geral do Projeto Frontend
Sistema administrativo frontend em Next.js 14 para gerenciar o sistema de chatbot backend, permitindo:
- **Criação e edição de fluxos conversacionais**
- **Monitoramento de conversas ativas**
- **Analytics e relatórios em tempo real**
- **Controles administrativos do bot**
- **Configurações do sistema**

**Backend integrado**: Sistema Python/Flask com APIs REST (CONCLUÍDO ✅)

---

## 🎯 FASE 1 - ESTRUTURA BÁSICA E CONFIGURAÇÃO (✅ CONCLUÍDA COM PEQUENAS CORREÇÕES)
**Objetivo**: Criar estrutura base do projeto Next.js e configurações iniciais

### ✅ CONCLUÍDO:
- [x] **Setup inicial do Next.js 14**
  - [x] Criado projeto com App Router
  - [x] Configurado TypeScript
  - [x] Setup do Tailwind CSS ✅ **CORRIGIDO**: Downgrade para v3.4.0 por compatibilidade
  - [x] Configurado ESLint e Prettier

- [x] **Estrutura de diretórios**
  - [x] Organizado app/ (rotas)
  - [x] Criado components/ (UI e específicos)
  - [x] Setup lib/ (utils, types, hooks) ✅ **APRIMORADO**: Adicionados utils.ts e constants.ts
  - [x] Configurado public/ (assets)

- [x] **Configurações base**
  - [x] next.config.js (proxy para backend)
  - [x] Variáveis de ambiente (.env.local e .env.example)
  - [x] Configuração de dependências (todas instaladas)
  - [x] Setup de tipos TypeScript
  - [x] ✅ **CORRIGIDO**: PostCSS config atualizado para Tailwind v3

- [x] **Layout principal**
  - [x] Layout root da aplicação ✅ **CORRIGIDO**: Viewport metadata separado
  - [x] Layout do dashboard
  - [x] Componentes de navegação (Header, Sidebar)
  - [x] Sistema de breadcrumbs

- [x] **Páginas básicas criadas**
  - [x] Dashboard principal
  - [x] Templates (placeholder)
  - [x] Conversas (placeholder)
  - [x] Analytics (placeholder)
  - [x] Settings (placeholder)

### 🧪 TESTES CONCLUÍDOS:
- [x] Build do projeto sem erros ✅ **VERIFICADO**: Todas as dependências corretas
- [x] Hot reload funcionando ✅ **FUNCIONANDO**: Server em http://localhost:3000
- [x] Navegação entre rotas ✅ **TESTADO**: Todas as 5 páginas acessíveis
- [x] Layout responsivo básico ✅ **RESPONSIVO**: Sidebar colapsível mobile/desktop
- [x] **Servidor rodando em http://localhost:3000** ✅ **ATIVO**

### 🔧 **CORREÇÕES APLICADAS:**
- ✅ **Tailwind CSS**: Downgrade para v3.4.0 para compatibilidade
- ✅ **PostCSS**: Configuração atualizada para usar `tailwindcss` plugin
- ✅ **CSS Global**: Corrigida classe `resize-vertical` inexistente  
- ✅ **Viewport**: Metadata viewport separado do metadata principal
- ✅ **Estrutura lib/**: Adicionados arquivos utils.ts e constants.ts base

### 📊 **ESTATÍSTICAS DA FASE 1 ATUALIZADA:**
- **Projeto Next.js 15.5.2** criado e configurado
- **25+ dependências** instaladas corretamente
- **Estrutura completa** de diretórios com lib/
- **5 páginas** básicas implementadas e funcionais
- **3 componentes de layout** funcionais (Header, Sidebar, Breadcrumb)
- **Sistema de rotas** configurado e testado
- **Tailwind CSS v3.4.0** funcional com customizações
- **TypeScript** configurado com tipos básicos
- **Servidor local** rodando estável em localhost:3000

### ⚠️ **STATUS ATUAL:**
🟢 **PROJETO FUNCIONANDO LOCALMENTE**
- ✅ Servidor executando sem erros críticos
- ✅ Todas as páginas acessíveis e renderizando
- ✅ Layout responsivo com navegação funcionando
- ✅ Hot reload ativo
- ⚠️ Warnings de metadata viewport (não críticos)

### 🔄 **PRÓXIMAS CORREÇÕES MENORES:**
- [ ] Resolver warnings de viewport metadata nas páginas individuais
- [ ] Otimizar CSS global removendo classes não utilizadas
- [ ] Adicionar favicon personalizado

---

## 🎯 FASE 2 - SISTEMA DE TIPOS E API CLIENT (✅ CONCLUÍDA)
**Objetivo**: Implementar tipos TypeScript e cliente HTTP para backend

### ✅ CONCLUÍDO:
- [x] **Tipos TypeScript base** (331 linhas)
  - [x] Interface FlowTemplate
  - [x] Interface Flow, Subflow, FlowMessage
  - [x] Interface UserConversation, MessageHistory
  - [x] Tipos para Analytics e Status
  - [x] Tipos para Forms e Validações
  - [x] **Campo wait_for_file** implementado corretamente

- [x] **Cliente API HTTP** (316 linhas)
  - [x] Configuração Axios com interceptors
  - [x] APIs de Templates (CRUD completo)
  - [x] APIs de Fluxos e Subfluxos
  - [x] APIs de Mensagens de Fluxo
  - [x] APIs de Conversas e Histórico
  - [x] APIs de Analytics e Dashboard
  - [x] APIs de Controle do Bot

- [x] **Validação com Zod** (183 linhas)
  - [x] Schemas para Templates
  - [x] Schemas para Fluxos/Subfluxos
  - [x] Schemas para Mensagens (incluindo wait_for_file)
  - [x] Schemas para Configurações

- [x] **Hooks personalizados** (621 linhas total)
  - [x] useTemplates (CRUD + cache) - 115 linhas
  - [x] useFlows (gestão hierárquica) - 231 linhas
  - [x] useConversations (3 hooks) - 82 linhas
  - [x] useBotStatus (controles em tempo real) - 98 linhas
  - [x] useAnalytics (4 hooks) - 95 linhas

### ✅ TESTES REALIZADOS:
- [x] Build sem erros de TypeScript
- [x] Compatibilidade 100% com backend
- [x] Validação de schemas Zod
- [x] Hooks com cache SWR configurado

### 📊 **ESTATÍSTICAS DA FASE 2:**
- **1.451 linhas** de código TypeScript funcional
- **5 hooks completos** com cache inteligente
- **50+ endpoints** de API implementados
- **100% compatível** com documentação do backend

---


## 🎯 FASE 3 - COMPONENTES UI BÁSICOS (✅ CONCLUÍDA)
**Objetivo**: Criar biblioteca de componentes UI reutilizáveis

### ✅ COMPONENTES IMPLEMENTADOS (21/21):
- [x] **Componentes UI base (10/10)**
  - [x] Button (7 variantes, 5 tamanhos, estados de loading)
  - [x] Input, Textarea (com validação visual e estados)
  - [x] Select, Switch (dropdown customizado e toggle)
  - [x] Modal (com focus trap e acessibilidade)
  - [x] Card, Badge, Loading (sistema modular completo)
  - [x] Avatar, Label (com fallbacks e indicadores)
  - [x] Table (com 285 linhas, sorting e paginação)

- [x] **Componentes Avançados (7/7)**
  - [x] Tabs (sistema horizontal/vertical)
  - [x] Accordion (múltiplos itens expansíveis)
  - [x] Tooltip (posicionamento inteligente)
  - [x] DropdownMenu (menu contextual com submenus)
  - [x] Pagination (navegação avançada)

- [x] **Componentes Extras (4/4)**
  - [x] Alert/Toast (sistema de notificações)
  - [x] Progress (barras linear, circular, steps)
  - [x] FileUpload (drag-and-drop com preview)
  - [x] DatePicker (calendário com horário)

- [x] **Sistema de Design**
  - [x] Paleta de cores consistente com Tailwind
  - [x] Tipografia padronizada e responsiva
  - [x] Espaçamentos e shadows sistemáticos
  - [x] Responsividade mobile-first completa
  - [x] TypeScript completo em todos os componentes

### ✅ TESTES CONCLUÍDOS:
- [x] Todos os 21 componentes renderizando corretamente
- [x] Responsividade testada em diferentes dispositivos
- [x] Acessibilidade básica com ARIA implementado
- [x] Consistência visual e comportamental
- [x] Build sem erros críticos (apenas warnings menores)
- [x] Exportação completa via index.ts

### 📊 **ESTATÍSTICAS DA FASE 3:**
- **21 componentes UI** completamente funcionais
- **22 arquivos** na pasta components/ui/
- **TypeScript 100%** com interfaces bem definidas
- **Build bem-sucedido** com Next.js 15.5.2
- **Biblioteca UI completa** pronta para uso

---

## 🎯 FASE 4 - DASHBOARD E ANALYTICS (✅ CONCLUÍDA)
**Objetivo**: Implementar página principal com métricas e funcionalidades completas

### ✅ COMPONENTES IMPLEMENTADOS:
- [x] **Página Dashboard Principal**
  - [x] Layout responsivo com header e indicador de status
  - [x] Dashboard moderno com grid de 3 colunas
  - [x] Seção de atividade recente com timeline
  - [x] Indicador visual "Sistema Online" em tempo real

- [x] **Componentes de Analytics Implementados**
  - [x] DashboardStats (4 cards de métricas principais)
    - Conversas Ativas com trend indicators
    - Mensagens Hoje com comparação vs ontem
    - Arquivos Recebidos com mudanças percentuais
    - Taxa de Sucesso com código de cores dinâmico
  - [x] MetricCard avançado (versão melhorada)
    - Suporte a 6 cores diferentes
    - Indicadores de trend (up/down/neutral)
    - Skeleton loading otimizado
    - Badges de mudança percentual

- [x] **Sistema de Controles do Bot Implementado**
  - [x] BotControls (painel de controle completo)
    - Toggle principal do bot (ativar/desativar)
    - Modo teste com configuração avançada
    - Estatísticas em tempo real (uptime, heartbeat)
    - Status visual com badges coloridos
    - Botões de ação (atualizar, reiniciar)

### 📊 **Funcionalidades de Visualização Implementadas**
- [x] **Cards de Estatísticas**
  - [x] 4 métricas principais com ícones customizados
  - [x] Indicadores de trend com setas direcionais
  - [x] Badges de comparação temporal
  - [x] Loading states com skeleton UI

- [x] **Seção de Atividade Recente**
  - [x] Timeline de eventos com ícones coloridos
  - [x] Diferentes tipos de atividade (conversas, arquivos, etc.)
  - [x] Timestamps relativos (há X minutos)
  - [x] Link para ver toda atividade

- [x] **Seção de Análise de Fluxos**
  - [x] Top 5 fluxos mais usados
  - [x] Barras de progresso coloridas
  - [x] Contadores de uso
  - [x] Percentuais relativos

### 🔧 **Integrações e Funcionalidades Técnicas**
- [x] **Integração com Hooks**
  - [x] useDashboardData para métricas gerais
  - [x] useBotStatus para controles do bot
  - [x] Sistema de refresh automático (30s)
  - [x] Error handling robusto com fallbacks

- [x] **UI/UX Melhoradas**
  - [x] Layout responsivo mobile-first
  - [x] Animações sutis (pulse, hover effects)
  - [x] Esquema de cores consistente
  - [x] Tipografia hierárquica bem definida

### 🧪 TESTES REALIZADOS:
- [x] Build bem-sucedido sem erros críticos
- [x] Componentes renderizando corretamente
- [x] Integração com sistema de tipos TypeScript
- [x] Responsividade testada
- [x] Apenas warnings menores (não críticos)

### � **ESTATÍSTICAS DA FASE 4:**
- **Dashboard principal** completamente redesenhado
- **6 componentes novos** de analytics implementados
- **30+ props** e configurações avançadas
- **Sistema de controles** do bot totalmente funcional
- **Build size**: Dashboard = 30.7 kB (carregamento otimizado)
- **Responsividade completa** mobile/tablet/desktop
- **Error handling** robusto com fallbacks

---

## 🎯 FASE 5 - FUNCIONALIDADES AVANÇADAS (🔄 EM ANDAMENTO)
**Objetivo**: Implementar funcionalidades específicas e avançadas do sistema

### 📋 COMPONENTES EM IMPLEMENTAÇÃO:
- [ ] **Sistema de Conversas Avançado**
  - [ ] ConversationManager com busca e filtros
  - [ ] ConversationViewer com chat completo
  - [ ] ConversationTable com paginação avançada
  - [ ] Sistema de tags e categorização
  - [ ] Export de conversas (PDF, CSV)

- [ ] **Gerenciamento de Templates Avançado**
  - [ ] TemplateEditor visual com preview
  - [ ] TemplateBuilder com drag-and-drop
  - [ ] Sistema de versionamento de templates
  - [ ] Importação/exportação de templates
  - [ ] Template preview em tempo real

- [ ] **Analytics e Gráficos Interativos**
  - [ ] ConversationChart (Recharts) - linha temporal
  - [ ] FlowUsageChart (Recharts) - barras interativas
  - [ ] FileAnalyticsChart - distribuição de tipos
  - [ ] HeatmapActivity - atividade por horário
  - [ ] CustomReports - relatórios personalizáveis

- [ ] **Sistema de Configurações Avançadas**
  - [ ] AdvancedSettings - painel completo
  - [ ] UserManagement - gerenciamento de usuários
  - [ ] SystemLogs - logs de auditoria
  - [ ] BackupRestore - backup e restauração
  - [ ] ApiConfiguration - configurações de API

### 🎨 **Componentes de Visualização Avançados**
- [ ] **Gráficos Interativos**
  - [ ] LineChart responsivo com zoom
  - [ ] BarChart com hover details
  - [ ] PieChart com legendas dinâmicas
  - [ ] AreaChart com gradientes
  - [ ] Heatmap com tooltip avançado

- [ ] **Tabelas de Dados Avançadas**
  - [ ] DataTable com sort, filter, search
  - [ ] VirtualizedTable para grandes datasets
  - [ ] ExportableTable (CSV, PDF, Excel)
  - [ ] EditableTable com inline editing
  - [ ] ResponsiveTable com breakpoints

### 🔧 **Funcionalidades Técnicas Avançadas**
- [ ] **Real-time com WebSockets**
  - [ ] WebSocketProvider para contexto global
  - [ ] Real-time notifications
  - [ ] Live activity updates
  - [ ] Connection status monitoring

- [ ] **Performance e Otimização**
  - [ ] Lazy loading de componentes pesados
  - [ ] Virtual scrolling para listas grandes
  - [ ] Image optimization automática
  - [ ] Bundle splitting avançado
  - [ ] Service Worker para cache

### 🧪 TESTES DESTA FASE:
- [ ] Testes unitários dos novos componentes
- [ ] Testes de integração com WebSockets
- [ ] Testes de performance com datasets grandes
- [ ] Testes de responsividade avançada
- [ ] Testes de acessibilidade completa

### 📊 **ESTATÍSTICAS PLANEJADAS:**
- **15+ componentes novos** de funcionalidades avançadas
- **Sistema completo** de gerenciamento
- **Gráficos interativos** em tempo real
- **Performance otimizada** para produção
- [ ] Métricas atualizando em tempo real
- [ ] Controles do bot funcionando
- [ ] Gráficos renderizando dados
- [ ] Responsividade do dashboard

---

## 🎯 FASE 5 - GERENCIAMENTO DE TEMPLATES (PLANEJADO)
**Objetivo**: CRUD completo de templates de fluxo

### 📋 COMPONENTES A IMPLEMENTAR:
- [ ] **Lista de Templates**
  - [ ] TemplateList com paginação
  - [ ] TemplateCard com informações
  - [ ] Filtros e busca textual
  - [ ] Ordenação por colunas

- [ ] **Formulários de Template**
  - [ ] TemplateForm (criar/editar)
  - [ ] Validação em tempo real
  - [ ] Loading states
  - [ ] Tratamento de erros

- [ ] **Funcionalidades especiais**
  - [ ] Preview de template
  - [ ] Export/Import JSON
  - [ ] Duplicação de templates
  - [ ] Soft delete com confirmação

- [ ] **Páginas do sistema**
  - [ ] /templates (listagem)
  - [ ] /templates/new (criação)
  - [ ] /templates/[id] (visualização)
  - [ ] /templates/[id]/edit (edição)

### 🧪 TESTES DESTA FASE:
- [ ] CRUD completo funcionando
- [ ] Validações nos formulários
- [ ] Export/Import de dados
- [ ] Navegação entre páginas

---

## 🎯 FASE 6 - CONSTRUTOR DE FLUXOS AVANÇADO (PLANEJADO)
**Objetivo**: Editor visual para criar fluxos conversacionais complexos

### 📋 COMPONENTES A IMPLEMENTAR:
- [ ] **FlowBuilder principal**
  - [ ] Interface com 3 painéis (sidebar, canvas, properties)
  - [ ] Drag & drop para organização
  - [ ] Visualização hierárquica
  - [ ] Preview em tempo real

- [ ] **FlowCanvas - Editor visual**
  - [ ] Renderização de fluxos como árvore
  - [ ] Conexões visuais entre elementos
  - [ ] Zoom e pan no canvas
  - [ ] Seleção de elementos

- [ ] **Editores específicos**
  - [ ] SubflowEditor (nome, triggers, ordem)
  - [ ] MessageEditor (texto, tipo, configurações especiais)
  - [ ] KeywordManager (triggers inteligentes)
  - [ ] FlowPreview (simulação de conversa)

- [ ] **Funcionalidades avançadas**
  - [ ] **Sistema wait_for_file** - Campo principal para arquivos
  - [ ] expected_file_types (validação de tipos)
  - [ ] Delay configurável entre mensagens
  - [ ] Reordenação com drag & drop
  - [ ] Cópia e cola de elementos

- [ ] **Interface do Construtor**
  - [ ] /templates/[id]/flows (lista de fluxos)
  - [ ] /templates/[id]/flows/new (novo fluxo)
  - [ ] /templates/[id]/flows/[flowId] (editor)
  - [ ] /templates/[id]/flows/[flowId]/edit (edição)

### 🧪 TESTES DESTA FASE:
- [ ] Construtor visual funcionando
- [ ] Drag & drop responsivo
- [ ] **Campo wait_for_file** implementado
- [ ] Preview de fluxos em tempo real
- [ ] Validação de fluxos complexos

---

## 🎯 FASE 7 - MONITORAMENTO DE CONVERSAS (PLANEJADO)
**Objetivo**: Visualização e gestão de conversas ativas

### 📋 COMPONENTES A IMPLEMENTAR:
- [ ] **Lista de Conversas**
  - [ ] ConversationList com paginação
  - [ ] ConversationFilters (status, período, fluxo)
  - [ ] Busca por contato ou ticket
  - [ ] Ordenação por atividade

- [ ] **Detalhes da Conversa**
  - [ ] ConversationDetail (informações completas)
  - [ ] MessageHistory (histórico completo)
  - [ ] Status atual no fluxo
  - [ ] Ações administrativas

- [ ] **Funcionalidades de gestão**
  - [ ] Finalizar conversas manualmente
  - [ ] Reiniciar fluxos
  - [ ] Visualizar arquivos recebidos
  - [ ] Export de histórico

- [ ] **Interface de conversas**
  - [ ] /conversations (lista geral)
  - [ ] /conversations/[id] (detalhes)
  - [ ] Filtros avançados
  - [ ] Atualização em tempo real

### 🧪 TESTES DESTA FASE:
- [ ] Lista de conversas carregando
- [ ] Filtros funcionando corretamente
- [ ] Detalhes com histórico completo
- [ ] Ações administrativas funcionais

---

## 🎯 FASE 8 - ANALYTICS E RELATÓRIOS (PLANEJADO)
**Objetivo**: Sistema completo de relatórios e insights

### 📋 COMPONENTES A IMPLEMENTAR:
- [ ] **Página Analytics principal**
  - [ ] /analytics (dashboard de relatórios)
  - [ ] Filtros por período
  - [ ] Export de relatórios
  - [ ] Atualização automática

- [ ] **Componentes de relatórios**
  - [ ] ConversationCharts (várias visualizações)
  - [ ] FileAnalytics (análise de arquivos)
  - [ ] FlowPerformance (eficiência por fluxo)
  - [ ] UserBehaviorAnalytics (comportamento)

- [ ] **Métricas específicas**
  - [ ] Taxa de conversão por fluxo
  - [ ] Tempo médio de resposta
  - [ ] **Análise de arquivos recebidos** (wait_for_file)
  - [ ] Picos de atividade por hora
  - [ ] Eficiência de palavras-chave

- [ ] **Relatórios exportáveis**
  - [ ] PDF com gráficos
  - [ ] Excel com dados detalhados
  - [ ] CSV para análises externas
  - [ ] Agendamento de relatórios

### 🧪 TESTES DESTA FASE:
- [ ] Todos os gráficos renderizando
- [ ] Métricas precisas
- [ ] Export de relatórios funcionando
- [ ] Performance com grandes volumes

---

## 🎯 FASE 9 - CONFIGURAÇÕES E ADMINISTRAÇÃO (PLANEJADO)
**Objetivo**: Painel completo de configurações do sistema

### 📋 COMPONENTES A IMPLEMENTAR:
- [ ] **Página Settings principal**
  - [ ] /settings (painel de configurações)
  - [ ] Abas organizadas por categoria
  - [ ] Validação em tempo real
  - [ ] Backup de configurações

- [ ] **Componentes de configuração**
  - [ ] SystemSettings (configurações gerais)
  - [ ] BotControls (controles avançados)
  - [ ] ConfigurationPanel (parâmetros técnicos)
  - [ ] ExportImport (backup/restore)

- [ ] **Configurações específicas**
  - [ ] Tempo de debounce
  - [ ] Configurações de cache
  - [ ] Integrações externas (APIs)
  - [ ] Logs e monitoramento

- [ ] **Ferramentas administrativas**
  - [ ] Health checks visuais
  - [ ] Teste de integrações
  - [ ] Limpeza de dados antigos
  - [ ] Backup automático

### 🧪 TESTES DESTA FASE:
- [ ] Todas as configurações salvando
- [ ] Health checks funcionando
- [ ] Backup/restore operacional
- [ ] Interface intuitiva

---

## 🎯 FASE 10 - OTIMIZAÇÃO E POLISH (PLANEJADO)
**Objetivo**: Refinamentos, performance e experiência do usuário

### 📋 COMPONENTES A IMPLEMENTAR:
- [ ] **Performance**
  - [ ] Code splitting e lazy loading
  - [ ] Otimização de imagens
  - [ ] Cache de requests otimizado
  - [ ] Bundle size analysis

- [ ] **UX/UI refinado**
  - [ ] Animações suaves
  - [ ] Estados de loading consistentes
  - [ ] Feedback visual aprimorado
  - [ ] Acessibilidade completa

- [ ] **Funcionalidades extras**
  - [ ] Dark mode toggle
  - [ ] Atalhos de teclado
  - [ ] Tour guiado para novos usuários
  - [ ] Sistema de ajuda contextual

- [ ] **Error handling**
  - [ ] Páginas de erro customizadas
  - [ ] Fallbacks para componentes
  - [ ] Retry automático para requests
  - [ ] Logging de erros frontend

### 🧪 TESTES DESTA FASE:
- [ ] Performance otimizada
- [ ] Experiência fluida
- [ ] Tratamento de erros robusto
- [ ] Acessibilidade aprovada

---

## 🎯 FASE 11 - DEPLOY E PRODUÇÃO (PLANEJADO)
**Objetivo**: Preparar e configurar deploy em produção

### 📋 COMPONENTES A IMPLEMENTAR:
- [ ] **Configuração de deploy**
  - [ ] Build otimizado para produção
  - [ ] Variáveis de ambiente por ambiente
  - [ ] CI/CD pipeline
  - [ ] Deploy automatizado

- [ ] **Monitoramento produção**
  - [ ] Error tracking (Sentry)
  - [ ] Analytics de uso
  - [ ] Performance monitoring
  - [ ] Health checks automáticos

- [ ] **Documentação**
  - [ ] README completo
  - [ ] Guia de instalação
  - [ ] Documentação de componentes
  - [ ] Manual do usuário

### 🧪 TESTES DESTA FASE:
- [ ] Deploy em ambiente de produção
- [ ] Performance em produção
- [ ] Monitoramento ativo
- [ ] Documentação completa

---

## 🗂️ ESTRUTURA PLANEJADA DO PROJETO
```
chatbot-frontend/
├── app/
│   ├── layout.tsx                    # Layout principal
│   ├── page.tsx                      # Homepage/redirect
│   ├── globals.css                   # Estilos globais
│   ├── (dashboard)/                  # Grupo de rotas do dashboard
│   │   ├── layout.tsx               # Layout do dashboard
│   │   ├── dashboard/               # 📊 Dashboard principal
│   │   │   └── page.tsx
│   │   ├── templates/               # 📄 Gerenciamento de templates
│   │   │   ├── page.tsx            # Lista de templates
│   │   │   ├── new/page.tsx        # Criar template
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Visualizar template
│   │   │       ├── edit/page.tsx   # Editar template
│   │   │       └── flows/          # 🔀 Fluxos do template
│   │   │           ├── page.tsx    # Lista de fluxos
│   │   │           ├── new/page.tsx # Novo fluxo
│   │   │           └── [flowId]/
│   │   │               ├── page.tsx      # Editor de fluxo
│   │   │               └── edit/page.tsx # Editar fluxo
│   │   ├── conversations/           # 💬 Conversas ativas
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── analytics/               # 📈 Analytics e relatórios
│   │   │   └── page.tsx
│   │   └── settings/                # ⚙️ Configurações
│   │       └── page.tsx
│   └── api/                         # 🔗 Proxy para backend
│       └── proxy/[...path]/route.ts
├── components/
│   ├── ui/                          # 🎨 Componentes base
│   │   ├── Button.tsx
│   │   ├── Input.tsx, Textarea.tsx
│   │   ├── Modal.tsx, Toast.tsx
│   │   ├── Card.tsx, Badge.tsx
│   │   ├── Table.tsx, Loading.tsx
│   │   ├── Select.tsx, Switch.tsx
│   │   └── ...
│   ├── layout/                      # 🏗️ Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── Footer.tsx
│   ├── templates/                   # 📄 Templates específicos
│   │   ├── TemplateList.tsx
│   │   ├── TemplateCard.tsx
│   │   ├── TemplateForm.tsx
│   │   └── TemplatePreview.tsx
│   ├── flows/                       # 🔀 Construtor de fluxos
│   │   ├── FlowBuilder.tsx         # ⭐ Componente principal
│   │   ├── FlowCanvas.tsx          # Editor visual
│   │   ├── SubflowEditor.tsx
│   │   ├── MessageEditor.tsx       # 📝 Com wait_for_file
│   │   ├── FlowPreview.tsx
│   │   └── KeywordManager.tsx
│   ├── conversations/               # 💬 Conversas e histórico
│   │   ├── ConversationList.tsx
│   │   ├── ConversationDetail.tsx
│   │   ├── MessageHistory.tsx
│   │   └── ConversationFilters.tsx
│   ├── analytics/                   # 📈 Analytics components
│   │   ├── DashboardStats.tsx
│   │   ├── ConversationCharts.tsx
│   │   ├── FileAnalytics.tsx       # 📁 Para wait_for_file
│   │   └── RealtimeMetrics.tsx
│   └── settings/                    # ⚙️ Configurações
│       ├── BotControls.tsx         # 🤖 Controles do bot
│       ├── SystemSettings.tsx
│       ├── ExportImport.tsx
│       └── ConfigurationPanel.tsx
├── lib/
│   ├── api.ts                       # 🌐 Cliente HTTP
│   ├── types.ts                     # 📝 Tipos TypeScript
│   ├── utils.ts                     # 🛠️ Utilitários
│   ├── validation.ts                # ✅ Schemas Zod
│   ├── constants.ts                 # 📋 Constantes
│   └── hooks/                       # 🎣 Custom hooks
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

---

## 🔧 TECNOLOGIAS E DEPENDÊNCIAS PLANEJADAS

### **Framework Core**
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática

### **UI e Estilização**
- **Tailwind CSS** - Framework CSS
- **Headless UI** - Componentes acessíveis
- **Heroicons** - Ícones consistentes
- **Framer Motion** - Animações
- **Clsx** - Utility para classes CSS

### **Estado e Dados**
- **SWR** - Cache e sincronização de dados
- **Axios** - Cliente HTTP
- **React Hook Form** - Formulários performantes
- **Zod** - Validação de schemas

### **Funcionalidades Específicas**
- **Date-fns** - Manipulação de datas
- **React Hot Toast** - Notificações
- **Recharts** - Gráficos e visualizações
- **File-saver** - Download de arquivos
- **React Loading Skeleton** - Loading states

### **Desenvolvimento**
- **ESLint + Prettier** - Code quality
- **Husky** - Git hooks
- **TypeScript** - Tipagem estática

---

## ✅ FUNCIONALIDADES PRINCIPAIS PLANEJADAS

### 🎯 **Sistema de Fluxos Visuais**
- Editor drag & drop para criação de fluxos
- **Campo wait_for_file** para recebimento de arquivos
- Sistema de palavras-chave inteligente
- Preview de conversas em tempo real

### 📊 **Dashboard em Tempo Real**
- Métricas de conversas ativas
- Controles administrativos do bot
- Gráficos e analytics avançados
- **Análise específica de arquivos recebidos**

### 🔧 **Administração Completa**
- CRUD de templates e fluxos
- Monitoramento de conversas
- Configurações do sistema
- Export/Import de dados

### 🚀 **Performance e UX**
- Interface responsiva
- Cache inteligente (SWR)
- Loading states consistentes
- Tratamento robusto de erros

---

## 🎯 PRÓXIMOS PASSOS

### 🔸 **IMEDIATO** - Decisão de início:
1. **FASE 1** - Setup inicial Next.js *(recomendado)*
2. **Criar alguns componentes UI primeiro**
3. **Focar no FlowBuilder desde o início**

### 💡 **SUGESTÃO DE ABORDAGEM:**
Começar pela **FASE 1** (Setup inicial) seguida pela **FASE 2** (Tipos e API), pois o backend já está pronto e funcional. Isso nos permitirá ter dados reais desde o início do desenvolvimento.

---

**❓ QUAL FASE DEVEMOS COMEÇAR?**
