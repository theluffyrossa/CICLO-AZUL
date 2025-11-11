# CICLO AZUL - API Documentation

## 📚 Visão Geral

API RESTful para gerenciamento de resíduos sólidos desenvolvida para aplicativo mobile.

**Base URL**: `http://localhost:3000/api`

**Autenticação**: JWT Bearer Token

---

## 🔐 Autenticação

### POST /auth/login
Realiza login e retorna tokens JWT.

**Request Body:**
```json
{
  "email": "admin@cicloazul.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@cicloazul.com",
      "role": "ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### POST /auth/refresh
Renova o access token usando o refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /auth/logout
Faz logout do usuário (requer autenticação).

**Headers:**
```
Authorization: Bearer <token>
```

### GET /auth/me
Retorna informações do usuário autenticado.

---

## 👥 Clientes

### POST /clients
Cria novo cliente (ADMIN apenas).

**Request Body:**
```json
{
  "name": "Empresa ABC Ltda",
  "document": "12.345.678/0001-90",
  "phone": "(11) 98765-4321",
  "email": "contato@empresa.com",
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567",
  "notes": "Cliente VIP"
}
```

### GET /clients
Lista todos os clientes com paginação.

**Query Parameters:**
- `page` (number): Página atual (default: 1)
- `limit` (number): Itens por página (default: 20, max: 100)
- `search` (string): Busca por nome, documento ou email
- `active` (boolean): Filtrar por status ativo
- `city` (string): Filtrar por cidade
- `state` (string): Filtrar por estado (sigla)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "name": "Empresa ABC Ltda",
        "document": "12.345.678/0001-90",
        "active": true,
        "units": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### GET /clients/:id
Retorna um cliente específico com suas unidades.

### PUT /clients/:id
Atualiza um cliente (ADMIN apenas).

### DELETE /clients/:id
Remove um cliente (soft delete, ADMIN apenas).

---

## 🏭 Unidades

### POST /units
Cria nova unidade geradora (ADMIN apenas).

**Request Body:**
```json
{
  "clientId": "uuid",
  "name": "Filial Centro",
  "type": "Loja",
  "address": "Av. Paulista, 1000",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01310-100",
  "latitude": -23.561684,
  "longitude": -46.656140,
  "responsibleName": "Maria Santos",
  "responsiblePhone": "(11) 99999-2222"
}
```

### GET /units
Lista todas as unidades com paginação.

**Query Parameters:**
- `clientId` (uuid): Filtrar por cliente
- `search` (string): Busca por nome, tipo ou endereço
- `active` (boolean): Filtrar por status ativo
- `city` (string): Filtrar por cidade
- `state` (string): Filtrar por estado

### GET /units/client/:clientId
Lista unidades de um cliente específico (apenas ativas).

### GET /units/:id
Retorna uma unidade específica.

### PUT /units/:id
Atualiza uma unidade (ADMIN apenas).

### DELETE /units/:id
Remove uma unidade (soft delete, ADMIN apenas).

---

## ♻️ Tipos de Resíduos

### POST /waste-types
Cria novo tipo de resíduo (ADMIN apenas).

**Request Body:**
```json
{
  "name": "Papel e Papelão",
  "category": "RECYCLABLE",
  "description": "Papel, papelão, jornais, revistas",
  "unit": "kg"
}
```

**Categorias válidas:**
- `ORGANIC`
- `RECYCLABLE`
- `HAZARDOUS`
- `ELECTRONIC`
- `CONSTRUCTION`
- `OTHER`

### GET /waste-types
Lista todos os tipos de resíduos.

**Query Parameters:**
- `category` (enum): Filtrar por categoria
- `active` (boolean): Filtrar por status ativo
- `search` (string): Busca por nome ou descrição

### GET /waste-types/active
Lista apenas tipos de resíduos ativos (para dropdowns no mobile).

### GET /waste-types/:id
Retorna um tipo de resíduo específico.

### PUT /waste-types/:id
Atualiza um tipo de resíduo (ADMIN apenas).

### DELETE /waste-types/:id
Remove um tipo de resíduo (ADMIN apenas).

---

## 📦 Coletas

### POST /collections
Registra nova coleta (OPERATOR ou ADMIN).

**Request Body:**
```json
{
  "clientId": "uuid",
  "unitId": "uuid",
  "wasteTypeId": "uuid",
  "userId": "uuid",
  "collectionDate": "2025-01-15T10:30:00Z",
  "status": "COMPLETED",
  "notes": "Coleta realizada sem problemas",
  "latitude": -23.550520,
  "longitude": -46.633308
}
```

**Status válidos:**
- `SCHEDULED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

### GET /collections
Lista todas as coletas com filtros.

