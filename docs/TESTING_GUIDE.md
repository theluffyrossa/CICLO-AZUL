# 🧪 CICLO AZUL - Guia de Testes

## Status: Pronto para Testes ✅

Este guia detalha como testar todas as funcionalidades implementadas no backend e mobile.

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Testes do Backend](#testes-do-backend)
3. [Testes do Mobile](#testes-do-mobile)
4. [Testes de Acessibilidade](#testes-de-acessibilidade)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

### Backend
```bash
cd backend
docker-compose up -d
npm run migrate
npm run seed
npm run dev
```

Verifique se está rodando:
```bash
curl http://localhost:3000/health
# Deve retornar: {"status":"ok","timestamp":"..."}
```

### Mobile
```bash
cd mobile
npm install
```

---

## 🖥️ Testes do Backend

### 1. Teste de Autenticação

#### Login Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cicloazul.com",
    "password": "admin123"
  }'
```

**Resultado esperado:**
```json
{
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@cicloazul.com",
    "role": "ADMIN"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Login Operador
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operator@cicloazul.com",
    "password": "operator123"
  }'
```

### 2. Teste de Clientes (Admin)

**Copie o token do login admin para TOKEN_ADMIN**

```bash
TOKEN_ADMIN="eyJhbGc..."

# Listar clientes
curl http://localhost:3000/api/clients \
  -H "Authorization: Bearer $TOKEN_ADMIN"

# Buscar cliente específico
curl http://localhost:3000/api/clients/1 \
  -H "Authorization: Bearer $TOKEN_ADMIN"

# Criar novo cliente
curl -X POST http://localhost:3000/api/clients \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Empresa Teste",
    "type": "LEGAL_ENTITY",
    "documentNumber": "12345678901234",
    "email": "teste@empresa.com",
    "phone": "11987654321"
  }'
```

### 3. Teste de Coletas

```bash
# Listar coletas
curl http://localhost:3000/api/collections \
  -H "Authorization: Bearer $TOKEN_ADMIN"

# Filtrar por status
curl "http://localhost:3000/api/collections?status=COMPLETED" \
  -H "Authorization: Bearer $TOKEN_ADMIN"

# Filtrar por período
curl "http://localhost:3000/api/collections?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $TOKEN_ADMIN"
```

### 4. Teste de Dashboard

```bash
# Dashboard completo
curl http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer $TOKEN_ADMIN"

# Dashboard com filtro de período
curl "http://localhost:3000/api/dashboard?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $TOKEN_ADMIN"
```

**Resultado esperado:**
```json
{
  "summary": {
    "totalCollections": 4,
    "totalWeight": 450.5,
    "totalClients": 3,
    "totalUnits": 4
  },
  "wasteTypeDistribution": [
    {
      "name": "Plástico",
      "percentage": 45.5,
      "totalWeight": 205.0
    }
  ],
  "topUnits": [
    {
      "unitName": "Unidade ABC",
      "totalCollections": 2,
      "totalWeight": 250.0
    }
  ]
}
```

### 5. Teste de Relatórios

```bash
# Exportar Excel
curl "http://localhost:3000/api/reports/export?format=xlsx" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -o relatorio.xlsx

# Exportar CSV
curl "http://localhost:3000/api/reports/export?format=csv" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -o relatorio.csv

# Abrir arquivos
open relatorio.xlsx
open relatorio.csv
```

### 6. Teste de Upload de Imagens

```bash
# Upload de imagem com consentimento LGPD
curl -X POST http://localhost:3000/api/images/upload \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -F "image=@/caminho/para/imagem.jpg" \
  -F "collectionId=1" \
  -F "lgpdConsent=true" \
  -F "latitude=-23.5505" \
  -F "longitude=-46.6333"
```

### 7. Teste de Permissões (Operador)

```bash
TOKEN_OPERATOR="eyJhbGc..."

# Operador NÃO pode criar clientes (deve retornar 403)
curl -X POST http://localhost:3000/api/clients \
  -H "Authorization: Bearer $TOKEN_OPERATOR" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "type": "LEGAL_ENTITY",
    "documentNumber": "12345678901234"
  }'

# Operador pode ver suas coletas
curl http://localhost:3000/api/collections \
  -H "Authorization: Bearer $TOKEN_OPERATOR"
