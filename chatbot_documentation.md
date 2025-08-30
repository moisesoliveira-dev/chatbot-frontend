## Lógica de Processamento de Fluxos

### Serviço Principal de Fluxos
```python
import asyncpg
import json
from datetime import datetime
from typing import Optional, Dict, Any

class FlowService:
    def __init__(self, db_pool):
        self.db_pool = db_pool
    
    async def get_or_create_conversation(self, contact_id: int, ticket_id: int) -> Dict[str, Any]:
        """Busca conversa ativa ou cria uma nova"""
        async with self.db_pool.acquire() as conn:
            # Buscar conversa ativa
            conversation = await conn.fetchrow("""
                SELECT * FROM user_conversations 
                WHERE contact_id = $1 AND is_active = true
                ORDER BY last_interaction DESC LIMIT 1
            """, contact_id)
            
            if not conversation:
                # Buscar fluxo padrão
                default_flow = await conn.fetchrow("""
                    SELECT f.* FROM flows f 
                    WHERE f.is_default = true AND f.is_active = true 
                    LIMIT 1
                """)
                
                if default_flow:
                    # Criar nova conversa
                    conversation_id = await conn.fetchval("""
                        INSERT INTO user_conversations 
                        (contact_id, ticket_id, current_flow_id, current_subflow_id, current_message_id)
                        VALUES ($1, $2, $3, null, null)
                        RETURNING id
                    """, contact_id, ticket_id, default_flow['id'])
                    
                    conversation = await conn.fetchrow("""
                        SELECT * FROM user_conversations WHERE id = $1
                    """, conversation_id)
            
            return dict(conversation) if conversation else None
    
    async def get_next_message(self, conversation_id: int, user_input: str = None) -> Optional[Dict[str, Any]]:
        """Determina próxima mensagem baseada no fluxo atual"""
        async with self.db_pool.acquire() as conn:
            conversation = await conn.fetchrow("""
                SELECT * FROM user_conversations WHERE id = $1
            """, conversation_id)
            
            if not conversation:
                return None
            
            # Se não há mensagem atual, buscar primeira mensagem do fluxo
            if not conversation['current_message_id']:
                next_message = await conn.fetchrow("""
                    SELECT fm.* FROM flow_messages fm
                    JOIN subflows sf ON fm.subflow_id = sf.id
                    WHERE sf.flow_id = $1 AND sf.is_active = true
                    ORDER BY sf.order_index, fm.order_index LIMIT 1
                """, conversation['current_flow_id'])
            else:
                # Buscar próxima mensagem na sequência
                current_message = await conn.fetchrow("""
                    SELECT fm.*, sf.id as subflow_id FROM flow_messages fm
                    JOIN subflows sf ON fm.subflow_id = sf.id
                    WHERE fm.id = $1
                """, conversation['current_message_id'])
                
                if current_message:
                    # Se a mensagem atual espera arquivo e recebeu, avançar
                    if current_message['wait_for_file'] and user_input:
                        next_message = await conn.fetchrow("""
                            SELECT * FROM flow_messages 
                            WHERE subflow_id = $1 AND order_index > $2 AND is_active = true
                            ORDER BY order_index LIMIT 1
                        """, current_message['subflow_id'], current_message['order_index'])
                    # Se espera resposta de texto
                    elif current_message['wait_for_response'] and user_input:
                        # Verificar se input corresponde a alguma palavra-chave para mudar subfluxo
                        keyword_subflow = await self.check_keyword_triggers(
                            conversation['current_flow_id'], user_input
                        )
                        
                        if keyword_subflow:
                            next_message = await conn.fetchrow("""
                                SELECT * FROM flow_messages 
                                WHERE subflow_id = $1 AND is_active = true
                                ORDER BY order_index LIMIT 1
                            """, keyword_subflow['id'])
                        else:
                            next_message = await conn.fetchrow("""
                                SELECT * FROM flow_messages 
                                WHERE subflow_id = $1 AND order_index > $2 AND is_active = true
                                ORDER BY order_index LIMIT 1
                            """, current_message['subflow_id'], current_message['order_index'])
                    else:
                        next_message = None
            
            return dict(next_message) if next_message else None
    
    async def check_keyword_triggers(self, flow_id: int, user_input: str) -> Optional[Dict[str, Any]]:
        """Verifica se input do usuário corresponde a palavras-chave de subfluxos"""
        async with self.db_pool.acquire() as conn:
            user_input_lower = user_input.lower().strip()
            
            subflows = await conn.fetch("""
                SELECT * FROM subflows 
                WHERE flow_id = $1 AND trigger_keywords IS NOT NULL AND is_active = true
            """, flow_id)
            
            for subflow in subflows:
                keywords = subflow['trigger_keywords'] or []
                for keyword in keywords:
                    if keyword.lower().strip() in user_input_lower:
                        return dict(subflow)
            
            return None
    
    async def update_conversation_state(self, conversation_id: int, message_id: int = None, 
                                      subflow_id: int = None, variables: Dict = None):
        """Atualiza estado da conversa"""
        async with self.db_pool.acquire() as conn:
            update_fields = ["last_interaction = NOW()"]
            params = [conversation_id]
            param_count = 1
            
            if message_id:
                param_count += 1
                update_fields.append(f"current_message_id = ${param_count}")
                params.append(message_id)
            
            if subflow_id:
                param_count += 1
                update_fields.append(f"current_subflow_id = ${param_count}")
                params.append(subflow_id)
            
            if variables:
                param_count += 1
                update_fields.append(f"variables = ${param_count}")
                params.append(json.dumps(variables))
            
            query = f"""
                UPDATE user_conversations 
                SET {', '.join(update_fields)}
                WHERE id = $1
            """
            
            await conn.execute(query, *params)

async def process_flow_message(message_data: Dict[str, Any]):
    """Processa mensagem dentro do sistema de fluxos"""
    try:
        contact_id = message_data['contact_id']
        ticket_id = message_data['ticket_id']
        user_message = message_data['body']
        media_url = message_data.get('media_url')
        media_type = message_data.get('media_type')
        
        # Inicializar serviços
        flow_service = FlowService(db_pool)
        
        # Buscar ou criar conversa
        conversation = await flow_service.get_or_create_conversation(contact_id, ticket_id)
        
        if not conversation:
            logger.error(f"Não foi possível criar conversa para contato {contact_id}")
            return
        
        # Salvar mensagem do usuário no histórico
        await save_message_history(
            conversation['id'], contact_id, ticket_id, 
            user_message, media_type, media_url, is_from_bot=False
        )
        
        # Se mensagem contém arquivo, processar
        if media_url and media_type == 'application':
            await save_received_file(conversation['id'], contact_id, media_url, user_message)
        
        # Determinar próxima mensagem do fluxo
        next_message = await flow_service.get_next_message(conversation['id'], user_message)
        
        if next_message:
            # Atualizar estado da conversa
            await flow_service.update_conversation_state(
                conversation['id'], 
                next_message['id'],
                next_message['subflow_id']
            )
            
            # Enviar resposta via GOSAC
            gosac_service = GosacService()
            await gosac_service.send_message(
                contact_id=contact_id,
                message=next_message['message_text']
            )
            
            # Salvar resposta do bot no histórico
            await save_message_history(
                conversation['id'], contact_id, ticket_id,
                next_message['message_text'], 'text', None, 
                is_from_bot=True, flow_message_id=next_message['id']
            )
            
            logger.info(f"Resposta enviada para contato {contact_id}: {next_message['message_text'][:50]}...")
        
    except Exception as e:
        logger.error(f"Erro ao processar fluxo: {str(e)}")

async def save_message_history(conversation_id, contact_id, ticket_id, message_text, 
                             message_type, media_url, is_from_bot=False, flow_message_id=None):
    """Salva mensagem no histórico"""
    async with db_pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO message_history 
            (conversation_id, contact_id, ticket_id, message_text, message_type, 
             media_url, is_from_bot, flow_message_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """, conversation_id, contact_id, ticket_id, message_text, 
             message_type, media_url, is_from_bot, flow_message_id)

async def save_received_file(conversation_id, contact_id, media_url, original_filename):
    """Salva arquivo recebido"""
    async with db_pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO received_files 
            (conversation_id, contact_id, media_url, original_filename)
            VALUES ($1, $2, $3, $4)
        """, conversation_id, contact_id, media_url, original_filename)
```

