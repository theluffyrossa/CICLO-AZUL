# Sistema de Backup - CICLO-AZUL Backend

## Visão Geral

Sistema completo de backup e restore do banco de dados PostgreSQL com compressão automática, rotação de backups antigos e API REST para gerenciamento.

## Funcionalidades

- ✅ Backup completo do banco de dados PostgreSQL
- ✅ Compressão automática GZIP (~70% de economia de espaço)
- ✅ Restore de backups com safety backup automático
- ✅ Limpeza automática de backups antigos (30 dias)
- ✅ Metadados em JSON (checksum MD5, timestamp, tamanho)
- ✅ Scripts CLI para uso manual
- ✅ API REST para integração com frontend/mobile (ADMIN only)
- ✅ Audit log de todas as operações
- ✅ Validação de segurança (path traversal protection)

## Pré-requisitos

O sistema requer que `pg_dump` e `psql` estejam instalados e acessíveis:

### macOS (Homebrew)
```bash
brew install postgresql
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install postgresql-client
```

### Configuração do PATH

Se os comandos não estiverem no PATH do sistema, configure no `.env`:

```env
PG_DUMP_PATH=/opt/homebrew/bin/pg_dump
PSQL_PATH=/opt/homebrew/bin/psql
```

## Uso via CLI

### 1. Criar Backup Manual

```bash
npm run backup
```

**Output:**
```
[Backup] ================================
[Backup] Starting database backup...
[Backup] Database: cicloazul
[Backup] Executing pg_dump...
[Backup] Database dump completed
[Backup] Compressing backup file...
[Backup] Compression completed
[Backup] ================================
[Backup] Backup completed successfully!
[Backup] File: cicloazul-backup-2025-11-23-151901.sql.gz
[Backup] Size: 12.19 KB
[Backup] Checksum: 6d88993b8429dc978cfefa41afb22c56
[Backup] Duration: 1.21s
[Backup] ================================
```

**Arquivo criado:**
- `backups/cicloazul-backup-2025-11-23-151901.sql.gz` (backup comprimido)
- `backups/cicloazul-backup-2025-11-23-151901.json` (metadados)

### 2. Restaurar Backup

```bash
npm run backup:restore
```

**Fluxo interativo:**
```
📦 Available backups:

1. cicloazul-backup-2025-11-23-151901.sql.gz
2. cicloazul-backup-2025-11-22-103045.sql.gz

Select backup number to restore (or 0 to cancel): 1

⚠️  WARNING: This will REPLACE the current database. Continue? (yes/no): yes

[Restore] Starting database restore...
[Restore] Creating safety backup before restore...
[Backup] Backup completed successfully!
[Restore] Decompressing backup file...
[Restore] Dropping existing schema...
[Restore] Executing psql...
[Restore] Database restore completed
[Restore] ================================
[Restore] Restore completed successfully!
[Restore] Duration: 3.45s
[Restore] ================================
```

### 3. Limpar Backups Antigos

```bash
npm run backup:clean
```

**Output:**
```
[Clean] ================================
[Clean] Starting backup cleanup...
[Clean] Retention days: 30
[Clean] Min backups to keep: 5
[Clean] Total backups found: 12
[Clean] Backups to delete: 7
[Clean] Deleting: cicloazul-backup-2025-10-15-101234.sql.gz (39 days old, 11.5 KB)
[Clean] Deleting: cicloazul-backup-2025-10-16-152030.sql.gz (38 days old, 12.1 KB)
...
[Clean] ================================
[Clean] Cleanup completed successfully!
[Clean] Deleted backups: 7
[Clean] Kept backups: 5
[Clean] Freed space: 85.3 KB
[Clean] Duration: 0.15s
[Clean] ================================
```

**Regras de limpeza:**
- Remove backups mais antigos que 30 dias (configurável via `BACKUP_RETENTION_DAYS`)
- Mantém sempre os últimos 5 backups (mesmo que sejam mais antigos)

## Uso via API REST

Todas as rotas requerem autenticação JWT e role ADMIN.

### Endpoints Disponíveis

#### 1. Criar Backup

```http
POST /api/backup
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "cicloazul-backup-2025-11-23-151901.sql.gz",
    "size": 12479,
    "sizeFormatted": "12.19 KB",
    "checksum": "6d88993b8429dc978cfefa41afb22c56",
    "createdAt": "2025-11-23T19:19:02.308Z",
    "duration": 1212
  }
}
```

#### 2. Listar Backups

```http
GET /api/backup
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "backups": [
      {
        "filename": "cicloazul-backup-2025-11-23-151901.sql.gz",
        "size": 12479,
        "sizeFormatted": "12.19 KB",
        "createdAt": "2025-11-23T19:19:02.308Z",
        "age": "2 hours ago",
        "checksum": "6d88993b8429dc978cfefa41afb22c56"
      }
    ],
    "total": 5,
    "totalSize": 62395,
    "totalSizeFormatted": "60.93 KB"
  }
}
```

#### 3. Download Backup

```http
GET /api/backup/:filename
Authorization: Bearer <admin-token>
```

**Exemplo:**
```http
GET /api/backup/cicloazul-backup-2025-11-23-151901.sql.gz
```

**Response:** Stream do arquivo (application/octet-stream)

#### 4. Restaurar Backup

```http
POST /api/backup/restore/:filename
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "createSafetyBackup": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Database restored successfully",
    "safetyBackupCreated": true,
    "duration": 3452
  }
}
```

#### 5. Deletar Backup

```http
DELETE /api/backup/:filename
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Backup deleted successfully"
  }
}
```

#### 6. Limpar Backups Antigos

```http
POST /api/backup/clean
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 7,
    "freedSpace": 87345,
    "freedSpaceFormatted": "85.3 KB",
    "keptCount": 5
  }
}
```

