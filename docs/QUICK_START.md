# 🚀 CICLO AZUL - Guia Rápido de Início

## ⚡ Começar em 5 Minutos

### Pré-requisitos
- Node.js 18+ instalado
- Docker e Docker Compose instalados
- Terminal/CMD aberto

---

## 📋 Passo a Passo

### 1️⃣ **Instalar Dependências**

```bash
# Na raiz do projeto
cd CICLO-AZUL

# Instalar dependências do backend
cd backend
npm install
```

**Tempo estimado:** 2 minutos

---

### 2️⃣ **Configurar Variáveis de Ambiente**

```bash
# Ainda em backend/
cp .env.example .env
```

O arquivo `.env` já vem configurado para desenvolvimento local. **Não precisa editar nada!**

**Tempo estimado:** 10 segundos

---

### 3️⃣ **Iniciar Banco de Dados**

```bash
# Voltar para a raiz
cd ..

# Iniciar PostgreSQL com Docker
docker-compose up -d
```

Isso vai:
- ✅ Baixar imagem do PostgreSQL (primeira vez)
- ✅ Criar container `cicloazul-db`
- ✅ Criar container `cicloazul-pgadmin`
- ✅ Criar banco de dados `cicloazul`

**Tempo estimado:** 1-3 minutos (primeira vez)

---

### 4️⃣ **Criar Tabelas e Popular Banco**

```bash
cd backend

# Criar todas as tabelas
npm run migrate

# Inserir dados de teste
npm run seed
```

Isso vai criar:
- ✅ 9 tabelas no banco
- ✅ 2 usuários (admin e operator)
- ✅ 8 tipos de resíduos
- ✅ 3 clientes com 4 unidades
- ✅ 4 coletas de exemplo

**Tempo estimado:** 30 segundos

---

### 5️⃣ **Iniciar Servidor**

```bash
# Ainda em backend/
npm run dev
```

Você verá:
```
🚀 Server running on port 3000
📝 Environment: development
🔗 API Prefix: /api
🌐 CORS Origins: http://localhost:19006, exp://192.168.1.100:19000
Database connection established successfully
```

**Tempo estimado:** 5 segundos

---

## ✅ Pronto! API Funcionando

**URL da API:** `http://localhost:3000`

**Health Check:** `http://localhost:3000/health`

---

## 🧪 Testar Agora

### Teste 1: Health Check

Abra no navegador:
```
http://localhost:3000/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T...",
  "environment": "development"
}
```

### Teste 2: Login (via cURL)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cicloazul.com","password":"admin123"}'
```

Deve retornar um token JWT!

### Teste 3: Listar Clientes (via navegador)

Pegue o `accessToken` do teste anterior e cole aqui:

```bash
# Substitua <TOKEN> pelo token que você recebeu
curl http://localhost:3000/api/clients \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🔑 Credenciais de Teste

### Usuário Administrador
- **Email:** `admin@cicloazul.com`
- **Senha:** `admin123`
- **Permissões:** Acesso total

### Usuário Operador
- **Email:** `operator@cicloazul.com`
- **Senha:** `operator123`
- **Permissões:** Apenas suas coletas

---

## 📱 Próximo Passo: Mobile

Agora que o backend está rodando, você pode:

1. **Desenvolver o app mobile** com Expo
2. **Configurar a URL da API** no app: `http://localhost:3000/api`
3. **Usar as credenciais acima** para fazer login
4. **Consumir os endpoints** documentados em [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🔧 Comandos Úteis

### Gerenciar Banco de Dados

```bash
# Ver status do PostgreSQL
docker ps

# Ver logs do banco
docker-compose logs -f postgres

# Parar banco
docker-compose down

# Reiniciar banco
docker-compose restart

# Resetar banco (⚠️ APAGA TUDO)
cd backend
npm run reset
npm run seed
```

### Gerenciar Servidor

```bash
# Parar servidor
Ctrl + C

# Ver logs em tempo real
tail -f backend/logs/combined.log

# Ver apenas erros
tail -f backend/logs/error.log
```

---

## 🌐 Acessar pgAdmin (Interface Gráfica)

Se quiser visualizar o banco de dados graficamente:

1. Abra `http://localhost:5050`
2. Login:
   - Email: `admin@cicloazul.com`
   - Senha: `admin123`
3. Adicionar servidor:
   - Nome: `CICLO AZUL`
   - Host: `postgres` (nome do container)
   - Port: `5432`
   - Database: `cicloazul`
   - Username: `cicloazul`
   - Password: `cicloazul123`

---

## 🆘 Problemas Comuns

### ❌ Erro: "Port 3000 already in use"
**Solução:** Outro processo está usando a porta 3000
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### ❌ Erro: "Cannot connect to database"
**Solução:** PostgreSQL não está rodando
```bash
docker-compose up -d
```

### ❌ Erro: "JWT_SECRET is required"
**Solução:** Falta arquivo `.env`
```bash
cd backend
cp .env.example .env
```

### ❌ Erro: "Table doesn't exist"
**Solução:** Banco não foi migrado
```bash
cd backend
npm run migrate
npm run seed
```

---

## 📚 Documentação Completa

- **[README.md](./README.md)** - Visão geral
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Todos os endpoints
- **[BACKEND_COMPLETE.md](./BACKEND_COMPLETE.md)** - O que foi implementado
- **[CLAUDE.md](./CLAUDE.md)** - Diretrizes de código

---

## 📊 Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Dados do usuário logado

### Coletas
- `GET /api/collections` - Listar coletas
- `POST /api/collections` - Registrar coleta
- `GET /api/collections/:id` - Detalhes da coleta

### Clientes
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Detalhes do cliente

### Dashboard
- `GET /api/dashboard` - Dados analíticos

### Relatórios
- `GET /api/reports/export?format=xlsx` - Baixar relatório Excel

---

## 🎯 Checklist de Funcionalidades

Tudo isso já está pronto e funcionando:

- ✅ Autenticação JWT
- ✅ Cadastro de clientes
- ✅ Cadastro de unidades
- ✅ Tipos de resíduos
- ✅ Registro de coletas
- ✅ Dados gravimétricos (peso)
- ✅ Upload de imagens
- ✅ Dashboard com analytics
- ✅ Relatórios Excel/CSV
- ✅ Controle de acesso (ADMIN/OPERATOR)
- ✅ Logs de auditoria
- ✅ LGPD compliance
- ✅ Paginação
- ✅ Filtros avançados
- ✅ Rate limiting
- ✅ Validação de dados
- ✅ Tratamento de erros

---

## 🚀 Você está pronto!

O backend está **100% funcional** e aguardando o app mobile se conectar! 📱

Qualquer dúvida, consulte a documentação completa em [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**Boa sorte com o desenvolvimento! 🎉**