## APIs para o Frontend

### Endpoints de Gerenciamento de Fluxos
```python
# === TEMPLATES DE FLUXO ===
@app.route('/api/flow-templates', methods=['GET'])
async def list_flow_templates():
    """Lista todos os templates de fluxo"""
    async with db_pool.acquire() as conn:
        templates = await conn.fetch("""
            SELECT ft.*, COUNT(f.id) as flows_count
            FROM flow_templates ft
            LEFT JOIN flows f ON ft.id = f.template_id
            WHERE ft.is_active = true
            GROUP BY ft.id
            ORDER BY ft.created_at DESC
        """)
        return jsonify([dict(t) for t in templates])

@app.route('/api/flow-templates', methods=['POST'])
async def create_flow_template():
    """Cria novo template de fluxo"""
    data = request.get_json()
    async with db_pool.acquire() as conn:
        template_id = await conn.fetchval("""
            INSERT INTO flow_templates (name, description, created_by)
            VALUES ($1, $2, $3) RETURNING id
        """, data['name'], data.get('description'), data.get('created_by'))
        return jsonify({'id': template_id, 'status': 'created'})

# === FLUXOS ===
@app.route('/api/templates/<int:template_id>/flows', methods=['GET'])
async def list_flows(template_id):
    """Lista fluxos de um template"""
    async with db_pool.acquire() as conn:
        flows = await conn.fetch("""
            SELECT f.*, COUNT(sf.id) as subflows_count
            FROM flows f
            LEFT JOIN subflows sf ON f.id = sf.flow_id
            WHERE f.template_id = $1 AND f.is_active = true
            GROUP BY f.id
            ORDER BY f.order_index, f.created_at
        """, template_id)
        return jsonify([dict(f) for f in flows])

@app.route('/api/flows', methods=['POST'])
async def create_flow():
    """Cria novo fluxo"""
    data = request.get_json()
    async with db_pool.acquire() as conn:
        flow_id = await conn.fetchval("""
            INSERT INTO flows (template_id, name, description, is_default, order_index)
            VALUES ($1, $2, $3, $4, $5) RETURNING id
        """, data['template_id'], data['name'], data.get('description'), 
             data.get('is_default', False), data.get('order_index', 0))
        return jsonify({'id': flow_id, 'status': 'created'})

# === SUBFLUXOS ===
@app.route('/api/flows/<int:flow_id>/subflows', methods=['GET'])
async def list_subflows(flow_id):
    """Lista subfluxos de um fluxo"""
    async with db_pool.acquire() as conn:
        subflows = await conn.fetch("""
            SELECT sf.*, COUNT(fm.id) as messages_count
            FROM subflows sf
            LEFT JOIN flow_messages fm ON sf.id = fm.subflow_id
            WHERE sf.flow_id = $1 AND sf.is_active = true
            GROUP BY sf.id
            ORDER BY sf.order_index, sf.created_at
        """, flow_id)
        return jsonify([dict(sf) for sf in subflows])

@app.route('/api/subflows', methods=['POST'])
async def create_subflow():
    """Cria novo subfluxo"""
    data = request.get_json()
    async with db_pool.acquire() as conn:
        subflow_id = await conn.fetchval("""
            INSERT INTO subflows (flow_id, name, description, parent_subflow_id, 
                                trigger_keywords, order_index)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
        """, data['flow_id'], data['name'], data.get('description'),
             data.get('parent_subflow_id'), data.get('trigger_keywords', []),
             data.get('order_index', 0))
        return jsonify({'id': subflow_id, 'status': 'created'})

# === MENSAGENS ===
@app.route('/api/subflows/<int:subflow_id>/messages', methods=['GET'])
async def list_flow_messages(subflow_id):
    """Lista mensagens de um subfluxo"""
    async with db_pool.acquire() as conn:
        messages = await conn.fetch("""
            SELECT * FROM flow_messages 
            WHERE subflow_id = $1 AND is_active = true
            ORDER BY order_index, created_at
        """, subflow_id)
        return jsonify([dict(m) for m in messages])

@app.route('/api/flow-messages', methods=['POST'])
async def create_flow_message():
    """Cria nova mensagem no fluxo"""
    data = request.get_json()
    async with db_pool.acquire() as conn:
        message_id = await conn.fetchval("""
            INSERT INTO flow_messages 
            (subflow_id, message_text, message_type, order_index, wait_for_response, 
             wait_for_file, expected_file_types, delay_seconds)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
        """, data['subflow_id'], data['message_text'], data.get('message_type', 'text'),
             data.get('order_index', 0), data.get('wait_for_response', True),
             data.get('wait_for_file', False), data.get('expected_file_types', []),
             data.get('delay_seconds', 0))
        return jsonify({'id': message_id, 'status': 'created'})

@app.route('/api/flow-messages/<int:message_id>', methods=['PUT'])
async def update_flow_message(message_id):
    """Atualiza mensagem do fluxo"""
    data = request.get_json()
    async with db_pool.acquire() as conn:
        await conn.execute("""
            UPDATE flow_messages SET
                message_text = $1, message_type = $2, wait_for_response = $3,
                wait_for_file = $4, expected_file_types = $5, delay_seconds = $6,
                updated_at = NOW()
            WHERE id = $7
        """, data['message_text'], data.get('message_type', 'text'),
             data.get('wait_for_response', True), data.get('wait_for_file', False),
             data.get('expected_file_types', []), data.get('delay_seconds', 0), message_id)
        return jsonify({'status': 'updated'})

# === CONVERSAS E HISTÓRICO ===
@app.route('/api/conversations', methods=['GET'])
async def list_conversations():
    """Lista conversas ativas"""
    async with db_pool.acquire() as conn:
        conversations = await conn.fetch("""
            SELECT uc.*, ft.name as template_name, f.name as flow_name, 
                   sf.name as subflow_name, fm.message_text as current_message
            FROM user_conversations uc
            LEFT JOIN flows f ON uc.current_flow_id = f.id
            LEFT JOIN flow_templates ft ON f.template_id = ft.id
            LEFT JOIN subflows sf ON uc.current_subflow_id = sf.id
            LEFT JOIN flow_messages fm ON uc.current_message_id = fm.id
            WHERE uc.is_active = true
            ORDER BY uc.last_interaction DESC
            LIMIT 50
        """)
        return jsonify([dict(c) for c in conversations])

@app.route('/api/conversations/<int:conversation_id>/history', methods=['GET'])
async def get_conversation_history(conversation_id):
    """Busca histórico de uma conversa"""
    async with db_pool.acquire() as conn:
        history = await conn.fetch("""
            SELECT * FROM message_history 
            WHERE conversation_id = $1 
            ORDER BY created_at ASC
        """, conversation_id)
## Configuração dos Bancos Railway

### PostgreSQL Database
As seguintes variáveis já estão configuradas no Railway:
```env
DATABASE_PUBLIC_URL="postgresql://postgres:MrWlQWXmuNCNVBnwtBbbOdMpGeRpIsYv@crossover.proxy.rlwy.net:39393/railway"
DATABASE_URL="postgresql://postgres:MrWlQWXmuNCNVBnwtBbbOdMpGeRpIsYv@postgres.railway.internal:5432/railway"
PGDATABASE="railway"
PGHOST="postgres.railway.internal"
PGPASSWORD="MrWlQWXmuNCNVBnwtBbbOdMpGeRpIsYv"
PGPORT="5432"
PGUSER="postgres"
```

### Redis Cache
As seguintes variáveis já estão configuradas no Railway:
```env
REDIS_URL="redis://default:EguSvxoreVmaiKdmDUbfuZjPdkqpMcSu@redis.railway.internal:6379"
REDIS_PUBLIC_URL="redis://default:EguSvxoreVmaiKdmDUbfuZjPdkqpMcSu@yamabiko.proxy.rlwy.net:16393"
REDISHOST="redis.railway.internal"
REDISPASSWORD="EguSvxoreVmaiKdmDUbfuZjPdkqpMcSu"
REDISPORT="6379"
REDISUSER="default"
```

### Inicialização do Sistema
```python
import asyncpg
import redis
import os
from contextlib import asynccontextmanager