## Configuração

### Variáveis de Ambiente (`.env`)

```env
# Backup Configuration
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
PG_DUMP_PATH=pg_dump
PSQL_PATH=psql
```

### Constantes (código)

```typescript
export const BACKUP = {
  DIR: process.env.BACKUP_DIR || './backups',
  RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
  MIN_BACKUPS_TO_KEEP: 5,
  COMPRESSION: true,
  PREFIX: 'cicloazul-backup',
} as const;
```

## Estrutura de Arquivos

```
backend/
├── backups/                                    # Diretório de backups
│   ├── cicloazul-backup-2025-11-23-151901.sql.gz
│   ├── cicloazul-backup-2025-11-23-151901.json
│   └── ...
├── src/
│   ├── database/
│   │   └── scripts/
│   │       ├── backup.ts                      # Script de backup
│   │       ├── restore.ts                     # Script de restore
│   │       └── clean-old-backups.ts          # Limpeza de backups
│   ├── modules/
│   │   └── backup/                           # Módulo REST API
│   │       ├── backup.controller.ts          # Endpoints HTTP
│   │       ├── backup.routes.ts              # Rotas
│   │       ├── backup.service.ts             # Lógica de negócio
│   │       ├── backup.types.ts               # Tipos TypeScript
│   │       └── backup.validation.ts          # Validações Joi
│   └── shared/
│       └── utils/
│           ├── compression.util.ts           # Utilitários de compressão
│           └── filesystem.util.ts            # Utilitários de filesystem
└── BACKUP_README.md                          # Esta documentação
```

## Formato dos Arquivos

### Backup (.sql.gz)
- Arquivo SQL comprimido com GZIP
- Contém dump completo do banco de dados
- Formato: `cicloazul-backup-YYYY-MM-DD-HHmmss.sql.gz`

### Metadata (.json)
```json
{
  "filename": "cicloazul-backup-2025-11-23-151901.sql.gz",
  "createdAt": "2025-11-23T19:19:02.308Z",
  "size": 12479,
  "sizeFormatted": "12.19 KB",
  "checksum": "6d88993b8429dc978cfefa41afb22c56",
  "duration": 1212,
  "database": "cicloazul",
  "compressed": true
}
```

## Segurança

### Controle de Acesso
- API REST requer autenticação JWT
- Apenas usuários com role ADMIN podem acessar
- Todas as operações são registradas no Audit Log

### Validações
- Path traversal protection
- Filename sanitization
- Validação de formato de arquivo (.sql ou .sql.gz apenas)
- Checksum MD5 para integridade

### Audit Log
Todas as operações são registradas:
```json
{
  "userId": "uuid",
  "action": "CREATE",
  "tableName": "backups",
  "recordId": "filename.sql.gz",
  "afterData": { ... },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 ...",
  "createdAt": "2025-11-23T19:19:02.308Z"
}
```

## Agendamento Automático (Futuro)

Para implementar backups automáticos, você pode usar `node-cron`:

```typescript
// src/jobs/backup.job.ts
import cron from 'node-cron';
import backupService from '../modules/backup/backup.service';

// Backup diário às 2:00 AM
cron.schedule('0 2 * * *', async () => {
  await backupService.createBackup();
  await backupService.cleanOldBackups();
});
```

## Troubleshooting

### Erro: "pg_dump: command not found"

**Solução:** Configure o caminho completo no `.env`:
```env
PG_DUMP_PATH=/opt/homebrew/bin/pg_dump
PSQL_PATH=/opt/homebrew/bin/psql
```

### Erro: "PGPASSWORD authentication failed"

**Solução:** Verifique as credenciais do banco no `.env`:
```env
DB_USER=cicloazul
DB_PASSWORD=cicloazul123
```

### Backups muito grandes

**Solução:** A compressão GZIP já está habilitada por padrão (~70% redução). Para reduzir ainda mais:
- Limpe dados antigos antes do backup
- Ajuste `BACKUP_RETENTION_DAYS` para manter menos backups

### Restore muito lento

**Solução:** Restore grandes pode demorar. Para melhorar:
- Use SSD no servidor
- Ajuste configurações do PostgreSQL (shared_buffers, work_mem)
- Considere restore parcial se possível

## Monitoramento

### Logs
Todos os logs são registrados via Winston:
```bash
tail -f logs/combined.log | grep Backup
```

### Métricas
- Duração do backup
- Tamanho do arquivo gerado
- Checksum MD5
- Taxa de compressão
- Espaço liberado na limpeza

## Boas Práticas

1. **Backup Regular:** Execute backups diariamente
2. **Teste de Restore:** Teste restore periodicamente para garantir integridade
3. **Armazenamento Externo:** Copie backups para storage externo (S3, etc)
4. **Monitoramento:** Configure alertas para falhas de backup
5. **Retenção:** Ajuste `BACKUP_RETENTION_DAYS` conforme necessidade
6. **Segurança:** Mantenha backups criptografados em produção

## Limitações Conhecidas

- Requer PostgreSQL Client Tools instalados
- Restore é destrutivo (substitui banco completo)
- Não suporta backup incremental (apenas full backup)
- Backups grandes podem consumir muito tempo/espaço

## Próximos Passos (Roadmap)

- [ ] Backup incremental
- [ ] Upload automático para S3
- [ ] Criptografia de backups
- [ ] Notificações por email/Slack
- [ ] Dashboard de monitoramento
- [ ] Restore point-in-time
- [ ] Parallel backup (múltiplas tables)
- [ ] Backup differential

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs em `logs/combined.log`
2. Consulte esta documentação
3. Verifique issues conhecidos no repositório
