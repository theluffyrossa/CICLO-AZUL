# Guia Completo de Deploy - CICLO AZUL

## 📋 Índice
1. [Backend no Railway](#backend-no-railway)
2. [Configuração Mobile](#configuração-mobile)
3. [Build do App](#build-do-app)
4. [Checklist de Produção](#checklist-de-produção)

---

## 🚀 Backend no Railway

### 1. Deploy Inicial

O backend já está no Railway. Anote a URL:
```
https://seu-projeto.railway.app
```

### 2. Variáveis de Ambiente no Railway

Configure estas variáveis no Railway Dashboard:

#### ⚠️ CRÍTICO - Configurações de Segurança

```bash
# Environment
NODE_ENV=production

# Database (Railway já configura DATABASE_URL automaticamente)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT - GERE NOVOS SECRETS!
JWT_SECRET=<gerar-com-comando-abaixo>
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=<gerar-diferente-do-jwt-secret>
JWT_REFRESH_EXPIRES_IN=7d

# CORS - CRÍTICO!
# Adicione os domínios que vão acessar sua API
# Para mobile Expo: use https://expo.dev
# NUNCA use * em produção!
CORS_ORIGIN=https://expo.dev

# API
PORT=3000
API_PREFIX=/api

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Storage (se usar S3)
STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua-key
AWS_SECRET_ACCESS_KEY=sua-secret
AWS_S3_BUCKET=cicloazul-prod

# Uploads (se usar local - não recomendado)
STORAGE_PROVIDER=local
UPLOAD_DIR=/app/uploads
API_URL=https://seu-projeto.railway.app

# Logging
LOG_LEVEL=info
ENABLE_AUDIT_LOG=true
```

#### 🔐 Gerar JWT Secrets

No terminal local:
```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# JWT_REFRESH_SECRET (gere outro diferente)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Configurar Banco de Dados

O Railway já cria o PostgreSQL automaticamente. Apenas:

1. Conecte ao banco via Railway CLI ou dashboard
2. Execute as migrations:
```bash
npm run migrate
```

3. Execute o seed (opcional, para dados iniciais):
```bash
npm run seed
```

### 4. Verificar Deploy

Teste a API:
```bash
curl https://seu-projeto.railway.app/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-11-23T...",
  "uptime": 123.456
}
```

---

## 📱 Configuração Mobile

### 1. Atualizar URL da API

Edite o arquivo `mobile/.env.production`:

```bash
# Substitua pela URL real do Railway
API_URL=https://seu-projeto.railway.app/api
NODE_ENV=production
```

### 2. Atualizar CORS no Railway

No Railway, atualize a variável `CORS_ORIGIN`:

**Para desenvolvimento (Expo Go):**
```bash
CORS_ORIGIN=https://expo.dev
```

**Para app publicado (com domínio próprio):**
```bash
CORS_ORIGIN=https://app.cicloazul.com.br,https://admin.cicloazul.com.br
```

### 3. Verificar app.config.js

O arquivo já está configurado corretamente:
```javascript
extra: {
  apiUrl: process.env.API_URL || 'http://localhost:3000/api',
  nodeEnv: process.env.NODE_ENV || 'development',
}
```

---

## 🏗️ Build do App

### Pré-requisitos

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Login na conta Expo
eas login
```

### Build de Desenvolvimento (APK para testar)

```bash
cd mobile

# Build APK de preview
eas build -p android --profile preview
```

Este build gera um APK que você pode instalar diretamente em qualquer Android.

### Build de Produção

#### 1. Configurar secrets no EAS

```bash
# Adicionar a URL da API como secret
eas secret:create --scope project --name API_URL --value https://seu-projeto.railway.app/api

# Verificar secrets
eas secret:list
```

#### 2. Atualizar eas.json

O arquivo `mobile/eas.json` já está configurado:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      },
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### 3. Gerar Build de Produção

**Android (APK):**
```bash
eas build -p android --profile production
```

**Android (AAB para Google Play):**
```bash
# Altere buildType para "aab" no eas.json primeiro
eas build -p android --profile production
```

**iOS:**
```bash
eas build -p ios --profile production
```

### 4. Download do Build

Após o build completar (15-30 minutos):

1. O EAS enviará um email com o link
2. Ou acesse: https://expo.dev/accounts/seu-usuario/projects/ciclo-azul/builds
3. Baixe o APK/AAB/IPA

### 5. Instalar e Testar

**Android APK:**
- Transfira o APK para o celular
- Habilite "Instalar apps de fontes desconhecidas"
- Instale o APK
- Abra o app e teste!

---

## ✅ Checklist de Produção

### Backend (Railway)

- [ ] DATABASE_URL configurado (automático)
- [ ] JWT_SECRET gerado e único (64+ caracteres)
- [ ] JWT_REFRESH_SECRET gerado e diferente
- [ ] CORS_ORIGIN configurado (NUNCA use *)
- [ ] NODE_ENV=production
- [ ] BCRYPT_SALT_ROUNDS=12
- [ ] RATE_LIMIT configurado
- [ ] Migrations executadas
- [ ] API responde em /api/health
- [ ] HTTPS funcionando

### Mobile

- [ ] .env.production com URL do Railway
- [ ] eas.json configurado
- [ ] API_URL como secret no EAS
- [ ] Build de preview testado
- [ ] Build de produção gerado
- [ ] App instalado e testado
- [ ] Login funcionando
- [ ] Câmera funcionando
- [ ] Upload de imagens funcionando
- [ ] Todas as telas testadas

### Segurança

- [ ] CORS restrito a domínios específicos
- [ ] JWT secrets únicos e seguros
- [ ] Senha do banco forte
- [ ] HTTPS habilitado
- [ ] Rate limiting ativo
- [ ] Logs de produção configurados
- [ ] Sem console.log em produção
- [ ] Variáveis sensíveis não commitadas

---

## 🔧 Comandos Úteis

### Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Ver logs
railway logs

# Executar comando no servidor
railway run npm run migrate

# Abrir dashboard
railway open
```

### EAS CLI

```bash
# Ver builds
eas build:list

# Ver detalhes de um build
eas build:view BUILD_ID

# Cancelar build
eas build:cancel BUILD_ID

# Ver configuração
eas build:configure

# Limpar cache
eas build:clear-cache
```

### Mobile Local

```bash
# Desenvolvimento
cd mobile
npm start

# Build local (requer Android Studio/Xcode)
eas build --platform android --local
```

---

## 🐛 Troubleshooting

### Erro: "Network request failed"

**Causa:** App não consegue acessar a API

**Solução:**
1. Verifique se API_URL está correta no .env.production
2. Teste a API no navegador
3. Verifique CORS no Railway
4. Verifique se Railway está online

### Erro: "CORS policy blocked"

**Causa:** CORS não configurado corretamente

**Solução:**
```bash
# No Railway, configure:
CORS_ORIGIN=https://expo.dev

# Ou para domínio próprio:
CORS_ORIGIN=https://seu-dominio.com
```

### Erro: "Unauthorized" ao fazer login

**Causa:** JWT_SECRET diferente entre builds

**Solução:**
1. Use EAS secrets ao invés de hardcoded
2. Limpe tokens antigos do app
3. Desinstale e reinstale o app

### Build falha no EAS

**Causa:** Dependências ou configuração incorreta

**Solução:**
```bash
# Limpar cache
eas build:clear-cache

# Verificar configuração
eas build:configure

# Verificar logs detalhados
eas build:view BUILD_ID
```

---

## 📊 Monitoramento

### Logs do Railway

```bash
railway logs --tail 100
```

### Métricas da API

Acesse: `https://seu-projeto.railway.app/api/health`

### Analytics do EAS

https://expo.dev/accounts/seu-usuario/projects/ciclo-azul/analytics

---

## 🚀 Próximos Passos

### Para Google Play Store

1. Criar conta Google Play Developer ($25 taxa única)
2. Gerar build AAB:
```bash
eas build -p android --profile production
```
3. Upload na Play Console
4. Preencher informações do app
5. Submeter para revisão

### Para Apple App Store

1. Criar conta Apple Developer ($99/ano)
2. Configurar certificados e provisioning profiles
3. Gerar build iOS:
```bash
eas build -p ios --profile production
```
4. Upload via EAS Submit:
```bash
eas submit -p ios
```

### Domínio Próprio

1. Registrar domínio (ex: cicloazul.com.br)
2. Configurar DNS apontando para Railway
3. Adicionar domínio no Railway dashboard
4. Atualizar CORS_ORIGIN
5. Atualizar API_URL no mobile

---

## 📞 Suporte

- **Railway Docs:** https://docs.railway.app
- **EAS Docs:** https://docs.expo.dev/build/introduction/
- **Expo Forums:** https://forums.expo.dev

---

## 🔄 Atualizações Futuras

Para fazer update do app:

1. Atualizar código
2. Incrementar versão em app.config.js
3. Gerar novo build:
```bash
eas build -p android --profile production
```
4. Distribuir novo APK ou fazer update via OTA:
```bash
eas update --branch production
```