# Pool de conexões do PostgreSQL
db_pool = None
redis_client = None

async def init_database():
    """Inicializa o pool de conexões do banco"""
    global db_pool
    db_pool = await asyncpg.create_pool(
        os.getenv('DATABASE_URL'),
        min_size=1,
        max_size=10,
        command_timeout=60
    )
    
    # Executar migrations se necessário
    async with db_pool.acquire() as conn:
        await create_database_schema(conn)

def init_redis():
    """Inicializa conexão Redis"""
    global redis_client
    redis_client = redis.from_url(os.getenv('REDIS_URL'))
    return redis_client

async def create_database_schema(conn):
    """Cria schema inicial do banco de dados"""
    schema_sql = """
    -- Inserir schema SQL aqui (já fornecido acima)
    """
    await conn.execute(schema_sql)

@asynccontextmanager
async def get_db_connection():
    """Context manager para conexões do banco"""
    async with db_pool.acquire() as conn:
        yield conn
```

## APIs de Configuração do Sistema

### Configurações Dinâmicas
```python
# === CONFIGURAÇÕES DO SISTEMA ===
@app.route('/api/settings', methods=['GET'])
async def get_system_settings():
    """Busca todas as configurações do sistema"""
    async with db_pool.acquire() as conn:
        settings = await conn.fetch("""
            SELECT * FROM system_settings ORDER BY setting_key
        """)
        
        # Converter para formato mais amigável
        settings_dict = {}
        for setting in settings:
            value = setting['setting_value']
            if setting['setting_type'] == 'boolean':
                value = value.lower() == 'true'
            elif setting['setting_type'] == 'number':
                value = float(value) if '.' in value else int(value)
            elif setting['setting_type'] == 'json':
                value = json.loads(value)
            
            settings_dict[setting['setting_key']] = {
                'value': value,
                'type': setting['setting_type'],
                'description': setting['description']
            }
        
        return jsonify(settings_dict)

@app.route('/api/settings/<setting_key>', methods=['PUT'])
async def update_system_setting(setting_key):
    """Atualiza uma configuração específica"""
    data = request.get_json()
    async with db_pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO system_settings (setting_key, setting_value, setting_type, description)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (setting_key) 
            DO UPDATE SET 
                setting_value = $2, 
                setting_type = $3, 
                description = $4,
                updated_at = NOW()
        """, setting_key, str(data['value']), data.get('type', 'string'), 
             data.get('description', ''))
        
        return jsonify({'status': 'updated'})

# === CONTROLES DO BOT ===
@app.route('/api/bot/status', methods=['GET'])
async def get_bot_status():
    """Retorna status atual do bot"""
    return jsonify({
        'bot_enabled': os.getenv('BOT_ENABLED', 'false').lower() == 'true',
        'bot_status': os.getenv('BOT_STATUS', 'paused'),
        'test_mode': os.getenv('TEST_MODE', 'false').lower() == 'true',
        'test_contact_id': os.getenv('TEST_CONTACT_ID', '24914'),
        'debounce_time': int(os.getenv('DEBOUNCE_TIME', '2000'))
    })

@app.route('/api/bot/enable', methods=['POST'])
async def enable_bot():
    """Ativa o bot"""
    # Atualizar no banco para persistir
    async with db_pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO system_settings (setting_key, setting_value, setting_type)
            VALUES ('BOT_ENABLED', 'true', 'boolean')
            ON CONFLICT (setting_key) 
            DO UPDATE SET setting_value = 'true', updated_at = NOW()
        """)
    
    return jsonify({'status': 'enabled'})

