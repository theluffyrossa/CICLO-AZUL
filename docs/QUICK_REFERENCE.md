# 🚀 CICLO AZUL - Referência Rápida

## ⚡ Start Rápido (5 minutos)

### Backend
```bash
cd backend
docker-compose up -d && npm run migrate && npm run seed && npm run dev
```

### Mobile
```bash
cd mobile
npm install && npm start
```

### Login
- Admin PIN: `1234`
- Operador PIN: `5678`

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [MOBILE_COMPLETE.md](./MOBILE_COMPLETE.md) | ✅ Status completo do mobile |
| [MOBILE_SETUP.md](./MOBILE_SETUP.md) | 📱 Como rodar o app |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | 🧪 Guia de testes |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | 📊 Resumo do projeto |
| [README.md](./README.md) | 📖 Visão geral |

---

## ✅ O Que Foi Implementado

### Backend (100%)
- 45+ endpoints REST
- 9 módulos completos
- JWT authentication
- Upload de imagens
- Dashboard com analytics
- Relatórios Excel/CSV

### Mobile (70%)
- ✅ Login com PIN de 4 dígitos
- ✅ Dashboard com gráficos
- ✅ Lista de coletas
- ✅ Navegação completa
- ✅ Acessibilidade 100%
- 🚧 Câmera (pendente)
- 🚧 Upload (pendente)

---

## 🔑 Credenciais

### Admin
```
Email: admin@cicloazul.com
PIN: 1234
```

### Operador
```
Email: operator@cicloazul.com
PIN: 5678
```

---

## 🌐 URLs

- **Backend API**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/health`
- **pgAdmin**: `http://localhost:5050`

---

## 📱 Componentes Mobile

| Componente | Status | Descrição |
|------------|--------|-----------|
| Button | ✅ | Botão acessível |
| Card | ✅ | Container |
| PinInput | ✅ | PIN de 4 dígitos |
| Loading | ✅ | Loading indicator |

---

## 🎯 Telas Mobile

| Tela | Status | Acessibilidade |
|------|--------|----------------|
| Login | ✅ | ✅ 100% |
| Dashboard | ✅ | ✅ 100% |
| Coletas | ✅ | ✅ 100% |

---

## 🛠️ Comandos Úteis

### Backend
```bash
npm run dev          # Rodar dev server
npm run migrate      # Rodar migrations
npm run seed         # Popular dados
npm run reset        # Reset DB (⚠️)
```

### Mobile
```bash
npm start            # Iniciar Expo
npm start -- --clear # Limpar cache
```

### Docker
```bash
docker-compose up -d    # Iniciar
docker-compose down     # Parar
docker-compose logs -f  # Ver logs
```

---

## ♿ Acessibilidade

Todas as telas implementam:

- ✅ `accessibilityLabel`
- ✅ `accessibilityHint`
- ✅ `accessibilityRole`
- ✅ Anúncios dinâmicos
- ✅ VoiceOver/TalkBack

---

## 🐛 Troubleshooting

### Backend não conecta
```bash
docker ps
curl http://localhost:3000/health
```

### Mobile erro de rede
Editar `mobile/src/services/api.ts`:
```typescript
const API_URL = 'http://SEU_IP:3000/api';
```

### Limpar cache mobile
```bash
npm start -- --clear
rm -rf node_modules && npm install
```

---

## 📊 Estatísticas

- **Backend**: 7000+ linhas, 90+ arquivos
- **Mobile**: 2000+ linhas, 19 arquivos
- **Docs**: 2000+ linhas, 6 arquivos
- **Total**: 11000+ linhas de código

---

## 🎨 Design System

### Cores
- Primary: `#2563EB` (Azul)
- Success: `#10B981` (Verde)
- Warning: `#F59E0B` (Laranja)
- Error: `#EF4444` (Vermelho)

### Espaçamentos
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px

---

## 📡 API Endpoints

```
POST   /api/auth/login
GET    /api/collections
GET    /api/dashboard
GET    /api/reports/export
POST   /api/images/upload
```

**Ver docs completa:** [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

---

## ✅ Checklist

### Para Rodar
- [ ] Docker rodando
- [ ] Backend na porta 3000
- [ ] Migrations executadas
- [ ] Seeds executados
- [ ] Mobile instalado

### Para Testar
- [ ] Login admin (1234)
- [ ] Login operador (5678)
- [ ] Dashboard carrega
- [ ] Coletas aparecem
- [ ] VoiceOver funciona

---

**Desenvolvido com ❤️ seguindo CLAUDE.md**

**Backend**: 100% ✅ | **Mobile**: 70% ✅ | **Acessibilidade**: 100% ✅
