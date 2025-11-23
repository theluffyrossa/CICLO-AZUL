# Design System - CICLO AZUL

## 🎨 Paleta de Cores

### Cores Primárias (Azul)
Tons de azul modernos inspirados no tema "CICLO AZUL"

```typescript
primary: {
  50: '#EBF5FF',  // Muito claro - backgrounds sutis
  100: '#D6EBFF', // Claro - backgrounds leves
  200: '#ADD6FF', //
  300: '#7AB8FF', //
  400: '#4A9EFF', //
  500: '#2B87F5', // Principal
  600: '#1E6FDB', // Botões e elementos principais
  700: '#1557B0', // Hover states
  800: '#0F4485', //
  900: '#0A2E5C', // Muito escuro
}
```

### Cores Secundárias (Verde Ecológico)
Representando sustentabilidade e natureza

```typescript
secondary: {
  50: '#EDFCF2',
  100: '#D3F8DF',
  200: '#AAF0C4',
  300: '#73E2A3',
  400: '#47D483',
  500: '#22C55E',
  600: '#16A34A', // Principal
  700: '#15803D',
  800: '#166534',
  900: '#14532D',
}
```

### Cores de Status

```typescript
success: { light: '#6EE7B7', main: '#10B981', dark: '#059669' }
error: { light: '#FCA5A5', main: '#EF4444', dark: '#DC2626' }
warning: { light: '#FCD34D', main: '#F59E0B', dark: '#D97706' }
info: { light: '#7AB8FF', main: '#2B87F5', dark: '#1E6FDB' }
```

### Cores Neutras

```typescript
neutral: {
  50: '#F8FAFC',  // Background muito claro
  100: '#F1F5F9', // Background claro
  200: '#E2E8F0', // Bordas sutis
  300: '#CBD5E1', // Bordas padrão
  400: '#94A3B8', // Texto desabilitado
  500: '#64748B', // Texto terciário
  600: '#475569', // Texto secundário
  700: '#334155', // Ícones
  800: '#1E293B', //
  900: '#0F172A', // Texto principal
}
```

### Backgrounds

```typescript
background: {
  default: '#F8FAFC',    // Background principal do app
  paper: '#FFFFFF',       // Background de cards/modals
  secondary: '#F1F5F9',   // Background alternativo
  dark: '#0F172A',        // Background escuro
}
```

### Textos

```typescript
text: {
  primary: '#0F172A',     // Texto principal
  secondary: '#475569',   // Texto secundário
  tertiary: '#94A3B8',    // Texto de menor importância
  disabled: '#CBD5E1',    // Texto desabilitado
  white: '#FFFFFF',       // Texto em fundos escuros
  inverse: '#F8FAFC',     // Texto inverso
}
```

### Bordas

```typescript
border: {
  light: '#E2E8F0',  // Bordas sutis
  main: '#CBD5E1',   // Bordas padrão
  dark: '#94A3B8',   // Bordas destacadas
}
```

## 📐 Tipografia

### Família de Fontes
Utilizamos a fonte do sistema para melhor performance e aparência nativa.

```typescript
fontFamily: {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
}
```

### Escala de Tamanhos

```typescript
fontSize: {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 17,
  xl: 19,
  '2xl': 22,
  '3xl': 28,
  '4xl': 34,
  '5xl': 42,
}
```

### Pesos de Fonte

```typescript
fontWeight: {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
}
```

### Estilos de Headings

```typescript
h1: { fontSize: 34, fontWeight: '700', lineHeight: 1.2, letterSpacing: -0.5 }
h2: { fontSize: 28, fontWeight: '700', lineHeight: 1.25, letterSpacing: -0.3 }
h3: { fontSize: 22, fontWeight: '600', lineHeight: 1.3, letterSpacing: -0.2 }
h4: { fontSize: 19, fontWeight: '600', lineHeight: 1.35 }
h5: { fontSize: 17, fontWeight: '600', lineHeight: 1.4 }
```

### Estilos de Corpo