@app.route('/api/bot/disable', methods=['POST'])
async def disable_bot():
    """Desativa o bot"""
    async with db_pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO system_settings (setting_key, setting_value, setting_type)
            VALUES ('BOT_ENABLED', 'false', 'boolean')
            ON CONFLICT (setting_key) 
            DO UPDATE SET setting_value = 'false', updated_at = NOW()
        """)
    
    return jsonify({'status': 'disabled'})

@app.route('/api/bot/test-mode', methods=['POST'])
async def toggle_test_mode():
    """Alterna modo de teste"""
    data = request.get_json()
    test_mode = data.get('enabled', False)
    
    async with db_pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO system_settings (setting_key, setting_value, setting_type)
            VALUES ('TEST_MODE', $1, 'boolean')
            ON CONFLICT (setting_key) 
            DO UPDATE SET setting_value = $1, updated_at = NOW()
        """, 'true' if test_mode else 'false')
    
    return jsonify({'test_mode': test_mode})

# === ANALYTICS E RELATÓRIOS ===
@app.route('/api/analytics/conversations', methods=['GET'])
async def get_conversations_analytics():
    """Analytics das conversas"""
    async with db_pool.acquire() as conn:
        # Conversas por status
        by_status = await conn.fetch("""
            SELECT 
                CASE WHEN is_completed THEN 'completed' ELSE 'active' END as status,
                COUNT(*) as count
            FROM user_conversations
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY status
        """)
        
        # Conversas por fluxo
        by_flow = await conn.fetch("""
            SELECT f.name as flow_name, COUNT(uc.id) as count
            FROM user_conversations uc
            JOIN flows f ON uc.current_flow_id = f.id
            WHERE uc.created_at >= NOW() - INTERVAL '30 days'
            GROUP BY f.name
            ORDER BY count DESC
        """)
        
        # Mensagens por dia
        daily_messages = await conn.fetch("""
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as messages_count,
                COUNT(DISTINCT conversation_id) as conversations_count
            FROM message_history
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        """)
        
        return jsonify({
            'by_status': [dict(r) for r in by_status],
            'by_flow': [dict(r) for r in by_flow],
            'daily_messages': [dict(r) for r in daily_messages]
        })

@app.route('/api/analytics/files', methods=['GET'])
async def get_files_analytics():
    """Analytics dos arquivos recebidos"""
    async with db_pool.acquire() as conn:
        files_by_type = await conn.fetch("""
            SELECT file_type, COUNT(*) as count, 
                   ROUND(AVG(file_size)/1024/1024, 2) as avg_size_mb
            FROM received_files
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY file_type
            ORDER BY count DESC
        """)
        
        return jsonify({
            'files_by_type': [dict(r) for r in files_by_type]
        })

# === BACKUP E EXPORTAÇÃO ===
@app.route('/api/export/flows/<int:template_id>', methods=['GET'])
async def export_flow_template(template_id):
    """Exporta template completo com todos os fluxos"""
    async with db_pool.acquire() as conn:
        # Template principal
        template = await conn.fetchrow("""
            SELECT * FROM flow_templates WHERE id = $1
        """, template_id)
        
        # Fluxos
        flows = await conn.fetch("""
            SELECT * FROM flows WHERE template_id = $1 ORDER BY order_index
        """, template_id)
        
        # Para cada fluxo, buscar subfluxos e mensagens
        complete_export = {
            'template': dict(template),
            'flows': []
        }
        
        for flow in flows:
            flow_data = dict(flow)
            
            # Subfluxos
            subflows = await conn.fetch("""
                SELECT * FROM subflows WHERE flow_id = $1 ORDER BY order_index
            """, flow['id'])
            
            flow_data['subflows'] = []
            
            for subflow in subflows:
                subflow_data = dict(subflow)
                
                # Mensagens
                messages = await conn.fetch("""
                    SELECT * FROM flow_messages 
                    WHERE subflow_id = $1 ORDER BY order_index
                """, subflow['id'])
                
                subflow_data['messages'] = [dict(m) for m in messages]
                flow_data['subflows'].append(subflow_data)
            
            complete_export['flows'].append(flow_data)
        
        return jsonify(complete_export)

@app.route('/api/import/flows', methods=['POST'])
async def import_flow_template():
    """Importa template completo"""
    data = request.get_json()
    
    async with db_pool.acquire() as conn:
        async with conn.transaction():
            # Criar template
            template_data = data['template']
            template_id = await conn.fetchval("""
                INSERT INTO flow_templates (name, description, created_by)
                VALUES ($1, $2, $3) RETURNING id
            """, f"Imported - {template_data['name']}", 
                 template_data.get('description'), template_data.get('created_by'))
            
            # Criar fluxos
            for flow_data in data['flows']:
                flow_id = await conn.fetchval("""
                    INSERT INTO flows (template_id, name, description, is_default, order_index)
                    VALUES ($1, $2, $3, $4, $5) RETURNING id
                """, template_id, flow_data['name'], flow_data.get('description'),
                     flow_data.get('is_default', False), flow_data.get('order_index', 0))
                
                # Criar subfluxos
                for subflow_data in flow_data['subflows']:
                    subflow_id = await conn.fetchval("""
                        INSERT INTO subflows (flow_id, name, description, trigger_keywords, order_index)
                        VALUES ($1, $2, $3, $4, $5) RETURNING id
                    """, flow_id, subflow_data['name'], subflow_data.get('description'),
                         subflow_data.get('trigger_keywords', []), subflow_data.get('order_index', 0))
                    
                    # Criar mensagens
                    for message_data in subflow_data['messages']:
                        await conn.execute("""
                            INSERT INTO flow_messages 
                            (subflow_id, message_text, message_type, order_index, 
                             wait_for_response, wait_for_file, expected_file_types, delay_seconds)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        """, subflow_id, message_data['message_text'], 
                             message_data.get('message_type', 'text'),
                             message_data.get('order_index', 0),
                             message_data.get('wait_for_response', True),
                             message_data.get('wait_for_file', False),
                             message_data.get('expected_file_types', []),
                             message_data.get('delay_seconds', 0))
        
        return jsonify({'template_id': template_id, 'status': 'imported'})
```

## Middleware e Utilitários

### Sistema de Cache com Redis
```python
import json
import pickle
from functools import wraps

class CacheService:
    def __init__(self, redis_client):
        self.redis = redis_client
    
    def cache_key(self, prefix: str, *args) -> str:
        """Gera chave de cache padronizada"""
        return f"{prefix}:{':'.join(map(str, args))}"
    
    async def get(self, key: str, default=None):
        """Busca valor do cache"""
        try:
            value = self.redis.get(key)
            if value:
                return pickle.loads(value)
            return default
        except Exception as e:
            logger.error(f"Erro ao buscar cache {key}: {str(e)}")
            return default
    
    async def set(self, key: str, value, expiry: int = 3600):
        """Define valor no cache"""
        try:
            self.redis.setex(key, expiry, pickle.dumps(value))
        except Exception as e:
            logger.error(f"Erro ao definir cache {key}: {str(e)}")
    
    async def delete(self, key: str):
        """Remove valor do cache"""
        try:
            self.redis.delete(key)
        except Exception as e:
            logger.error(f"Erro ao deletar cache {key}: {str(e)}")

