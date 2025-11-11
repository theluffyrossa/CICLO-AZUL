# 🚀 Guia de Instalação - CICLO AZUL

## 📋 Pré-requisitos

### Necessário:
- Node.js 18+ ([Download](https://nodejs.org/))
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))
- Expo CLI: `npm install -g expo-cli`

### Para iOS:
- macOS com Xcode
- Simulador iOS ou iPhone com Expo Go

### Para Android:
- Android Studio com emulador
- Ou smartphone Android com Expo Go

---

## 🔧 Instalação Completa (Primeira Vez)

### 1. Clonar Repositório
```bash
git clone <repository-url>
cd CICLO-AZUL
```

### 2. Instalar Dependências do Backend
```bash
cd backend
npm install
```

### 3. Instalar Dependências do Mobile
```bash
cd ../mobile
npm install
```

### 4. Configurar Ambiente do Backend
```bash
cd ../backend
cp .env.example .env
```

Edite `.env` se necessário (configurações padrão funcionam).

### 5. Iniciar Banco de Dados
```bash
docker-compose up -d
```

Aguarde ~30 segundos para PostgreSQL iniciar completamente.

### 6. Executar Migrations
```bash
npm run migrate
```

### 7. Popular Banco com Dados Demo
```bash
npm run seed
```

### 8. Verificar Backend
```bash
npm run dev
```

Abra http://localhost:3000/health - deve retornar `{"status":"ok"}`

---

## 📱 Executar Mobile

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

### Terminal 2: Mobile
```bash
cd mobile
npm start
```

### Opções de Execução:

#### iOS (macOS apenas):
```bash
# No terminal do Expo, pressione:
i    # Abre no simulador iOS

# Ou escaneie QR code com câmera do iPhone
```

#### Android:
```bash
# No terminal do Expo, pressione:
a    # Abre no emulador Android

# Ou escaneie QR code com Expo Go
```

#### Web (para testes rápidos):
```bash
# No terminal do Expo, pressione:
w    # Abre no navegador
```

---

## 🔐 Credenciais de Teste

### Admin (Acesso Total)
- Email: `admin@cicloazul.com`
- PIN: `1234`

### Operador (Apenas suas coletas)
- Email: `operator@cicloazul.com`
- PIN: `5678`

---

## 🌐 Configurar IP para Dispositivo Físico

Se estiver testando em smartphone real:

### 1. Descobrir IP da sua máquina:
```bash
# macOS/Linux
ifconfig | grep inet

# Windows
ipconfig
```

Procure por algo como: `192.168.1.100`

### 2. Atualizar API URL:
Edite `mobile/src/services/api.service.ts`:

```typescript
// Trocar de:
const API_URL = 'http://localhost:3000/api';

// Para:
const API_URL = 'http://192.168.1.100:3000/api';
```

### 3. Reiniciar App:
```bash
# Pressione 'r' no terminal do Expo
```

---

## 🧪 Testar Funcionalidades

### 1. Login
- Abrir app
- Selecionar usuário Admin
- Digitar PIN: `1234`
- Tocar "Entrar"

### 2. Dashboard
- Verificar 4 cards de estatísticas
- Ver gráfico de pizza
- Ver top 5 unidades
- Puxar para atualizar

### 3. Lista de Coletas
- Tocar aba "Coletas"
- Ver lista de coletas
- Tocar em uma coleta para ver detalhes

### 4. Nova Coleta
- Na aba "Coletas"
- Tocar botão FAB (+ flutuante)
- Preencher formulário
- Tocar "Criar Coleta"

### 5. Modo Offline
- Desligar WiFi/Dados
- Banner vermelho "Offline" deve aparecer
- Criar nova coleta
- Ver mensagem "Será sincronizada quando estiver online"
- Ligar WiFi/Dados
- Ver sincronização automática

---

## 🐛 Troubleshooting

### Backend não inicia

**Erro: "Port 3000 already in use"**
```bash
# Encontrar e matar processo
lsof -i :3000
kill -9 <PID>
```

**Erro: "Cannot connect to database"**
```bash
# Verificar Docker
docker ps

# Reiniciar PostgreSQL
docker-compose down
docker-compose up -d

# Esperar 30s e tentar novamente
```

**Erro: "Migration failed"**
```bash
# Reset completo (⚠️ APAGA DADOS)
npm run reset
npm run migrate
npm run seed
```

---

### Mobile não conecta ao backend

**Erro: "Network request failed"**

Verifique:
1. Backend está rodando (`curl http://localhost:3000/health`)
2. IP correto em `api.service.ts` (se em dispositivo físico)
3. Firewall não está bloqueando porta 3000

