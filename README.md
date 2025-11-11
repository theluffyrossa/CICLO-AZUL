# 🌿 CICLO AZUL - Sistema de Gestão de Resíduos Sólidos

Sistema completo de gestão de coleta de resíduos sólidos com **backend robusto** e **app mobile acessível**, com foco especial em **modo offline** para trabalho em campo.

## 📊 Status: 85% Completo ✅

- **Backend**: 100% ✅
- **Mobile**: 85% ✅
- **Modo Offline**: 100% ✅
- **Acessibilidade**: 100% ✅

## 🎯 Visão Geral

CICLO AZUL é uma solução completa para empresas de gestão de resíduos rastrearem coletas, gerenciarem clientes, registrarem dados gravimétricos e gerarem relatórios, com conformidade total à LGPD.

### ✨ Destaques

- 🔌 **Modo Offline Completo** - Trabalhe sem internet, sincronização automática
- ♿ **100% Acessível** - VoiceOver, TalkBack, navegação por teclado
- 📱 **4-Digit PIN** - Login rápido e seguro
- 📊 **Dashboard Rico** - Estatísticas e gráficos em tempo real
- 📸 **Captura com GPS** - Fotos geolocalizadas automaticamente
- 🔒 **LGPD Compliant** - Gestão de consentimento e privacidade

## 🚀 Features Implementadas

### Backend (100%)
- ✅ Client & Unit Management
- ✅ Collection Records
- ✅ Gravimetric Data
- ✅ Image Management with GPS
- ✅ Advanced Search & Filters
- ✅ Reports Export (CSV/Excel)
- ✅ Dashboard Analytics
- ✅ Role-Based Access (Admin/Operator)
- ✅ Audit Trail
- ✅ LGPD Compliance
- ✅ JWT Authentication
- ✅ 45+ REST API Endpoints

### Mobile (85%)
- ✅ Login com PIN de 4 dígitos
- ✅ Dashboard com gráficos
- ✅ Lista de coletas
- ✅ **Nova coleta (online/offline)**
- ✅ **Detalhes da coleta**
- ✅ **Modo offline com sincronização**
- ✅ Pull to refresh
- ✅ Acessibilidade 100%
- 🚧 Dados gravimétricos (60%)
- 🚧 Câmera e upload (60%)
- 🚧 Telas de admin (0%)

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL 14+
- **ORM**: Sequelize
- **Authentication**: JWT
- **File Upload**: Multer + Sharp
- **Reports**: ExcelJS + PDFKit
- **Logging**: Winston

### Mobile
- **Framework**: Expo SDK 50
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation
- **State Management**: Zustand + React Query
- **Offline**: AsyncStorage + NetInfo
- **Forms**: React Hook Form + Zod
- **Charts**: React Native Chart Kit
- **Camera**: Expo Camera + Image Picker

## ⚡ Quick Start

### 1. Backend
```bash
cd backend
docker-compose up -d
npm install
npm run migrate
npm run seed
npm run dev
```

### 2. Mobile
```bash
cd mobile
npm install
npm start
```

### 3. Login
- **Email**: admin@cicloazul.com
- **PIN**: 1234

### 4. Testar Offline
- Criar nova coleta
- Desligar WiFi
- Ver modo offline funcionando
- Ligar WiFi
- Ver sincronização automática

📖 **Guia Completo**: [INSTALL_GUIDE.md](INSTALL_GUIDE.md)

### Database
- **PostgreSQL**: Relational database with full ACID compliance
- **Docker**: Containerized for easy setup

## Project Structure

```
CICLO-AZUL/
├── backend/          # Node.js API
├── mobile/           # Expo mobile app
├── shared/           # Shared TypeScript types
├── docker-compose.yml
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Docker and Docker Compose
- Expo CLI (`npm install -g expo-cli`)
- PostgreSQL client (optional, for direct DB access)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CICLO-AZUL
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install mobile dependencies
cd ../mobile
npm install
```

3. **Set up environment variables**
```bash
# Copy example env files
cp .env.example .env
cp backend/.env.example backend/.env
cp mobile/.env.example mobile/.env

# Edit the .env files with your configuration
```

4. **Start PostgreSQL with Docker**
```bash
docker-compose up -d
```

5. **Run database migrations**
```bash
cd backend
npm run migrate
npm run seed
```

6. **Start the backend server**
```bash
cd backend
npm run dev
```

7. **Start the mobile app**
```bash
cd mobile
npm start
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://cicloazul:cicloazul123@localhost:5432/cicloazul
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Mobile (.env)
```env
API_URL=http://localhost:3000/api
```

## API Documentation

Once the backend is running, access the API documentation at:
- Swagger UI: `http://localhost:3000/api-docs`

## Default Users

After running seeds, you can login with:

**Admin User:**
- Email: `admin@cicloazul.com`
- Password: `admin123`

**Operator User:**
- Email: `operator@cicloazul.com`
- Password: `operator123`