def cache_result(prefix: str, expiry: int = 3600):
    """Decorator para cache de resultados de funções"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_service = CacheService(redis_client)
            cache_key = cache_service.cache_key(prefix, *args, *kwargs.values())
            
            # Tentar buscar no cache
            result = await cache_service.get(cache_key)
            if result is not None:
                return result
            
            # Executar função e cachear resultado
            result = await func(*args, **kwargs)
            await cache_service.set(cache_key, result, expiry)
            return result
        return wrapper
    return decorator

# Exemplo de uso
@cache_result("flow_template", expiry=1800)
async def get_flow_template_cached(template_id: int):
    async with db_pool.acquire() as conn:
        return await conn.fetchrow("""
            SELECT * FROM flow_templates WHERE id = $1
        """, template_id)
```

### Sistema de Logs Estruturado
```python
import structlog
from datetime import datetime

# Configuração do structlog
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="ISO"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

class ActivityLogger:
    """Logger específico para atividades do chatbot"""
    
    @staticmethod
    async def log_message_processed(contact_id: int, message_text: str, 
                                  flow_id: int = None, processing_time: float = None):
        """Log de mensagem processada"""
        await save_activity_log("message_processed", {
            'contact_id': contact_id,
            'message_preview': message_text[:50],
            'flow_id': flow_id,
            'processing_time_ms': processing_time * 1000 if processing_time else None
        })
    
    @staticmethod
    async def log_flow_changed(contact_id: int, old_flow: int, new_flow: int, trigger: str):
        """Log de mudança de fluxo"""
        await save_activity_log("flow_changed", {
            'contact_id': contact_id,
            'old_flow_id': old_flow,
            'new_flow_id': new_flow,
            'trigger': trigger
        })
    
    @staticmethod
    async def log_file_received(contact_id: int, filename: str, file_size: int, file_type: str):
        """Log de arquivo recebido"""
        await save_activity_log("file_received", {
            'contact_id': contact_id,
            'filename': filename,
            'file_size': file_size,
            'file_type': file_type
        })

async def save_activity_log(activity_type: str, data: dict):
    """Salva log de atividade no banco"""
    try:
        async with db_pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO activity_logs (activity_type, activity_data, created_at)
                VALUES ($1, $2, NOW())
            """, activity_type, json.dumps(data))
    except Exception as e:
        logger.error("Erro ao salvar log de atividade", error=str(e))
```

### Sistema de Validação
```python
from pydantic import BaseModel, ValidationError
from typing import List, Optional

class FlowTemplateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    created_by: Optional[int] = None

class FlowRequest(BaseModel):
    template_id: int
    name: str
    description: Optional[str] = None
    is_default: bool = False
    order_index: int = 0

class SubflowRequest(BaseModel):
    flow_id: int
    name: str
    description: Optional[str] = None
    parent_subflow_id: Optional[int] = None
    trigger_keywords: List[str] = []
    order_index: int = 0

class FlowMessageRequest(BaseModel):
    subflow_id: int
    message_text: str
    message_type: str = "text"
    order_index: int = 0
    wait_for_response: bool = True
    wait_for_file: bool = False  # ✓ PARÂMETRO PRINCIPAL
    expected_file_types: List[str] = []
    delay_seconds: int = 0