**Query Parameters:**
- `clientId` (uuid): Filtrar por cliente
- `unitId` (uuid): Filtrar por unidade
- `wasteTypeId` (uuid): Filtrar por tipo de resíduo
- `userId` (uuid): Filtrar por usuário responsável
- `status` (enum): Filtrar por status
- `startDate` (ISO date): Data inicial
- `endDate` (ISO date): Data final
- `page`, `limit`: Paginação

**Observação:** Operadores só veem suas próprias coletas.

**Response inclui:**
- Dados do cliente
- Dados da unidade
- Tipo de resíduo
- Usuário responsável

### GET /collections/:id
Retorna coleta completa com:
- Dados gravimétricos
- Imagens anexadas

### PUT /collections/:id
Atualiza uma coleta (OPERATOR ou ADMIN).

### DELETE /collections/:id
Remove uma coleta (OPERATOR ou ADMIN).

---

## ⚖️ Dados Gravimétricos

### POST /gravimetric-data
Adiciona peso manualmente (OPERATOR ou ADMIN).

**Request Body:**
```json
{
  "collectionId": "uuid",
  "weightKg": 45.5,
  "source": "MANUAL",
  "deviceId": "SCALE-001"
}
```

**Fontes válidas:**
- `MANUAL`: Entrada manual
- `CSV_IMPORT`: Importação CSV
- `API`: API externa
- `SCALE`: Balança digital

### POST /gravimetric-data/import-csv
Importa múltiplos pesos de arquivo CSV.

**Request Body:**
```json
{
  "rows": [
    {
      "collectionId": "uuid",
      "weightKg": 45.5,
      "deviceId": "SCALE-001"
    }
  ]
}
```

### POST /gravimetric-data/api-input
Endpoint para integração com balanças digitais.

**Request Body:**
```json
{
  "collectionId": "uuid",
  "weightKg": 78.2,
  "deviceId": "SCALE-001"
}
```

### GET /gravimetric-data/collection/:collectionId
Lista todos os pesos de uma coleta.

### GET /gravimetric-data/:id
Retorna um registro específico.

### PUT /gravimetric-data/:id
Atualiza um registro de peso.

### DELETE /gravimetric-data/:id
Remove um registro de peso.

---

## 📸 Imagens

### POST /images/upload
Faz upload de imagem (OPERATOR ou ADMIN).

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `image` (file): Arquivo de imagem (JPEG/PNG, max 10MB)
- `collectionId` (string): UUID da coleta
- `latitude` (number): Latitude GPS (opcional)
- `longitude` (number): Longitude GPS (opcional)
- `capturedAt` (ISO date): Data/hora da captura (opcional)
- `deviceInfo` (string): Informações do dispositivo (opcional)
- `consentGiven` (boolean): **Obrigatório** - Consentimento LGPD
- `description` (string): Descrição da imagem (opcional)

**Processamento automático:**
- Compressão da imagem
- Redimensionamento (max 1920x1080)
- Qualidade 80%

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "/uploads/1234567890-image.jpg",
    "filename": "1234567890-image.jpg",
    "fileSize": 245680,
    "width": 1920,
    "height": 1080,
    "consentGiven": true
  }
}
```

### GET /images/collection/:collectionId
Lista todas as imagens de uma coleta.

### GET /images/:id
Retorna metadados de uma imagem.

### PUT /images/:id
Atualiza consentimento ou descrição.

**Request Body:**
```json
{
  "consentGiven": true,
  "description": "Foto do resíduo antes da coleta"
}
```

### DELETE /images/:id
Remove imagem (arquivo físico + registro no banco).

---

## 📊 Dashboard

### GET /dashboard
Retorna dados analíticos para o dashboard.

**Query Parameters:**
- `startDate` (ISO date): Data inicial para filtro
- `endDate` (ISO date): Data final para filtro
- `clientId` (uuid): Filtrar por cliente específico

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalCollections": 150,
      "totalWeightKg": 4580.5,
      "activeClients": 45,
      "activeUnits": 120
    },
    "wasteTypeDistribution": [
      {
        "wasteTypeId": "uuid",
        "wasteTypeName": "Papel e Papelão",
        "category": "RECYCLABLE",
        "count": 45,
        "totalWeightKg": 1200.5,
        "percentage": 30
      }
    ],
    "topUnits": [
      {
        "unitId": "uuid",
        "unitName": "Fábrica Principal",
        "clientName": "Indústria XYZ",
        "totalCollections": 35,
        "totalWeightKg": 1500.0
      }
    ]
  }
}
```

---

## 📄 Relatórios

### GET /reports/export
Exporta relatório de coletas em CSV ou Excel.

**Query Parameters:**
- `format` (string): `csv` ou `xlsx` (default: xlsx)
- `startDate` (ISO date): Data inicial
- `endDate` (ISO date): Data final
- `clientId` (uuid): Filtrar por cliente
- `unitId` (uuid): Filtrar por unidade
- `wasteTypeId` (uuid): Filtrar por tipo de resíduo
- `status` (enum): Filtrar por status