```typescript
body: { fontSize: 15, fontWeight: '400', lineHeight: 1.5 }
bodyLarge: { fontSize: 17, fontWeight: '400', lineHeight: 1.5 }
bodySmall: { fontSize: 13, fontWeight: '400', lineHeight: 1.4 }
```

### Estilos de Botões

```typescript
button: { fontSize: 15, fontWeight: '600', lineHeight: 1.2, letterSpacing: 0.3 }
buttonLarge: { fontSize: 17, fontWeight: '600', lineHeight: 1.2, letterSpacing: 0.3 }
buttonSmall: { fontSize: 13, fontWeight: '600', lineHeight: 1.2, letterSpacing: 0.2 }
```

## 📏 Espaçamento

Sistema de espaçamento baseado em múltiplos de 4px:

```typescript
spacing: {
  '0': 0,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
  '20': 80,

  // Aliases semânticos
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
}
```

## 🔄 Border Radius

```typescript
borderRadius: {
  none: 0,
  xs: 4,
  sm: 6,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
}
```

## 🌑 Sombras

Sombras sutis e refinadas para iOS e Android:

```typescript
shadows: {
  none: { elevation: 0 }
  xs: { elevation: 1, shadowOpacity: 0.05, shadowRadius: 2 }
  sm: { elevation: 2, shadowOpacity: 0.08, shadowRadius: 3 }
  base: { elevation: 3, shadowOpacity: 0.1, shadowRadius: 6 }
  md: { elevation: 5, shadowOpacity: 0.12, shadowRadius: 8 }
  lg: { elevation: 8, shadowOpacity: 0.15, shadowRadius: 15 }
  xl: { elevation: 12, shadowOpacity: 0.18, shadowRadius: 20 }
}
```

## 🎯 Componentes

### Button

Variantes:
- `primary`: Azul (#1E6FDB) - Ações principais
- `secondary`: Verde (#16A34A) - Ações secundárias
- `outline`: Transparente com borda azul - Ações terciárias
- `danger`: Vermelho (#EF4444) - Ações destrutivas

Tamanhos:
- `sm`: minHeight 38px - Botões compactos
- `md`: minHeight 48px - Botões padrão
- `lg`: minHeight 56px - Botões de destaque

### Card

- Background: `#FFFFFF`
- Border Radius: `lg` (16px)
- Border: `1px` solid `#E2E8F0`
- Shadow: `base` por padrão

### TextInput

- Background: `#FFFFFF`
- Border: `1.5px` solid `#CBD5E1`
- Border Radius: `md` (12px)
- Min Height: `56px`
- Padding Horizontal: `16px`

Estados:
- Error: Border `#EF4444`, Background `#FCA5A510`
- Disabled: Background `#F1F5F9`, Opacity `0.6`

## 📱 Uso Prático

### Importação

```typescript
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
```

### Exemplo de Estilo

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
    padding: spacing['4'],
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing['3'],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing['5'],
    ...shadows.md,
  },
  button: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.md,
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['6'],
  },
});
```

## 🎨 Princípios de Design

1. **Consistência**: Use sempre as mesmas cores, espaçamentos e tipografias
2. **Hierarquia Visual**: Use tamanhos de fonte e pesos para criar hierarquia clara
3. **Espaçamento Generoso**: Dê espaço aos elementos, use pelo menos `spacing['4']`
4. **Sombras Sutis**: Prefira sombras suaves (`sm`, `base`) a sombras muito fortes
5. **Contraste Adequado**: Garanta contraste mínimo de 4.5:1 para texto
6. **Feedback Visual**: Forneça feedback claro em interações (hover, press, disabled)
7. **Acessibilidade**: Sempre use labels, hints e estados de acessibilidade

## 🔄 Migração

Ao atualizar componentes existentes:

1. Substitua cores hardcoded por `colors.*`
2. Use `spacing['X']` em vez de números diretos
3. Aplique `borderRadius.*` consistentemente
4. Use `typography.*` para estilos de texto
5. Adicione `shadows.*` para elevação
6. Teste em diferentes tamanhos de tela e com acessibilidade
