# Guia de Segurança para Produção

## ⚠️ Configurações CRÍTICAS de Segurança

### 1. CORS (Cross-Origin Resource Sharing)

#### ❌ NUNCA EM PRODUÇÃO:
```bash
CORS_ORIGIN=*
```

#### ✅ CONFIGURAÇÃO CORRETA:

**Desenvolvimento:**
```bash
CORS_ORIGIN=http://localhost:19006,exp://192.168.1.100:19000
```

**Produção:**
```bash
CORS_ORIGIN=https://app.cicloazul.com.br,https://admin.cicloazul.com.br
```

### Por que CORS=* é perigoso?

1. **Qualquer site pode acessar sua API**
2. **Risco de roubo de dados sensíveis**
3. **Ataques CSRF (Cross-Site Request Forgery)**
4. **Exposição de tokens JWT**
5. **Vazamento de informações de usuários**

---

## 🔐 Checklist de Segurança para Produção

### Variáveis de Ambiente

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` com mínimo 64 caracteres aleatórios
- [ ] `JWT_REFRESH_SECRET` diferente do JWT_SECRET
- [ ] `DB_PASSWORD` forte e único
- [ ] `CORS_ORIGIN` com domínios específicos
- [ ] `BCRYPT_SALT_ROUNDS=12` ou mais
- [ ] `RATE_LIMIT_MAX_REQUESTS` reduzido (50-100)
- [ ] `LOG_LEVEL=info` ou `warn`

### Banco de Dados

- [ ] Usuário do banco com privilégios mínimos necessários
- [ ] Senha forte e complexa
- [ ] Conexão SSL/TLS habilitada
- [ ] Backup automático configurado
- [ ] Firewall permitindo apenas IPs específicos
- [ ] PostgreSQL atualizado para última versão

### API e Backend

- [ ] HTTPS habilitado (certificado SSL)
- [ ] Rate limiting configurado
- [ ] Helmet.js para headers de segurança
- [ ] Validação de entrada em todas as rotas
- [ ] Sanitização de dados
- [ ] Logs de auditoria habilitados
- [ ] Timeout de sessão configurado
- [ ] Proteção contra SQL injection
- [ ] Proteção contra XSS

### Mobile App

- [ ] URL da API apontando para HTTPS
- [ ] Validação de certificado SSL
- [ ] Tokens armazenados em SecureStore
- [ ] Logs de produção desabilitados
- [ ] ProGuard/R8 habilitado (Android)
- [ ] Code obfuscation (iOS)

### Armazenamento de Arquivos

- [ ] Bucket S3 com permissões mínimas
- [ ] Política de CORS no S3 configurada
- [ ] Versionamento habilitado
- [ ] Backup automático
- [ ] CDN configurado (CloudFront)
- [ ] ACL privado para uploads

---

## 🚀 Configuração por Ambiente

### Development
```bash
NODE_ENV=development
CORS_ORIGIN=http://localhost:19006,exp://192.168.1.100:19000
LOG_LEVEL=debug
RATE_LIMIT_MAX_REQUESTS=1000
```

### Staging
```bash
NODE_ENV=staging
CORS_ORIGIN=https://staging.cicloazul.com.br
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=200
```

### Production
```bash
NODE_ENV=production
CORS_ORIGIN=https://app.cicloazul.com.br
LOG_LEVEL=warn
RATE_LIMIT_MAX_REQUESTS=50
```

---

## 📱 Configuração do Mobile para Produção

### 1. Criar arquivo de ambiente de produção

**mobile/.env.production:**
```bash
API_URL=https://api.cicloazul.com.br/api
NODE_ENV=production
```

### 2. Atualizar app.config.js

```javascript
module.exports = {
  expo: {
    extra: {
      apiUrl: process.env.API_URL || 'https://api.cicloazul.com.br/api',
      nodeEnv: process.env.NODE_ENV || 'production',
    },
  },
};
```

### 3. Build de produção

```bash
# Carregar variáveis de ambiente
export $(cat .env.production | xargs)

# Build
eas build -p android --profile production
```

---

## 🔍 Como Gerar Secrets Seguros

### JWT Secrets

```bash
# Gerar secret de 64 caracteres
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Database Password

```bash
# Gerar senha forte
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🛡️ Headers de Segurança (Helmet.js)

O projeto já usa Helmet.js. Verifique se está configurado:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

---

## 🚨 O que NUNCA fazer em Produção

1. ❌ `CORS_ORIGIN=*`
2. ❌ Expor variáveis sensíveis em logs
3. ❌ Usar `console.log()` em produção
4. ❌ Secrets commitados no Git
5. ❌ Conexão HTTP (sem SSL)
6. ❌ Debug mode habilitado
7. ❌ Stack traces expostos ao cliente
8. ❌ Senhas padrão ou fracas
9. ❌ Endpoints sem autenticação
10. ❌ Uploads sem validação

---

## 📊 Monitoramento e Alertas

### Ferramentas Recomendadas

1. **Sentry** - Monitoramento de erros
2. **LogRocket** - Session replay
3. **DataDog** - APM e logs
4. **CloudWatch** - AWS monitoring
5. **Uptime Robot** - Disponibilidade

### Métricas Importantes

- Taxa de erro (< 1%)
- Tempo de resposta (< 500ms p95)
- Uptime (> 99.9%)
- Taxa de requests bloqueados
- Tentativas de login falhadas

---

## 📝 Auditoria e Compliance

### LGPD (Lei Geral de Proteção de Dados)

- [ ] Termo de consentimento implementado
- [ ] Logs de auditoria habilitados
- [ ] Retenção de dados configurada (DATA_RETENTION_DAYS)
- [ ] Processo de exclusão de dados
- [ ] Criptografia de dados sensíveis
- [ ] DPO (Data Protection Officer) designado

### Logs de Auditoria

O sistema registra:
- Login/logout de usuários
- Alterações em dados sensíveis
- Exportação de dados
- Exclusão de registros
- Acessos a dados pessoais

---

## 🔄 Rotação de Secrets

### Processo Recomendado

1. **Mensal:** Rotacionar senhas de banco de dados
2. **Trimestral:** Rotacionar JWT secrets
3. **Anual:** Renovar certificados SSL
4. **Imediatamente:** Em caso de suspeita de vazamento

### Como Rotacionar JWT Secret

1. Gerar novo secret
2. Adicionar ambos os secrets na aplicação
3. Aceitar tokens de ambos temporariamente
4. Após 24h, remover secret antigo
5. Forçar re-login de todos os usuários

---

## 📞 Contato em Caso de Incidente

Em caso de incidente de segurança:

1. Isolar sistema afetado
2. Notificar equipe de segurança
3. Documentar incidente
4. Notificar usuários afetados (se necessário)
5. Implementar correções
6. Revisar processos

---

## ✅ Teste de Segurança

### Checklist de Testes

```bash
# 1. Testar CORS
curl -H "Origin: https://malicious-site.com" https://api.cicloazul.com.br/api/health

# 2. Testar rate limiting
for i in {1..200}; do curl https://api.cicloazul.com.br/api/health; done

# 3. Testar autenticação
curl https://api.cicloazul.com.br/api/collections

# 4. Testar SQL injection
curl "https://api.cicloazul.com.br/api/collections?id=1' OR '1'='1"

# 5. Verificar headers de segurança
curl -I https://api.cicloazul.com.br/api/health
```

---

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