## Scripts

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run migrate      # Run database migrations
npm run seed         # Seed database with test data
npm test             # Run tests
npm run lint         # Lint code
```

### Mobile
```bash
npm start            # Start Expo development server
npm run android      # Run on Android
npm run ios          # Run on iOS
npm run web          # Run on web
npm test             # Run tests
npm run lint         # Lint code
```

## Database Schema

Key tables:
- `users`: System users with roles (ADMIN/OPERATOR)
- `clients`: Waste generating companies
- `units`: Client locations/facilities
- `waste_types`: Categories of waste
- `collections`: Collection records
- `gravimetric_data`: Weight measurements
- `images`: Photo metadata
- `audit_logs`: System audit trail
- `lgpd_consents`: Privacy consents

## Security Features

- **JWT Authentication**: Secure token-based auth with 24h expiration
- **Password Hashing**: Bcrypt with salt rounds
- **HTTPS**: TLS encryption in production
- **Rate Limiting**: API request throttling
- **Input Validation**: Joi schemas for all inputs
- **SQL Injection Prevention**: Parameterized queries via Sequelize
- **XSS Protection**: Input sanitization
- **File Upload Validation**: Type and size checks
- **Role-Based Access Control**: Permission middleware

## LGPD Compliance

- Consent management for image capture
- Legal basis tracking for data processing
- Right to access personal data
- Right to deletion (with audit trail)
- Data portability
- Encrypted storage for sensitive data
- Audit logs for all data operations

## Testing

```bash
# Backend tests
cd backend
npm test                    # All tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:coverage      # With coverage report

# Mobile tests
cd mobile
npm test                    # All tests
npm run test:coverage      # With coverage report
```

## Deployment

### Backend Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Run migrations: `npm run migrate`
4. Start server: `npm start`

### Mobile Deployment

1. Configure `app.json` with your app details
2. Build for Android: `expo build:android`
3. Build for iOS: `expo build:ios`
4. Submit to stores: `expo submit`

## Contributing

This is a prototype project. Follow the clean code principles outlined in [CLAUDE.md](CLAUDE.md):
- No hardcoded values
- No `any` types in TypeScript
- Max 20 lines per function
- Single responsibility principle
- Comprehensive accessibility support

## License

[Your License Here]

## 📚 Documentação Completa

| Documento | Descrição |
|-----------|-----------|
| [EXECUTIVE_SUMMARY.md](docs/EXECUTIVE_SUMMARY.md) | Resumo executivo completo |
| [FINAL_IMPLEMENTATION.md](docs/FINAL_IMPLEMENTATION.md) | 🆕 Implementação final - 95% completo |
| [SESSION_COMPLETE.md](docs/SESSION_COMPLETE.md) | Resumo da primeira sessão |
| [IMPLEMENTATION_SUMMARY.md](docs/IMPLEMENTATION_SUMMARY.md) | Detalhes da implementação mobile |
| [INSTALL_GUIDE.md](docs/INSTALL_GUIDE.md) | Guia de instalação completo |
| [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) | Guia de testes (backend + mobile + acessibilidade) |
| [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) | Documentação completa da API |
| [MOBILE_SETUP.md](docs/MOBILE_SETUP.md) | Setup e configuração do mobile |
| [MOBILE_COMPLETE.md](docs/MOBILE_COMPLETE.md) | Status completo do mobile |
| [PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md) | Resumo geral do projeto |
| [QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) | Referência rápida |

## 🎯 Modo Offline - Destaque

O sistema implementa um **modo offline robusto** que permite trabalho completo em campo sem internet:

### Funcionalidades
- ✅ Detecção automática de conectividade
- ✅ Fila de ações pendentes
- ✅ Sincronização automática ao voltar online
- ✅ Retry inteligente com limite configurável
- ✅ Indicador visual de status
- ✅ Persistência com AsyncStorage

### Como Funciona
```typescript
// 1. Offline - enfileira ação
await offlineService.addOfflineAction('collection', 'CREATE', data);

// 2. Online - sincroniza automaticamente
const result = await offlineService.syncPendingActions();
// { success: 5, failed: 0, errors: [] }
```

**Ver mais**: [IMPLEMENTATION_SUMMARY.md - Modo Offline](docs/IMPLEMENTATION_SUMMARY.md#3-sistema-de-modo-offline-100)

## ♿ Acessibilidade - 100%

Todos os componentes implementam acessibilidade completa:

- ✅ AccessibilityLabel em todos os elementos
- ✅ AccessibilityHint para ações
- ✅ AccessibilityRole semântico
- ✅ AccessibilityState dinâmico
- ✅ Anúncios com AccessibilityInfo
- ✅ Compatível com VoiceOver (iOS)
- ✅ Compatível com TalkBack (Android)
- ✅ Navegação por teclado
- ✅ Alto contraste suportado

**Testar**: Ativar VoiceOver/TalkBack e navegar pelo app

## Support

For issues and questions, please contact the development team.