**Response:**
- **Content-Type CSV**: `text/csv`
- **Content-Type Excel**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename="relatorio_coletas_YYYYMMDD_HHmmss.xlsx"`

**Exemplo de uso:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/reports/export?format=xlsx&startDate=2025-01-01&endDate=2025-01-31" \
  --output relatorio.xlsx
```

**Conteúdo do relatório:**
- Cabeçalho com título e período
- Colunas: Data, Cliente, Unidade, Tipo de Resíduo, Responsável, Status, Peso Total, Observações
- Totalizadores no final (total de coletas e peso total)

---

## 🔒 Controle de Acesso

### Perfis de Usuário

**ADMIN:**
- ✅ Acesso total
- ✅ CRUD de clientes, unidades e tipos de resíduos
- ✅ Visualizar todas as coletas
- ✅ Logs de auditoria

**OPERATOR:**
- ✅ Registrar coletas
- ✅ Ver apenas suas próprias coletas
- ✅ Upload de imagens e dados gravimétricos
- ✅ Visualizar relatórios básicos
- ❌ Sem acesso a cadastros
- ❌ Sem acesso a logs de auditoria

---

## 📡 Respostas da API

### Sucesso (200/201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Erro de Validação (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

### Erro de Autenticação (401)
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### Erro de Permissão (403)
```json
{
  "success": false,
  "message": "Access forbidden"
}
```

### Não Encontrado (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Conflito (409)
```json
{
  "success": false,
  "message": "Resource already exists"
}
```

### Erro do Servidor (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🚀 Guia Rápido para Mobile

### 1. Login
```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'operator@cicloazul.com',
    password: 'operator123'
  })
});

const { data } = await response.json();
const { accessToken, user } = data;
// Salvar token no SecureStore
```

### 2. Listar Clientes
```javascript
const response = await fetch('http://localhost:3000/api/clients?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const { data } = await response.json();
const { data: clients, pagination } = data;
```

### 3. Registrar Coleta
```javascript
const response = await fetch('http://localhost:3000/api/collections', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clientId: selectedClient.id,
    unitId: selectedUnit.id,
    wasteTypeId: selectedWasteType.id,
    userId: user.id,
    collectionDate: new Date().toISOString(),
    status: 'COMPLETED',
    latitude: location.coords.latitude,
    longitude: location.coords.longitude
  })
});

const { data: collection } = await response.json();
```

### 4. Upload de Imagem
```javascript
const formData = new FormData();
formData.append('image', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'collection.jpg'
});
formData.append('collectionId', collection.id);
formData.append('consentGiven', 'true');
formData.append('latitude', location.coords.latitude);
formData.append('longitude', location.coords.longitude);

const response = await fetch('http://localhost:3000/api/images/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

### 5. Adicionar Peso
```javascript
await fetch('http://localhost:3000/api/gravimetric-data', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    collectionId: collection.id,
    weightKg: parseFloat(weightInput),
    source: 'MANUAL'
  })
});
```

### 6. Dashboard
```javascript
const today = new Date();
const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

const response = await fetch(
  `http://localhost:3000/api/dashboard?startDate=${thirtyDaysAgo.toISOString()}&endDate=${today.toISOString()}`,
  {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  }
);

const { data: dashboardData } = await response.json();
```

---

## 🧪 Testes com cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cicloazul.com","password":"admin123"}'
```

### Listar Coletas
```bash
curl http://localhost:3000/api/collections?page=1&limit=10 \
  -H "Authorization: Bearer <seu_token>"
```

### Criar Cliente
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Authorization: Bearer <seu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nova Empresa",
    "document": "11.222.333/0001-44",
    "email": "contato@novaempresa.com"
  }'
```

### Upload de Imagem
```bash
curl -X POST http://localhost:3000/api/images/upload \
  -H "Authorization: Bearer <seu_token>" \
  -F "image=@/caminho/para/imagem.jpg" \
  -F "collectionId=<uuid>" \
  -F "consentGiven=true"
```

---

## 📝 Notas Importantes

1. **LGPD**: O campo `consentGiven` é **obrigatório** no upload de imagens
2. **Paginação**: Limite máximo de 100 itens por página
3. **Rate Limiting**: 100 requisições por 15 minutos por IP
4. **File Upload**: Máximo 10MB por imagem
5. **Token Expiration**: Access token expira em 24h, refresh token em 7 dias
6. **Soft Delete**: Registros não são deletados fisicamente, apenas marcados como inativos

---

## 🔗 Health Check

### GET /health
Verifica se a API está funcionando.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "development"
}
```

---

**Desenvolvido para uso com aplicativo mobile Expo/React Native** 📱