**Erro: "Unable to resolve module"**
```bash
cd mobile
npm start -- --clear
```

**Erro: "Cannot find module"**
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
```

---

### Expo não inicia

**Erro: "Expo CLI not found"**
```bash
npm install -g expo-cli
```

**Erro: "Port 19000 in use"**
```bash
lsof -i :19000
kill -9 <PID>
```

---

### Acessibilidade não funciona

**VoiceOver não lê elementos (iOS)**
- Verificar VoiceOver ativado: Configurações > Acessibilidade > VoiceOver
- Reiniciar app
- iOS 13+ necessário

**TalkBack não lê elementos (Android)**
- Verificar TalkBack ativo: Configurações > Acessibilidade > TalkBack
- Reiniciar app
- Android 8+ necessário

---

## 🔄 Comandos Úteis

### Backend
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Rodar produção
npm run migrate      # Executar migrations
npm run seed         # Popular dados
npm run reset        # Reset database (⚠️)
npm run lint         # Verificar código
```

### Mobile
```bash
npm start            # Iniciar Expo
npm start -- --clear # Limpar cache
npm run android      # Rodar Android direto
npm run ios          # Rodar iOS direto
npm run web          # Rodar web
npm run lint         # Verificar código
```

### Docker
```bash
docker-compose up -d     # Iniciar serviços
docker-compose down      # Parar serviços
docker-compose logs -f   # Ver logs
docker-compose restart   # Reiniciar
docker-compose ps        # Ver status
```

---

## 📦 Estrutura de Pastas

```
CICLO-AZUL/
├── backend/                 # API Backend
│   ├── src/
│   │   ├── modules/        # 9 módulos
│   │   ├── database/       # Models, migrations
│   │   ├── middleware/     # Auth, validation
│   │   └── utils/          # Helpers
│   ├── .env                # Config (criar)
│   └── docker-compose.yml  # PostgreSQL
│
├── mobile/                  # App Mobile
│   ├── src/
│   │   ├── components/     # Componentes
│   │   │   ├── common/    # 10 componentes
│   │   │   └── forms/     # 5 componentes
│   │   ├── screens/       # Telas
│   │   │   ├── auth/      # Login
│   │   │   ├── dashboard/ # Dashboard
│   │   │   └── collections/ # Coletas
│   │   ├── services/      # API services
│   │   ├── store/         # Zustand stores
│   │   ├── theme/         # Design system
│   │   └── types/         # TypeScript types
│   ├── App.tsx            # Root
│   └── app.json           # Expo config
│
└── docs/                    # Documentação
    ├── API_DOCUMENTATION.md
    ├── IMPLEMENTATION_SUMMARY.md
    └── ...
```

---

## ✅ Verificação Final

Antes de começar a usar, verifique:

### Backend
- [ ] Docker rodando
- [ ] PostgreSQL ativo (`docker ps`)
- [ ] Migrations executadas
- [ ] Seeds carregados
- [ ] API respondendo em http://localhost:3000/health

### Mobile
- [ ] Dependências instaladas
- [ ] Expo CLI global instalado
- [ ] App iniciando sem erros
- [ ] Login funciona
- [ ] Dashboard carrega dados

### Funcionalidades
- [ ] Login com PIN 1234
- [ ] Dashboard mostra estatísticas
- [ ] Lista de coletas carrega
- [ ] Criar nova coleta funciona
- [ ] Detalhes da coleta abrem
- [ ] Modo offline detectado
- [ ] VoiceOver/TalkBack funcionam

---

## 🆘 Suporte

### Problemas Comuns

**"Não consigo fazer login"**
- Verificar backend rodando
- Verificar seeds executados
- Tentar reset: `npm run reset && npm run migrate && npm run seed`

**"App não carrega dados"**
- Verificar conexão de rede
- Ver console do Expo para erros
- Verificar IP correto se em dispositivo físico

**"Modo offline não funciona"**
- Verificar `@react-native-community/netinfo` instalado
- Ver console para logs
- Tentar limpar cache: `npm start -- --clear`

---

## 📚 Documentação Adicional

- **API**: [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- **Mobile**: [MOBILE_COMPLETE.md](MOBILE_COMPLETE.md)
- **Offline**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Testes**: [TESTING_GUIDE.md](TESTING_GUIDE.md)
- **Setup**: [MOBILE_SETUP.md](MOBILE_SETUP.md)

---

## 🎉 Pronto para Usar!

Se todos os checks acima passaram, você está pronto para começar a desenvolver!

**Login**: `admin@cicloazul.com` / PIN: `1234`

**Próximos passos**: Ver [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) para funcionalidades pendentes.

---

**Desenvolvido com ❤️ seguindo CLAUDE.md**
