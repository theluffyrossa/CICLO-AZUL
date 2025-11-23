# 🔑 Dados de Acesso - CICLO AZUL

## 📋 Credenciais Iniciais do Sistema

Após executar o seed do banco de dados, os seguintes usuários estarão disponíveis:

---

## 👤 ADMINISTRADOR DO SISTEMA

**Usuário:** `admin`
**PIN:** `1234`
**Permissões:** Acesso total ao sistema, gerenciamento de usuários, configurações

---

## 🏢 CLIENTES PILOTO

### Cliente 1: PARQUE ECOLÓGICO RIO FORMOSO

**Razão Social:** PARQUE ECOLÓGICO RIO FORMOSO LTDA
**Nome Fantasia:** Parque Ecológico Rio Formoso e Restaurante da Lagoa
**CNPJ:** 04.495.804/0001-60

**Credenciais de Acesso:**
- **Usuário:** `parquerioformoso`
- **PIN:** `1111`

**Contato:**
- Telefone: (67) 98162-5580
- Endereço: Rodovia Bonito / Guia Lopes Da Laguna, S/N Km 07 - Zona Rural
- CEP: 79290-000 - Bonito/MS

**Ponto de Coleta:** Ponto 1 - Pq Eco

**Tipos de Resíduos Monitorados:**
- Garrafa Pet
- Plástico Mole
- Plástico Duro
- Pet Óleo
- Embalagem Longa Vida
- Latas de Alumínio
- Metais em Geral
- Papel
- Cartonagem
- Papelão
- Rejeito
- Orgânicos
- Isopor
- Caixotes
- Tampinha de Garrafa
- Vidro
- Neoprene

---

### Cliente 2: BACURI COZINHA REGIONAL

**Razão Social:** C&S BARES E RESTAURANTES LTDA
**Nome Fantasia:** BACURI Cozinha Regional
**CNPJ:** 49.870.410/0001-82

**Credenciais de Acesso:**
- **Usuário:** `bacuri`
- **PIN:** `2222`

**Contato:**
- Telefone: (67) 98473-8342
- Endereço: Rua 24 de Fevereiro, 2268, Centro
- CEP: 79290-000 - Bonito/MS

**Ponto de Coleta:** Ponto 1 - Restaurante Bacuri

**Tipos de Resíduos Monitorados:**
- Orgânicos
- Alimentação Animal
- Rejeitos
- Pet Óleo
- Plástico (Mole e Duro)
- Alumínio
- Vidro
- Papelão
- Papel
- Cartonagem
- Embalagem Longa Vida
- Óleo (cozinha)
- Caixotes
- Isopor
- Metais em Geral

---

## 🗑️ Tipos de Resíduo Cadastrados

O sistema possui **20 tipos de resíduo** cadastrados:

### Recicláveis
1. Garrafa Pet
2. Plástico Mole
3. Plástico Duro
4. Pet Óleo
5. Embalagem Longa Vida
6. Latas de Alumínio
7. Alumínio
8. Metais em Geral
9. Papel
10. Cartonagem
11. Papelão
12. Isopor
13. Caixotes
14. Tampinha de Garrafa
15. Vidro
16. Neoprene

### Orgânicos
17. Orgânicos
18. Alimentação Animal

### Perigosos
19. Óleo (de cozinha)

### Rejeitos
20. Rejeito

---

## 🚀 Como Usar

### 1. Executar o Seed

```bash
cd backend
npm run seed
```

### 2. Fazer Login no App

Escolha um dos perfis acima e faça login com usuário + PIN de 4 dígitos.

### 3. Primeiro Acesso

⚠️ **IMPORTANTE:** Após o primeiro login, altere imediatamente sua senha!

---

## 🔒 Segurança

### Recomendações:

1. **Altere as senhas padrão** imediatamente após o primeiro acesso
2. **Não compartilhe** as credenciais
3. **Use senhas fortes** em produção (não apenas PINs de 4 dígitos)
4. **Revise regularmente** os acessos ao sistema

### Dados Sensíveis:

- ✅ Todos os dados estão no banco de dados
- ✅ Podem ser editados via interface
- ✅ Podem ser desativados/removidos quando necessário
- ✅ Não estão hardcoded no código fonte

---

## 📞 Suporte

Para redefinir senhas ou adicionar novos usuários, use o painel administrativo ou entre em contato com o administrador do sistema.

---

**Última atualização:** 2025-11-12