```

---

## 📱 Testes do Mobile

### 1. Iniciar o App

```bash
cd mobile
npm start
```

### 2. Teste de Login

#### Teste 1: Login Admin
1. Abrir o app
2. Verificar se o usuário "Admin User (Admin)" está selecionado
3. Digitar PIN: `1234`
4. Tocar em "Entrar"
5. **Verificar**: Dashboard aparece

#### Teste 2: Login Operador
1. Tocar em "Trocar Usuário"
2. Selecionar "Operator User (Operador)"
3. Digitar PIN: `5678`
4. Tocar em "Entrar"
5. **Verificar**: Dashboard aparece

#### Teste 3: PIN Inválido
1. Digitar PIN: `0000`
2. Tocar em "Entrar"
3. **Verificar**: Mensagem de erro "Email ou senha inválidos"

#### Teste 4: PIN Incompleto
1. Digitar apenas 3 dígitos: `123`
2. Tocar em "Entrar"
3. **Verificar**: Mensagem "Digite o PIN de 4 dígitos"

### 3. Teste de Dashboard

1. Fazer login
2. **Verificar cards de estatísticas**:
   - Total de Coletas
   - Peso Total (kg)
   - Clientes Ativos
   - Unidades Ativas

3. **Verificar gráfico de pizza**:
   - Distribuição por tipo de resíduo
   - Cores diferentes para cada tipo
   - Legendas corretas

4. **Verificar Top 5 Unidades**:
   - Lista das 5 unidades com mais coletas
   - Peso total e número de coletas

5. **Teste Pull to Refresh**:
   - Puxar para baixo na tela
   - **Verificar**: Indicador de loading + dados atualizados

### 4. Teste de Lista de Coletas

1. Tocar na aba "Coletas"
2. **Verificar lista de coletas**:
   - Cards com informações completas
   - Status com cores (Agendada=Azul, Em Andamento=Laranja, Concluída=Verde, Cancelada=Vermelho)
   - Cliente, unidade, tipo de resíduo, data, peso

3. **Verificar informações de cada coleta**:
   - Ícone de cliente
   - Nome da unidade
   - Tipo de resíduo
   - Data formatada em português
   - Peso em kg
   - Número de fotos (se houver)
   - Notas (se houver)

4. **Teste Pull to Refresh**:
   - Puxar para baixo
   - **Verificar**: Lista atualizada

5. **Verificar paginação**:
   - Scroll até o final
   - **Verificar**: Rodapé com "X de Y coletas"

### 5. Teste de Navegação

1. **Teste navegação entre abas**:
   - Tocar em "Dashboard"
   - Tocar em "Coletas"
   - **Verificar**: Transições suaves

2. **Teste de logout** (quando implementado):
   - Tocar em botão de logout
   - **Verificar**: Volta para tela de login

---

## ♿ Testes de Acessibilidade

### iOS - VoiceOver

1. **Ativar VoiceOver**:
   - Configurações > Acessibilidade > VoiceOver > Ativar
   - Ou: Atalho Siri "Ativar VoiceOver"

2. **Teste Login Screen**:
   - **Verificar leitura**: "CICLO AZUL - Sistema de Gestão de Resíduos Sólidos"
   - **Verificar campo PIN**: "Digite seu PIN de 4 dígitos"
   - **Verificar botão**: "Entrar - Botão - Toque duas vezes para fazer login"
   - **Verificar troca de usuário**: "Trocar Usuário - Botão"

3. **Teste Dashboard**:
   - **Verificar cards**: "Total de coletas: 45"
   - **Verificar gráfico**: "Distribuição de resíduos por tipo - Gráfico"
   - **Verificar lista**: "Top 5 Unidades - Lista com 5 itens"

4. **Teste Lista de Coletas**:
   - **Verificar item**: "Coleta 1: Cliente ABC, Plástico, Concluída, 15 de janeiro, 10:30, Peso total: 125.50 quilogramas"
   - **Verificar status**: "Status: Concluída"

5. **Teste Anúncios Dinâmicos**:
   - Digitar PIN completo → Ouvir: "PIN completo inserido"
   - Fazer login → Ouvir: "Login realizado com sucesso"
   - Puxar para atualizar → Ouvir: "Atualizando lista de coletas"

### Android - TalkBack

1. **Ativar TalkBack**:
   - Configurações > Acessibilidade > TalkBack > Ativar
   - Ou: Manter pressionado ambos os botões de volume

2. **Executar mesmos testes do VoiceOver**

### Teste de Navegação por Teclado

1. **Conectar teclado Bluetooth**
2. **Teste Tab Navigation**:
   - Pressionar Tab para navegar entre elementos
   - **Verificar**: Foco visual claro
   - **Verificar**: Ordem lógica de navegação

3. **Teste Enter/Space**:
   - Navegar até botão
   - Pressionar Enter ou Space
   - **Verificar**: Botão ativa corretamente

### Teste de Contraste

1. **Ativar Alto Contraste**:
   - iOS: Configurações > Acessibilidade > Exibir e Tamanho do Texto > Aumentar Contraste
   - Android: Configurações > Acessibilidade > Texto de Alto Contraste

2. **Verificar**:
   - Textos legíveis
   - Botões distinguíveis
   - Status com contraste suficiente

### Teste de Tamanho de Fonte

1. **Aumentar tamanho da fonte**:
   - iOS: Configurações > Acessibilidade > Tamanhos Maiores
   - Android: Configurações > Exibir > Tamanho da Fonte

2. **Verificar**:
   - Textos não cortados
   - Layout não quebrado
   - Elementos não sobrepostos

---

## 🐛 Troubleshooting

### Backend

#### Erro: "Cannot connect to database"
```bash
# Verificar Docker
docker ps