def validate_request(model_class):
    """Decorator para validação de requests"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                data = request.get_json()
                validated_data = model_class(**data)
                return await func(validated_data, *args, **kwargs)
            except ValidationError as e:
                return jsonify({'errors': e.errors()}), 400
        return wrapper
    return decorator

# Uso nos endpoints
@app.route('/api/flow-messages', methods=['POST'])
@validate_request(FlowMessageRequest)
async def create_flow_message_validated(validated_data: FlowMessageRequest):
    """Cria nova mensagem no fluxo com validação"""
    async with db_pool.acquire() as conn:
        message_id = await conn.fetchval("""
            INSERT INTO flow_messages 
            (subflow_id, message_text, message_type, order_index, wait_for_response, 
             wait_for_file, expected_file_types, delay_seconds)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
        """, validated_data.subflow_id, validated_data.message_text, 
             validated_data.message_type, validated_data.order_index,
             validated_data.wait_for_response, validated_data.wait_for_file,
             validated_data.expected_file_types, validated_data.delay_seconds)
        return jsonify({'id': message_id, 'status': 'created'})
```

## Inicialização da Aplicação

### Arquivo Principal (main.py)
```python
from flask import Flask
from flask_cors import CORS
import asyncio
import os

app = Flask(__name__)
CORS(app)  # Permitir requests do frontend

async def startup():
    """Inicialização assíncrona da aplicação"""
    await init_database()
    init_redis()
    logger.info("Sistema inicializado com sucesso")

async def shutdown():
    """Encerramento limpo da aplicação"""
    if db_pool:
        await db_pool.close()
    if redis_client:
        redis_client.close()
    logger.info("Sistema encerrado")

@app.before_first_request
def initialize():
    """Inicializar antes da primeira requisição"""
    asyncio.create_task(startup())

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
```

---

**Sistema Completo e Consistente**: O chatbot agora possui estrutura completa para:
- ✅ Processar mensagens com regras de negócio específicas
- ✅ Gerenciar fluxos complexos com subfluxos e templates
- ✅ Servir APIs completas para frontend
- ✅ Sistema de cache e performance
- ✅ Logs estruturados e analytics
- ✅ Validação robusta de dados
- ✅ Backup/importação de configurações
- ✅ Parâmetro `wait_for_file` para recebimento de arquivos
- ✅ Consistência de dados no PostgreSQL + Redis
```# Documentação do Chatbot Python

## Visão Geral
Este documento descreve como criar e configurar um chatbot em Python que será deployado na plataforma Railway. O sistema inclui funcionalidades de controle avançado através de variáveis de ambiente e integração com serviços do Google.

## Arquitetura do Sistema

### Tecnologias Utilizadas
- **Linguagem**: Python 3.9+
- **Plataforma de Deploy**: Railway
- **Base de Dados**: PostgreSQL (Railway)
- **Integrações**: Google APIs, GOSAC (Sistema Intermediador), Pontta (ERP)

## Bibliotecas Python Necessárias

### Dependências Principais
```python
# requirements.txt
flask==2.3.3
requests==2.31.0
python-dotenv==1.0.0
psycopg2-binary==2.9.7
google-auth==2.23.3
google-auth-oauthlib==1.1.0
google-auth-httplib2==0.1.1
google-api-python-client==2.103.0
redis==5.0.1
celery==5.3.4
gunicorn==21.2.0
```

### Bibliotecas para Integrações Específicas
```python
# Para requisições HTTP (GOSAC e Pontta)
httpx==0.25.0
aiohttp==3.9.1

# Para autenticação JWT (Pontta)
pyjwt==2.8.0

# Para cache de tokens
python-memcached==1.62
```
```python
# Para processamento de texto e NLP
nltk==3.8.1
textblob==0.17.1

# Para logs e monitoramento
loguru==0.7.2

# Para validação de dados
pydantic==2.4.2

# Para webhooks e APIs
fastapi==0.104.1
uvicorn==0.24.0

# Para agendamento de tarefas
schedule==1.2.0

# Para criptografia
cryptography==41.0.7
```

## Variáveis de Ambiente

### Configuração do Railway
Crie as seguintes variáveis no painel do Railway:

#### Controle do Chatbot
```env
# Controle principal do bot
BOT_ENABLED=true
BOT_STATUS=active  # active, paused, maintenance

# Modo de teste
TEST_MODE=false
TEST_CONTACT_ID=24914

# Configurações de debounce
DEBOUNCE_TIME=2000  # tempo em millisegundos
MESSAGE_COOLDOWN=5  # cooldown entre mensagens em segundos
```

#### Configurações do Google
```env
# Credenciais do Google
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token

# IDs dos recursos do Google
GOOGLE_SHEET_ID=your_spreadsheet_id
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

#### Configurações do GOSAC
```env
GOSAC_BASE_URL=https://cmmodulados.gosac.com.br/api
GOSAC_AUTHORIZATION_KEY=your_gosac_auth_key
GOSAC_INTEGRATION=0ddfe6600ac270ae602f509c3bf247dd8b581fe6672dc48fcb2853d91328
```

#### Configurações do Pontta
```env
PONTTA_BASE_URL=https://api.pontta.com/api
PONTTA_BUSINESS_UNIT=d6e8a1cd-ab55-4dd2-96cd-dbab38f75f2e
PONTTA_EMAIL=moreira278@hotmail.com
PONTTA_PASSWORD=Moises25
PONTTA_TOKEN=""  # Token será gerado automaticamente
PONTTA_TOKEN_EXPIRY=""  # Timestamp de expiração do token
```

#### Configurações do Banco de Dados
```env
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://username:password@host:port
```

#### Configurações do Banco de Dados
```env
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://username:password@host:port
```

#### Configurações Gerais
```env
# Ambiente
ENVIRONMENT=production  # development, staging, production
DEBUG=false
LOG_LEVEL=INFO

# Segurança
SECRET_KEY=your_secret_key_here
ALLOWED_HOSTS=your-app.railway.app,localhost

# Configurações do servidor
PORT=8000
HOST=0.0.0.0
WORKERS=2
```

## Regras de Negócio Fundamentais

### Condições para NÃO Processar Mensagens
1. **fromMe = true**: Mensagens enviadas pelo próprio bot
2. **fromGroup = true**: Mensagens de grupos
3. **mediaType ≠ "text" AND mediaType ≠ "application"**: Apenas texto e aplicações são processados

### Arquitetura Backend + Frontend
Este sistema funciona como **backend** para uma aplicação frontend que permite:
- Criação de templates de fluxos de conversação
- Organização de subfluxos dentro de cada fluxo
- Configuração de mensagens e parâmetros
- Gerenciamento completo do comportamento do chatbot

## Estrutura do Banco de Dados

## Estrutura do Webhook Recebido

```sql
-- Tabela de Templates de Fluxo
CREATE TABLE flow_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Fluxos (instâncias dos templates)
CREATE TABLE flows (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES flow_templates(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Subfluxos
CREATE TABLE subflows (
    id SERIAL PRIMARY KEY,
    flow_id INTEGER REFERENCES flows(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_subflow_id INTEGER REFERENCES subflows(id),
    trigger_keywords TEXT[], -- Array de palavras-chave que ativam este subfluxo
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Mensagens do Fluxo
CREATE TABLE flow_messages (
    id SERIAL PRIMARY KEY,
    subflow_id INTEGER REFERENCES subflows(id),
    message_text TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, image, document, etc
    order_index INTEGER DEFAULT 0,
    wait_for_response BOOLEAN DEFAULT true,
    wait_for_file BOOLEAN DEFAULT false, -- ✓ PARÂMETRO PRINCIPAL
    expected_file_types VARCHAR(255)[], -- tipos de arquivo esperados
    delay_seconds INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Conversas dos Usuários
CREATE TABLE user_conversations (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER NOT NULL,
    ticket_id INTEGER,
    current_flow_id INTEGER REFERENCES flows(id),
    current_subflow_id INTEGER REFERENCES subflows(id),
    current_message_id INTEGER REFERENCES flow_messages(id),
    conversation_state JSONB DEFAULT '{}', -- Estado da conversa
    variables JSONB DEFAULT '{}', -- Variáveis dinâmicas da conversa
    started_at TIMESTAMP DEFAULT NOW(),
    last_interaction TIMESTAMP DEFAULT NOW(),
    is_completed BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

-- Tabela de Histórico de Mensagens
CREATE TABLE message_history (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES user_conversations(id),
    contact_id INTEGER NOT NULL,
    ticket_id INTEGER,
    message_text TEXT,
    message_type VARCHAR(50),
    media_url TEXT,
    media_path TEXT,
    is_from_bot BOOLEAN DEFAULT false,
    flow_message_id INTEGER REFERENCES flow_messages(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Arquivos Recebidos
CREATE TABLE received_files (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES user_conversations(id),
    contact_id INTEGER NOT NULL,
    original_filename VARCHAR(255),
    stored_filename VARCHAR(255),
    file_path TEXT,
    file_type VARCHAR(100),
    file_size BIGINT,
    media_url TEXT,
    is_processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Configurações do Sistema
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string', -- string, boolean, number, json
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Webhook de Mensagens
O sistema recebe webhooks com a seguinte estrutura. Apenas os campos marcados são relevantes para o chatbot:

```json
{
  "data": {
    "mediaUrl": "string|null",           # ✓ IMPORTANTE - URL da mídia
    "mediaPath": "string|null",          # ✓ IMPORTANTE - Caminho da mídia
    "fromMe": "boolean",                 # ✓ IMPORTANTE - Se a mensagem é do bot
    "body": "string",                    # ✓ IMPORTANTE - Texto da mensagem
    "mediaType": "string",               # ✓ IMPORTANTE - Tipo da mídia (chat, image, etc)
    "ticketId": "number",                # ✓ IMPORTANTE - ID do ticket
    "contactId": "number",               # ✓ IMPORTANTE - ID do contato
    "fromGroup": "boolean",              # ✓ IMPORTANTE - Se é mensagem de grupo
    "contact": {
      "name": "string",                  # ✓ IMPORTANTE - Nome do contato
      "number": "string"                 # ✓ IMPORTANTE - Número do contato
    },
    "ticket": {
      "status": "string",                # ✓ IMPORTANTE - Status do ticket (open, closed)
      "userId": "number"                 # ✓ IMPORTANTE - ID do usuário responsável
    }
  },
  "type": "messages:created"
}
```

### Webhook Handler com Regras de Negócio
```python
from flask import Flask, request, jsonify
import json

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
async def handle_webhook():
    """Handler principal para receber webhooks do GOSAC"""
    try:
        webhook_data = request.get_json()
        
        # Verificar se é uma mensagem criada
        if webhook_data.get('type') != 'messages:created':
            return jsonify({'status': 'ignored - not message created'}), 200
        
        message_data = webhook_data.get('data', {})
        
        # ✓ REGRA 1: Ignorar mensagens do próprio bot
        if message_data.get('fromMe', False):
            return jsonify({'status': 'ignored - from bot'}), 200
        
        # ✓ REGRA 2: Ignorar mensagens de grupos
        if message_data.get('fromGroup', False):
            return jsonify({'status': 'ignored - from group'}), 200
        
        # ✓ REGRA 3: Processar apenas text e application
        media_type = message_data.get('mediaType', '').lower()
        if media_type not in ['text', 'application']:
            return jsonify({'status': f'ignored - media type {media_type}'}), 200
        
        # Extrair campos importantes
        processed_message = {
            'media_url': message_data.get('mediaUrl'),
            'media_path': message_data.get('mediaPath'),
            'body': message_data.get('body', ''),
            'media_type': media_type,
            'ticket_id': message_data.get('ticketId'),
            'contact_id': message_data.get('contactId'),
            'contact_name': message_data.get('contact', {}).get('name', ''),
            'contact_number': message_data.get('contact', {}).get('number', ''),
            'ticket_status': message_data.get('ticket', {}).get('status', ''),
            'user_id': message_data.get('ticket', {}).get('userId')
        }
        
        # Verificações de controle do sistema
        if not check_bot_status():
            return jsonify({'status': 'bot disabled'}), 200
        
        if not is_test_mode(processed_message['contact_id']):
            return jsonify({'status': 'test mode - contact not allowed'}), 200
        
        # Debounce
        debounce_manager = DebounceManager()
        if not debounce_manager.should_process_message(processed_message['contact_id']):
            return jsonify({'status': 'debounced'}), 200
        
        # Processar mensagem no fluxo
        await process_flow_message(processed_message)
        
        return jsonify({'status': 'processed'}), 200
        
    except Exception as e:
        logger.error(f"Erro no webhook: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
```

## Estrutura do Projeto

```
chatbot/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   └── google_config.py
│   ├── controllers/
│   │   ├── __init__.py
│   │   ├── webhook_controller.py
│   │   ├── message_controller.py
│   │   └── admin_controller.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── chatbot_service.py
│   │   ├── google_service.py
│   │   ├── database_service.py
│   │   ├── gosac_service.py
│   │   └── pontta_service.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── message.py
│   │   ├── user.py
│   │   └── conversation.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── debounce.py
│   │   ├── validators.py
│   │   └── helpers.py
│   └── middleware/
│       ├── __init__.py
│       ├── auth_middleware.py
│       └── rate_limiter.py
├── tests/
├── requirements.txt
├── Procfile
├── railway.json
├── .env.example
└── README.md
```

## Configuração dos Bancos Railway

### PostgreSQL Database
As seguintes variáveis já estão configuradas no Railway:
```env
DATABASE_PUBLIC_URL="postgresql://postgres:MrWlQWXmuNCNVBnwtBbbOdMpGeRpIsYv@crossover.proxy.rlwy.net:39393/railway"
DATABASE_URL="postgresql://postgres:MrWlQWXmuNCNVBnwtBbbOdMpGeRpIsYv@postgres.railway.internal:5432/railway"
PGDATABASE="railway"
PGHOST="postgres.railway.internal"
PGPASSWORD="MrWlQWXmuNCNVBnwtBbbOdMpGeRpIsYv"
PGPORT="5432"
PGUSER="postgres"
```

### Redis Cache
As seguintes variáveis já estão configuradas no Railway:
```env
REDIS_URL="redis://default:EguSvxoreVmaiKdmDUbfuZjPdkqpMcSu@redis.railway.internal:6379"
REDIS_PUBLIC_URL="redis://default:EguSvxoreVmaiKdmDUbfuZjPdkqpMcSu@yamabiko.proxy.rlwy.net:16393"
REDISHOST="redis.railway.internal"
REDISPASSWORD="EguSvxoreVmaiKdmDUbfuZjPdkqpMcSu"
REDISPORT="6379"
REDISUSER="default"
```

### Exemplo de Conexão com os Bancos
```python
import psycopg2
import redis
import os

# Conexão PostgreSQL
def get_postgres_connection():
    return psycopg2.connect(os.getenv('DATABASE_URL'))

# Conexão Redis
def get_redis_connection():
    return redis.from_url(os.getenv('REDIS_URL'))

# Exemplo de uso
async def save_conversation_data(contact_id, message_data):
    # PostgreSQL para dados persistentes
    conn = get_postgres_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO conversations (contact_id, message, created_at)
        VALUES (%s, %s, NOW())
    """, (contact_id, message_data))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    # Redis para cache de sessão
    redis_client = get_redis_connection()
    redis_client.setex(f"session:{contact_id}", 3600, json.dumps(message_data))
