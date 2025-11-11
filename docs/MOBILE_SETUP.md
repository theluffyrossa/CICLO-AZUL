# 📱 CICLO AZUL - Mobile App Setup

## Status: Visual Screens Complete ✅

O aplicativo mobile foi desenvolvido com foco em **acessibilidade** e inclui login com **PIN de 4 dígitos numéricos**.

---

## 🚀 Como Rodar

### 1. Instalar Dependências

```bash
cd mobile
npm install
```

### 2. Configurar Backend

Certifique-se de que o backend está rodando:

```bash
cd ../backend
docker-compose up -d
npm run dev
```

O backend deve estar em `http://localhost:3000`

### 3. Configurar Variáveis de Ambiente

Crie o arquivo `.env` na pasta `mobile/`:

```bash
cd mobile
cp .env.example .env
```

Edite o arquivo `.env` e configure a URL da API com o IP da sua máquina:

```env
API_URL=http://SEU_IP_LOCAL:3000/api
NODE_ENV=development
```

**Como descobrir seu IP:**
- **Mac/Linux**: `ifconfig en0 | grep inet`
- **Windows**: `ipconfig`

**Importante:**
- Para **iOS Simulator**: use `http://localhost:3000/api`
- Para **Android Emulator**: use `http://10.0.2.2:3000/api`
- Para **Dispositivo Físico**: use o IP da sua máquina na rede (ex: `http://192.168.0.228:3000/api`)

### 4. Iniciar o App

```bash
npm start
```

**Nota:** Se encontrar erros de cache, limpe e reinicie:
```bash
npm start -- --clear
```

### 5. Testar

- **iOS**: Escanear QR code com câmera ou rodar em simulador
- **Android**: Escanear QR code com Expo Go ou rodar em emulador

---

## 🔑 Credenciais de Teste

### Admin (Acesso Total)
- **Email**: `admin@cicloazul.com`
- **PIN**: `1234`

### Operador (Apenas suas coletas)
- **Email**: `operator@cicloazul.com`
- **PIN**: `5678`

> 💡 Use o botão "Trocar Usuário" na tela de login para alternar entre os usuários demo

---

## 📱 Telas Implementadas

### 1. Login Screen ✅
- Input de PIN de 4 dígitos
- Troca rápida entre usuários demo
- Validação em tempo real
- Acessibilidade completa

### 2. Dashboard ✅
- 4 cards de estatísticas
- Gráfico de pizza com distribuição por tipo de resíduo
- Top 5 unidades
- Pull to refresh

### 3. Lista de Coletas ✅
- Cards detalhados para cada coleta
- Status visual com ícones e cores
- Informações completas
- Pull to refresh
- Paginação

---

## ♿ Recursos de Acessibilidade

Todas as telas foram desenvolvidas com **acessibilidade em primeiro lugar**:

### VoiceOver / TalkBack
- Todos os elementos têm `accessibilityLabel`
- Instruções com `accessibilityHint`
- Papéis semânticos com `accessibilityRole`
- Anúncios dinâmicos

### Navegação por Teclado
- Tab index apropriado
- Foco visual claro
- Todos os botões acessíveis

---

## 🐛 Troubleshooting

### Backend não conecta
```bash
curl http://localhost:3000/health
```

### App não inicia
```bash
npm start -- --clear
```

### Erros de tipagem
```bash
# Reiniciar TypeScript server no VSCode
Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"
```

---

**Ver documentação completa:** [MOBILE_COMPLETE.md](./MOBILE_COMPLETE.md)

**Ver guia de testes:** [TESTING_GUIDE.md](./TESTING_GUIDE.md)