# Reiniciar PostgreSQL
docker-compose down
docker-compose up -d

# Verificar logs
docker-compose logs postgres
```

#### Erro: "Port 3000 already in use"
```bash
# Encontrar processo
lsof -i :3000

# Matar processo
kill -9 PID
```

#### Erro: "Migration failed"
```bash
# Reset completo (⚠️ apaga dados)
npm run reset
npm run migrate
npm run seed
```

### Mobile

#### Erro: "Network request failed"
```bash
# Verificar backend está rodando
curl http://localhost:3000/health

# Se testando em dispositivo físico, ajustar IP
# Editar mobile/src/services/api.ts
# Trocar localhost por IP da máquina
```

#### Erro: "Module not found"
```bash
# Limpar cache
npm start -- --clear

# Reinstalar
rm -rf node_modules
npm install
```

#### App não carrega
```bash
# Verificar Expo CLI
npm install -g expo-cli

# Verificar se porta 19000 está livre
lsof -i :19000
```

### Acessibilidade

#### VoiceOver não funciona
- Verificar se VoiceOver está ativado
- Reiniciar app
- Verificar iOS 13+

#### TalkBack não lê
- Verificar se TalkBack está ativo
- Reiniciar app
- Verificar Android 8+

---

## ✅ Checklist de Testes

### Backend
- [ ] Login admin funciona
- [ ] Login operador funciona
- [ ] Refresh token automático
- [ ] CRUD de clientes
- [ ] CRUD de coletas
- [ ] Dashboard retorna dados
- [ ] Relatórios geram arquivos
- [ ] Upload de imagens funciona
- [ ] Permissões ADMIN/OPERATOR corretas
- [ ] Filtros funcionam
- [ ] Paginação funciona

### Mobile
- [ ] Login com PIN 1234 (admin)
- [ ] Login com PIN 5678 (operador)
- [ ] Troca de usuário funciona
- [ ] Validação de PIN incompleto
- [ ] Dashboard mostra estatísticas
- [ ] Gráfico de pizza renderiza
- [ ] Top 5 unidades aparece
- [ ] Lista de coletas carrega
- [ ] Pull to refresh funciona
- [ ] Paginação funciona
- [ ] Navegação entre abas

### Acessibilidade
- [ ] VoiceOver lê todos os elementos
- [ ] TalkBack lê todos os elementos
- [ ] Anúncios dinâmicos funcionam
- [ ] Navegação por teclado funciona
- [ ] Alto contraste legível
- [ ] Fonte grande não quebra layout
- [ ] Ordem de foco lógica
- [ ] Labels descritivos

---

## 📊 Dados de Teste

### Usuários
- Admin: `admin@cicloazul.com` / PIN `1234`
- Operador: `operator@cicloazul.com` / PIN `5678`

### Clientes
- Cliente ABC Ltda (CNPJ: 12345678000190)
- Cliente XYZ SA (CNPJ: 98765432000110)
- João Silva (CPF: 12345678901)

### Tipos de Resíduos
1. Papel/Papelão
2. Plástico
3. Metal
4. Vidro
5. Orgânico
6. Eletrônico
7. Perigoso
8. Outros

---

## 🎯 Resultado Esperado

Após executar todos os testes:

✅ **Backend**: Todos os endpoints respondem corretamente
✅ **Mobile**: Todas as telas funcionam perfeitamente
✅ **Acessibilidade**: Totalmente compatível com leitores de tela
✅ **Navegação**: Fluida e intuitiva
✅ **Dados**: Sincronizados corretamente

---

**Desenvolvido com ❤️ para ser acessível a todos**
