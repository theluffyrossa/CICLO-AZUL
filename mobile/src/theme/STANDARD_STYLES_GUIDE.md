# Guia de Estilos Padronizados - Tipografia

Este guia explica como usar os estilos de tipografia padronizados do aplicativo para manter consistência visual e melhorar a acessibilidade.

## 📚 Importação

```typescript
import { standardStyles, combineStyles } from '@/theme';
// ou
import { standardStyles } from '@/theme/standardStyles';
```

## 🎨 Estilos Disponíveis

### 1. `fieldLabel` - Labels de Campos
**Uso:** Títulos acima de inputs, selects e outros campos de formulário

**Estilo:**
- fontSize: 32
- fontWeight: '700'
- color: colors.black
- textAlign: 'left'

**Exemplo:**
```typescript
<Text style={standardStyles.fieldLabel}>
  Data da Pesagem
  {required && <Text style={styles.required}> *</Text>}
</Text>
```

**Casos de uso:**
- ✅ Labels de formulários
- ✅ Títulos de campos em telas de detalhes
- ✅ Headers de informações importantes

---

### 2. `fieldValue` - Valores de Campos
**Uso:** Texto dentro de inputs e valores exibidos

**Estilo:**
- fontSize: 24
- fontWeight: '600'
- color: '#000000'

**Exemplo:**
```typescript
<TextInput
  style={standardStyles.fieldValue}
  value={nome}
  onChangeText={setNome}
/>

// Ou para exibir valores
<Text style={standardStyles.fieldValue}>
  {cliente.nome}
</Text>
```

**Casos de uso:**
- ✅ Texto digitado em inputs
- ✅ Valores em telas de detalhes
- ✅ Conteúdo de cards informativos

---

### 3. `titleEmoji` - Emojis de Título
**Uso:** Emojis que identificam visualmente o tipo de campo

**Estilo:**
- fontSize: 32
- textAlign: 'right'

**Exemplo:**
```typescript
<View style={styles.container}>
  <Text style={standardStyles.titleEmoji}>📅</Text>
  <Text style={standardStyles.fieldLabel}>Data da Pesagem</Text>
  {/* campo aqui */}
</View>
```

**Emojis recomendados:**
- 📅 Data/Calendário
- ⚖️ Peso/Balança
- 👤 Pessoa/Usuário
- 🏢 Empresa/Cliente
- 📍 Localização/Endereço
- ♻️ Reciclagem/Material
- 📷 Imagem/Foto
- 📊 Gráfico/Estatística

---

### 4. `selectEmoji` - Emojis em Selects
**Uso:** Emojis dentro de componentes Select

**Estilo:**
- fontSize: 28

**Exemplo:**
```typescript
<Text style={standardStyles.selectEmoji}>♻️ </Text>
<Text>Plástico</Text>
```

**Casos de uso:**
- ✅ Opções de select com categorias
- ✅ Listas com ícones visuais
- ✅ Menus com identificadores

---

### 5. `sectionTitle` - Títulos de Seções
**Uso:** Títulos que dividem diferentes seções da tela

**Estilo:**
- fontSize: 32
- fontWeight: '700'
- color: colors.black

**Exemplo:**
```typescript
<Text style={standardStyles.sectionTitle}>
  Resumo Geral
</Text>
```

**Casos de uso:**
- ✅ Headers de seções
- ✅ Divisores de conteúdo
- ✅ Títulos de cards agrupados

---

### 6. `secondaryText` - Texto Secundário
**Uso:** Informações complementares, descrições

**Estilo:**
- fontSize: 24
- fontWeight: '500'
- color: colors.neutral[700]

**Exemplo:**
```typescript
<Text style={standardStyles.secondaryText}>
  Última atualização: {dataFormatada}
</Text>
```

---

### 7. `highlightText` - Texto de Destaque
**Uso:** Números, métricas, valores importantes

**Estilo:**
- fontSize: 24
- fontWeight: '700'
- color: colors.primary[600]

**Exemplo:**
```typescript
<Text style={standardStyles.highlightText}>
  1,250 kg
</Text>
```

---

### 8. `buttonText` - Texto de Botões
**Uso:** Texto dentro de botões de ação

**Estilo:**
- fontSize: 24
- fontWeight: '600'
- color: colors.primary[600]

**Exemplo:**
```typescript
<TouchableOpacity style={styles.button}>
  <Text style={standardStyles.buttonText}>
    Adicionar Dados
  </Text>
</TouchableOpacity>
```

---

## 🔧 Função Helper: `combineStyles`