```

## Configuração de Deploy no Railway

### Procfile
```
web: gunicorn app.main:app --bind 0.0.0.0:$PORT --workers $WORKERS
worker: celery -A app.main.celery worker --loglevel=info
```

### railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Funcionalidades Principais

### 1. Sistema de Controle
- **BOT_ENABLED**: Liga/desliga o chatbot completamente
- **BOT_STATUS**: Controla o status operacional (ativo, pausado, manutenção)
- **TEST_MODE**: Ativa modo de teste apenas para contactId específico

### 2. Sistema de Debounce
- **DEBOUNCE_TIME**: Controla o tempo de espera antes de processar mensagens
- **MESSAGE_COOLDOWN**: Define intervalo mínimo entre respostas

### 3. Integração com GOSAC
- Sistema intermediador para comunicação
- Headers de autenticação: Authorization + INTEGRATION
- Endpoints para envio de mensagens e gestão de contatos

### 4. Integração com Pontta
- ERP para gestão de dados empresariais
- Autenticação por email/senha com geração de token JWT
- Headers: Businessunit + Authorization Bearer
- Gestão automática de renovação de tokens

### 5. Integração com Google
- Autenticação via Service Account
- Acesso a Google Sheets para dados
- Integração com Google Drive para arquivos
- Logs no Google Cloud Logging

### 4. Monitoramento e Logs
```python
# Exemplo de configuração de logs
import logging
from loguru import logger

