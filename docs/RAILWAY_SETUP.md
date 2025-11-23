# Railway Setup - CICLO AZUL

## 🚂 Configuração Completa do Railway

### 1. Verificar Variáveis de Ambiente

No Railway Dashboard, vá em:
**Project → Variables**

Verifique se essas variáveis estão configuradas:

#### Variáveis Automáticas (Railway cria)
```bash
# O Railway cria automaticamente quando você adiciona PostgreSQL
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

#### Variáveis que VOCÊ precisa adicionar:

```bash
# Environment
NODE_ENV=production

# CORS - CRÍTICO!
CORS_ORIGIN=https://expo.dev

# JWT - GERE NOVOS!
JWT_SECRET=<gerar com: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=<gerar outro diferente>
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# API
PORT=3000
API_PREFIX=/api

# Storage (se usar S3)
STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua-key
AWS_SECRET_ACCESS_KEY=sua-secret
AWS_S3_BUCKET=cicloazul-prod

# OU Storage Local (temporário, não recomendado)
STORAGE_PROVIDER=local
UPLOAD_DIR=/app/uploads
API_URL=https://ciclo-azul.railway.app

# Logging
LOG_LEVEL=info
ENABLE_AUDIT_LOG=true
```

---

## 2. Verificar se PostgreSQL está Conectado

No Railway:

1. Vá em **Project**
2. Verifique se há um serviço **Postgres**
3. Clique no serviço Postgres
4. Vá em **Variables**
5. Copie a `DATABASE_URL`

Exemplo:
```
postgresql://postgres:senha@host.railway.app:5432/railway
```

---

## 3. Verificar Configuração do Serviço Backend

No Railway Dashboard:

### Service: backend

**Settings → Service**
- **Root Directory**: `/backend` (se monorepo)
- **Start Command**: `npm run start --workspace=@ciclo-azul/backend`
- **Build Command**: `npm run build --workspace=@ciclo-azul/backend`

**OU se não for monorepo:**
- **Root Directory**: `/` ou em branco
- **Start Command**: `npm start`
- **Build Command**: `npm run build`

---

## 4. Verificar Logs do Deploy

No Railway:

1. Clique no serviço **backend**
2. Vá em **Deployments**
3. Clique no deploy mais recente
4. Veja os logs

**Procure por:**
```
[DB Config] Using DATABASE_URL: true
[DB Config] Host: xxxx.railway.app Port: 5432
Database connection established successfully
```

**Se ver isso, está ERRADO:**
```
[DB Config] Using DATABASE_URL: false
[DB Config] Host: localhost Port: 5432
```

Isso significa que `DATABASE_URL` não está disponível.

---

## 5. Conectar PostgreSQL ao Backend (se não estiver conectado)

### No Railway Dashboard:

1. **Adicionar PostgreSQL:**
   - Clique em **+ New**
   - Selecione **Database → PostgreSQL**
   - Aguarde provisioning

2. **Conectar ao Backend:**
   - Clique no serviço **backend**
   - Vá em **Variables**
   - Clique em **+ New Variable**
   - Selecione **Add Reference**
   - Escolha o serviço **Postgres**
   - Selecione a variável **DATABASE_URL**
   - Salve

3. **Verificar Conexão:**
   - Vá em **backend → Variables**
   - Deve aparecer: `DATABASE_URL` com valor `${{Postgres.DATABASE_URL}}`

---

## 6. Forçar Redeploy

Após configurar as variáveis:

### Opção 1: Via Dashboard
1. Vá em **Deployments**
2. Clique nos 3 pontinhos do último deploy
3. **Redeploy**

### Opção 2: Via Git Push
```bash
git commit --allow-empty -m "trigger railway redeploy"
git push origin main
```

---

## 7. Testar a API

Após deploy completar:

```bash
# Health check
curl https://ciclo-azul.railway.app/api/health

# Deve retornar:
{
  "status": "ok",
  "timestamp": "2024-11-23T...",
  "uptime": 123
}
```

---

## 8. Troubleshooting

### Erro: "ECONNREFUSED ::1:5433"

**Problema:** DATABASE_URL não está configurada

**Solução:**
1. Verifique se PostgreSQL está adicionado ao projeto
2. Conecte DATABASE_URL ao backend (passo 5)
3. Force redeploy

---

### Erro: "authentication failed"

**Problema:** Credenciais incorretas

**Solução:**
1. Copie DATABASE_URL do Postgres
2. Cole manualmente no backend como variável
3. Redeploy

---

### Erro: "SSL connection required"

**Problema:** Postgres exige SSL

**Solução:** Já está configurado no código:
```typescript
production: {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
}
```

---

### Logs não mostram DATABASE_URL

**Problema:** Variável não está injetada

**Solução:**
```bash
# No Railway CLI (se instalado)
railway variables set DATABASE_URL="postgresql://..."

# Ou adicione manualmente no dashboard
```

---

## 9. Executar Migrations (após deploy funcionar)

### Via Railway CLI:

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Linkar projeto
railway link

# Executar migration
railway run npm run migrate --workspace=@ciclo-azul/backend
```

### Via Dashboard (temporário):

1. Crie um arquivo `run-migration.sh` no repo:
```bash
#!/bin/bash
npm run migrate --workspace=@ciclo-azul/backend
```

2. Execute via Railway:
   - Settings → Deploy Triggers
   - Add custom start command temporariamente

---

## 10. Monitoramento

### Verificar Saúde do Banco:

```bash
# Via Railway CLI
railway connect postgres

# Dentro do psql:
\l          # Listar bancos
\dt         # Listar tabelas
\q          # Sair
```

### Ver Logs em Tempo Real:

```bash
railway logs --tail 100
```

---

## 11. Backup e Restore (Futuro)

### Backup Manual:

```bash
railway run pg_dump -Fc > backup.dump
```

### Restore:

```bash
railway run pg_restore -d $DATABASE_URL backup.dump
```

---

## 📞 Suporte Railway

- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

---

## ✅ Checklist Final

- [ ] PostgreSQL adicionado ao projeto
- [ ] DATABASE_URL conectada ao backend
- [ ] Todas as variáveis de ambiente configuradas
- [ ] NODE_ENV=production
- [ ] JWT_SECRET e JWT_REFRESH_SECRET gerados
- [ ] CORS_ORIGIN configurado
- [ ] Deploy bem-sucedido
- [ ] Logs mostram "DATABASE_URL: true"
- [ ] API responde em /api/health
- [ ] Migrations executadas (se necessário)