Use `combineStyles` quando precisar do estilo padrão + customizações:

```typescript
// Exemplo 1: Label com cor customizada
const customLabelStyle = combineStyles(
  standardStyles.fieldLabel,
  { color: 'red' }
);

// Exemplo 2: Valor com alinhamento diferente
const centeredValueStyle = combineStyles(
  standardStyles.fieldValue,
  { textAlign: 'center' }
);

// Uso no componente
<Text style={customLabelStyle}>
  Campo Especial
</Text>
```

---

## ✨ Exemplos Completos

### Exemplo 1: Formulário com Labels e Emojis

```typescript
import { standardStyles } from '@/theme';

const MeuFormulario = () => {
  return (
    <View>
      {/* Campo de Data */}
      <View style={styles.fieldContainer}>
        <Text style={standardStyles.titleEmoji}>📅</Text>
        <Text style={standardStyles.fieldLabel}>
          Data da Coleta
          <Text style={styles.required}> *</Text>
        </Text>
        <DateTimePickerInput
          value={data}
          onChange={setData}
        />
      </View>

      {/* Campo de Peso */}
      <View style={styles.fieldContainer}>
        <Text style={standardStyles.titleEmoji}>⚖️</Text>
        <Text style={standardStyles.fieldLabel}>Peso (kg)</Text>
        <NumericInput
          value={peso}
          onChangeText={setPeso}
        />
      </View>
    </View>
  );
};
```

### Exemplo 2: Tela de Detalhes

```typescript
import { standardStyles } from '@/theme';

const DetalhesScreen = () => {
  return (
    <ScrollView>
      <Text style={standardStyles.sectionTitle}>
        Informações da Coleta
      </Text>

      <Card>
        <Text style={standardStyles.fieldLabel}>Cliente</Text>
        <Text style={standardStyles.fieldValue}>
          {coleta.cliente.nome}
        </Text>

        <Text style={standardStyles.fieldLabel}>Peso Total</Text>
        <Text style={standardStyles.highlightText}>
          {coleta.pesoTotal} kg
        </Text>

        <Text style={standardStyles.secondaryText}>
          Coletado em {formatarData(coleta.data)}
        </Text>
      </Card>
    </ScrollView>
  );
};
```

### Exemplo 3: Dashboard com Estatísticas

```typescript
import { standardStyles } from '@/theme';

const Dashboard = () => {
  return (
    <View>
      <Text style={standardStyles.sectionTitle}>
        📊 Resumo do Mês
      </Text>

      <Card>
        <Text style={standardStyles.fieldLabel}>Total Coletado</Text>
        <Text style={standardStyles.highlightText}>
          {totalColetado} kg
        </Text>

        <Text style={standardStyles.secondaryText}>
          {numeroColetas} coletas realizadas
        </Text>
      </Card>
    </View>
  );
};
```

---

## 📋 Checklist de Migração

Ao atualizar uma tela existente para usar os estilos padronizados:

- [ ] Substituir estilos de labels por `standardStyles.fieldLabel`
- [ ] Substituir estilos de valores por `standardStyles.fieldValue`
- [ ] Adicionar emojis usando `standardStyles.titleEmoji`
- [ ] Atualizar títulos de seções para `standardStyles.sectionTitle`
- [ ] Verificar acessibilidade (fontSize adequado)
- [ ] Testar em diferentes tamanhos de tela
- [ ] Validar contraste de cores

---

## 🎯 Benefícios

✅ **Consistência visual** - Todo o app usa os mesmos tamanhos e cores
✅ **Manutenção fácil** - Mudar em um lugar afeta todo o app
✅ **Acessibilidade** - Tamanhos de fonte adequados para leitura
✅ **Produtividade** - Menos tempo decidindo estilos
✅ **Código limpo** - Menos duplicação de código

---

## 🚨 Quando NÃO usar

- ❌ **Casos muito específicos** que precisam quebrar o padrão por motivos de design
- ❌ **Componentes de terceiros** que já têm seus próprios estilos
- ❌ **Protótipos rápidos** onde você ainda está experimentando

Nesses casos, use estilos inline ou crie estilos locais, mas sempre considere se faz sentido adicionar um novo padrão ao `standardStyles.ts`.

---

## 📞 Suporte

Se você precisar de um novo estilo padrão que não existe, considere:
1. Verificar se algum estilo existente pode ser adaptado
2. Propor a adição ao arquivo `standardStyles.ts`
3. Documentar o novo estilo neste guia

---

**Última atualização:** 2025-11-04