# Configuração do sistema de logs
logger.add(
    "logs/chatbot_{time:YYYY-MM-DD}.log",
    rotation="1 day",
    retention="30 days",
    level="INFO"
)
```

## Exemplos de Uso

### Verificação de Status
```python
def check_bot_status():
    bot_enabled = os.getenv('BOT_ENABLED', 'false').lower() == 'true'
    bot_status = os.getenv('BOT_STATUS', 'paused')
    
    if not bot_enabled or bot_status != 'active':
        return False
    return True
```

### Modo de Teste
```python
def is_test_mode(contact_id):
    test_mode = os.getenv('TEST_MODE', 'false').lower() == 'true'
    test_contact = os.getenv('TEST_CONTACT_ID', '24914')
    
    if test_mode and str(contact_id) != test_contact:
        return False
    return True
```

### Implementação do Debounce
```python
import time
from collections import defaultdict

class DebounceManager:
    def __init__(self):
        self.last_message_time = defaultdict(float)
    
    def should_process_message(self, contact_id):
        debounce_time = float(os.getenv('DEBOUNCE_TIME', '2000')) / 1000
        current_time = time.time()
        
        if current_time - self.last_message_time[contact_id] < debounce_time:
            return False
        
        self.last_message_time[contact_id] = current_time
        return True
```

### Serviço GOSAC
```python
import httpx
import os

class GosacService:
    def __init__(self):
        self.base_url = os.getenv('GOSAC_BASE_URL', 'https://cmmodulados.gosac.com.br/api')
        self.headers = {
            'Authorization': os.getenv('GOSAC_AUTHORIZATION_KEY'),
            'INTEGRATION': os.getenv('GOSAC_INTEGRATION', '0ddfe6600ac270ae602f509c3bf247dd8b581fe6672dc48fcb2853d91328'),
            'Content-Type': 'application/json'
        }
    
    async def send_message(self, contact_id, message):
        """Envia mensagem através do GOSAC"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/send-message",
                headers=self.headers,
                json={
                    'contact_id': contact_id,
                    'message': message
                }
            )
            return response.json()
    
    async def get_contact_info(self, contact_id):
        """Busca informações do contato"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/contacts/{contact_id}",
                headers=self.headers
            )
            return response.json()
```

### Serviço Pontta
```python
import httpx
import os
from datetime import datetime, timedelta
import json

class PonttaService:
    def __init__(self):
        self.base_url = os.getenv('PONTTA_BASE_URL', 'https://api.pontta.com/api')
        self.business_unit = os.getenv('PONTTA_BUSINESS_UNIT', 'd6e8a1cd-ab55-4dd2-96cd-dbab38f75f2e')
        self.email = os.getenv('PONTTA_EMAIL', 'moreira278@hotmail.com')
        self.password = os.getenv('PONTTA_PASSWORD', 'Moises25')
        self.token = os.getenv('PONTTA_TOKEN', '')
        self.token_expiry = os.getenv('PONTTA_TOKEN_EXPIRY', '')
    
    async def get_auth_headers(self):
        """Retorna headers com token válido"""
        if not self.token or self._is_token_expired():
            await self._refresh_token()
        
        return {
            'Businessunit': self.business_unit,
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
    
    def _is_token_expired(self):
        """Verifica se o token está expirado"""
        if not self.token_expiry:
            return True
        
        expiry_time = datetime.fromisoformat(self.token_expiry)
        return datetime.now() >= expiry_time
    
    async def _refresh_token(self):
        """Gera um novo token de autenticação"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/auth/login",
                headers={'Businessunit': self.business_unit},
                json={
                    'email': self.email,
                    'password': self.password
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token')
                # Assume que o token expira em 1 hora
                self.token_expiry = (datetime.now() + timedelta(hours=1)).isoformat()
                
                # Atualizar variáveis de ambiente (opcional)
                os.environ['PONTTA_TOKEN'] = self.token
                os.environ['PONTTA_TOKEN_EXPIRY'] = self.token_expiry
            else:
                raise Exception(f"Erro na autenticação Pontta: {response.status_code}")
    
    async def create_ticket(self, contact_id, subject, message):
        """Cria um ticket no Pontta"""
        headers = await self.get_auth_headers()
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/tickets",
                headers=headers,
                json={
                    'contact_id': contact_id,
                    'subject': subject,
                    'message': message,
                    'status': 'open'
                }
            )
            return response.json()
    
    async def get_tickets(self, contact_id=None):
        """Busca tickets"""
        headers = await self.get_auth_headers()
        
        params = {}
        if contact_id:
            params['contact_id'] = contact_id
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/tickets",
                headers=headers,
                params=params
            )
            return response.json()
```

## Comandos para Deploy

### Preparação Local
```bash
# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis locais
cp .env.example .env

# Executar testes
python -m pytest tests/

# Executar localmente
python app/main.py
```

### Deploy no Railway
```bash
# Conectar ao Railway
railway login

# Link do projeto
railway link [project-id]

# Deploy
railway up

# Verificar logs
railway logs

# Configurar variáveis
railway variables set BOT_ENABLED=true
railway variables set TEST_MODE=false
```

## Monitoramento e Manutenção

### Health Check Endpoint
```python
@app.route('/health')
def health_check():
    return {
        'status': 'healthy',
        'bot_enabled': os.getenv('BOT_ENABLED'),
        'bot_status': os.getenv('BOT_STATUS'),
        'test_mode': os.getenv('TEST_MODE'),
        'timestamp': datetime.utcnow().isoformat()
    }
```

### Logs Importantes
- Mensagens recebidas e processadas
- Erros de integração com APIs
- Status de conexão com banco de dados
- Métricas de performance

## Troubleshooting

### Problemas Comuns
1. **Bot não responde**: Verificar BOT_ENABLED e BOT_STATUS
2. **Erro de autenticação GOSAC**: Validar GOSAC_AUTHORIZATION_KEY e INTEGRATION
3. **Token Pontta expirado**: Verificar credenciais de login e renovação automática
4. **Erro de autenticação Google**: Validar credenciais e permissões
5. **Timeout de mensagens**: Ajustar DEBOUNCE_TIME
6. **Banco de dados**: Verificar DATABASE_URL e conexão

### Comandos de Debug
```bash
# Verificar variáveis
railway variables

# Logs em tempo real
railway logs --follow

# Reiniciar aplicação
railway redeploy
```

## Segurança

### Práticas Recomendadas
- Nunca commitar credenciais no código
- Usar HTTPS para todos os endpoints
- Validar todas as entradas de usuário
- Implementar rate limiting
- Monitorar tentativas de acesso suspeitas

### Variáveis Sensíveis
Sempre configure como variáveis de ambiente no Railway:
- Tokens de API
- Chaves privadas
- Senhas de banco de dados
- Secrets de aplicação

---

**Nota**: Esta documentação deve ser atualizada conforme novas funcionalidades são adicionadas ao chatbot. Mantenha sempre as versões das bibliotecas atualizadas e teste em ambiente de desenvolvimento antes de fazer deploy em produção.