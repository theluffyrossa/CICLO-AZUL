# Configuração de Storage para Evidências Fotográficas

Este documento descreve como configurar o sistema de armazenamento de imagens (evidências fotográficas) para o projeto CICLO AZUL.

## Visão Geral

O sistema suporta dois modos de armazenamento:

1. **Local Storage** - Para desenvolvimento e testes
2. **S3-Compatible Storage** - Para produção (Cloudflare R2, MinIO, DigitalOcean Spaces, Backblaze B2, etc.)

## Funcionalidades Implementadas

### Backend

- ✅ Upload de imagens com processamento automático
- ✅ Geração de thumbnails (3 tamanhos: 200px, 400px, 800px)
- ✅ Watermark com data/hora e coordenadas GPS
- ✅ Validação de dimensões mínimas (640x480px)
- ✅ Compressão JPEG com qualidade configurável
- ✅ Suporte a storage local e S3-compatible
- ✅ Metadados EXIF preservados
- ✅ Conformidade LGPD

### Mobile

- ✅ Captura de foto com câmera
- ✅ Seleção de foto da galeria
- ✅ Compressão automática antes do upload
- ✅ Captura automática de GPS e metadados do dispositivo
- ✅ Retry automático com exponential backoff (3 tentativas)
- ✅ Modo offline com sincronização
- ✅ Feedback visual de progresso e retry

---

## Configuração - Local Storage (Desenvolvimento)

### 1. Variáveis de Ambiente

No arquivo `backend/.env`:

```bash
# Storage Provider
STORAGE_PROVIDER=local

# Upload Configuration
UPLOAD_DIR=./uploads
UPLOAD_TEMP_DIR=./uploads/temp
MAX_FILE_SIZE=10485760

# Image Processing
IMAGE_QUALITY=80
IMAGE_MAX_WIDTH=1920
IMAGE_MAX_HEIGHT=1080
MIN_IMAGE_WIDTH=640
MIN_IMAGE_HEIGHT=480

# Thumbnails
ENABLE_THUMBNAILS=true
THUMBNAIL_SIZE_SMALL=200
THUMBNAIL_SIZE_MEDIUM=400
THUMBNAIL_SIZE_LARGE=800

# Watermark
ENABLE_WATERMARK=true
WATERMARK_TEXT=CICLO AZUL
```

### 2. Criar Diretórios

```bash
cd backend
mkdir -p uploads/temp uploads/images
chmod 755 uploads
```

### 3. Servir Arquivos Estáticos

O Express já está configurado para servir arquivos da pasta `uploads`:

```typescript
// backend/src/server.ts
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

---

## Configuração - Cloudflare R2 (Produção Recomendada)

### Por que Cloudflare R2?

- ✅ **Custo Zero** para tráfego de saída (egress)
- ✅ **Compatível com S3** - usa o mesmo SDK
- ✅ **Performance global** via CDN da Cloudflare
- ✅ **Preço competitivo** - $0.015/GB/mês
- ✅ **Sem taxa de transferência** entre R2 e Workers

### 1. Criar Bucket no Cloudflare R2

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Vá em **R2** → **Create Bucket**
3. Nome: `ciclo-azul-images`
4. Região: **Automatic** (replicação global)
5. Clique em **Create Bucket**

### 2. Configurar Política de Bucket para Acesso Público

**IMPORTANTE**: O código foi atualizado para NÃO usar ACLs (Access Control Lists), pois muitos buckets S3 modernos bloqueiam ACLs por padrão. Em vez disso, use políticas de bucket.

**Opção A: Política de Bucket Pública (Recomendado)**

1. No bucket R2, vá em **Settings** → **Bucket Policy**
2. Adicione a seguinte política JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ciclo-azul-images/*"
    }
  ]
}
```

3. Salve a política

**Opção B: Domain Público com Cloudflare**

1. No bucket, vá em **Settings** → **Public Access**
2. Clique em **Connect Domain**
3. Adicione um domínio/subdomínio: `images.cicloazul.com.br`
4. Configure DNS conforme instruções
5. Isso permite acesso público via domínio customizado

**Opção C: Presigned URLs (Mais Seguro - Acesso Privado)**

- Não configura acesso público no bucket
- URLs geradas temporariamente pelo backend
- Expiração configurável (padrão: 1 ano)
- Mais seguro, mas URLs são longas e temporárias

### 3. Criar API Token

1. Vá em **R2** → **Manage R2 API Tokens**
2. Clique em **Create API Token**
3. Configure:
   - **Token name**: `ciclo-azul-backend`
   - **Permissions**: `Object Read & Write`
   - **TTL**: `Forever` ou personalizado
   - **Specific Bucket**: `ciclo-azul-images`
4. Copie as credenciais geradas:
   - `Access Key ID`
   - `Secret Access Key`

### 4. Obter Account ID e Endpoint

```
Account ID: Encontrado no dashboard da Cloudflare (canto superior direito)
Endpoint: https://<account-id>.r2.cloudflarestorage.com
```

### 5. Variáveis de Ambiente

No arquivo `backend/.env`:

```bash
# Storage Provider
STORAGE_PROVIDER=r2

# S3-Compatible Storage (Cloudflare R2)
S3_ENDPOINT=https://<your-account-id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=<your-access-key-id>
S3_SECRET_ACCESS_KEY=<your-secret-access-key>
S3_BUCKET=ciclo-azul-images

# URL pública (se configurou domínio customizado)
S3_PUBLIC_URL=https://images.cicloazul.com.br
# OU (se não tem domínio, use o endpoint)
# S3_PUBLIC_URL=https://<your-account-id>.r2.cloudflarestorage.com

# Image Processing (mesmo do local)
IMAGE_QUALITY=80
IMAGE_MAX_WIDTH=1920
IMAGE_MAX_HEIGHT=1080
MIN_IMAGE_WIDTH=640
MIN_IMAGE_HEIGHT=480

# Thumbnails
ENABLE_THUMBNAILS=true
THUMBNAIL_SIZE_SMALL=200
THUMBNAIL_SIZE_MEDIUM=400
THUMBNAIL_SIZE_LARGE=800

# Watermark
ENABLE_WATERMARK=true
WATERMARK_TEXT=CICLO AZUL
```

### 6. Testar Conexão

```bash
cd backend
npm run dev
```

Faça upload de uma imagem via API e verifique se aparece no bucket R2.

---

## Configuração - MinIO (Self-Hosted)

### Por que MinIO?

- ✅ **Open Source** e gratuito
- ✅ **Self-hosted** - controle total
- ✅ **S3-Compatible**
- ✅ **Alta performance**
- ✅ **Ideal para on-premises**

### 1. Instalar MinIO via Docker

```bash
# docker-compose.yml
version: '3.8'
services:
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: your-secure-password
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"

volumes:
  minio-data:
```

```bash
docker-compose up -d
```

### 2. Criar Bucket e Configurar Política

1. Acesse console: `http://localhost:9001`
2. Login: `admin` / `your-secure-password`
3. Create Bucket: `ciclo-azul-images`
4. **Configurar Política de Acesso Público**:
   - Vá em **Buckets** → `ciclo-azul-images` → **Access Policy**
   - Selecione **Custom Policy**
   - Cole a política JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::ciclo-azul-images/*"]
    }
  ]
}
```

   - Salve a política
   - **NÃO use ACLs** - o código foi atualizado para não depender delas

### 3. Criar Access Key

1. **Identity** → **Service Accounts** → **Create Service Account**
2. Copie `Access Key` e `Secret Key`

### 4. Variáveis de Ambiente

```bash
STORAGE_PROVIDER=minio

S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=<your-access-key>
S3_SECRET_ACCESS_KEY=<your-secret-key>
S3_BUCKET=ciclo-azul-images
S3_PUBLIC_URL=http://localhost:9000

# Image Processing
IMAGE_QUALITY=80
IMAGE_MAX_WIDTH=1920
IMAGE_MAX_HEIGHT=1080
MIN_IMAGE_WIDTH=640
MIN_IMAGE_HEIGHT=480

ENABLE_THUMBNAILS=true
THUMBNAIL_SIZE_SMALL=200
THUMBNAIL_SIZE_MEDIUM=400
THUMBNAIL_SIZE_LARGE=800

ENABLE_WATERMARK=true
WATERMARK_TEXT=CICLO AZUL
```

---

## Configuração - DigitalOcean Spaces

### 1. Criar Space

1. Acesse [DigitalOcean Cloud](https://cloud.digitalocean.com/spaces)
2. **Create** → **Spaces**
3. Nome: `ciclo-azul-images`
4. Região: Escolha mais próxima (ex: `nyc3`)
5. CDN: **Enable** (opcional, melhora performance)

### 2. Criar API Key

1. **API** → **Tokens/Keys** → **Generate New Key**
2. Tipo: **Spaces access keys**
3. Copie `Access Key` e `Secret Key`

### 3. Variáveis de Ambiente

```bash
STORAGE_PROVIDER=spaces

S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
S3_REGION=nyc3
S3_ACCESS_KEY_ID=<your-access-key>
S3_SECRET_ACCESS_KEY=<your-secret-key>
S3_BUCKET=ciclo-azul-images
S3_PUBLIC_URL=https://ciclo-azul-images.nyc3.digitaloceanspaces.com

# Ou com CDN habilitado:
# S3_PUBLIC_URL=https://ciclo-azul-images.nyc3.cdn.digitaloceanspaces.com

# Image Processing
IMAGE_QUALITY=80
IMAGE_MAX_WIDTH=1920
IMAGE_MAX_HEIGHT=1080
MIN_IMAGE_WIDTH=640
MIN_IMAGE_HEIGHT=480

ENABLE_THUMBNAILS=true
ENABLE_WATERMARK=true
WATERMARK_TEXT=CICLO AZUL
```

---

## Migração de Local para S3

### 1. Backup Local

```bash
cd backend
tar -czf uploads-backup.tar.gz uploads/
```

### 2. Upload para S3

```bash
# Usando AWS CLI (funciona com S3-compatible)
aws s3 sync ./uploads/images s3://ciclo-azul-images/images/ \
  --endpoint-url https://<your-endpoint> \
  --profile ciclo-azul
```

### 3. Atualizar URLs no Banco

```sql
-- Exemplo de script de migração
UPDATE images
SET
  url = REPLACE(url, '/uploads/', 'https://your-cdn.com/'),
  storage_key = REPLACE(url, '/uploads/', '');
```

---

## Validações e Limites

### Dimensões

- **Mínimo**: 640x480px (validado antes do upload)
- **Máximo Original**: 1920x1080px (redimensionado automaticamente)
- **Thumbnails**:
  - Small: 200px
  - Medium: 400px
  - Large: 800px

### Tamanho de Arquivo

- **Máximo**: 10MB (configurável via `MAX_FILE_SIZE`)
- **Compressão Mobile**: Automática antes do upload (80% qualidade)
- **Compressão Backend**: Sharp JPEG 80% qualidade

### Formatos Aceitos

- JPEG
- PNG (convertido para JPEG no processamento)
- JPG

---

## Watermark

O watermark é adicionado automaticamente e contém:

- **Texto**: Nome do projeto (configurável)
- **Data/Hora**: Timestamp de captura
- **GPS**: Coordenadas latitude/longitude

Exemplo:
```
CICLO AZUL
12/01/2025 14:30:45
GPS: -23.550520, -46.633308
```

Posição: **Canto inferior direito** com fundo semi-transparente

---

## Retry Logic

### Mobile

- **Tentativas**: 3
- **Delay inicial**: 2 segundos
- **Delay máximo**: 15 segundos
- **Estratégia**: Exponential backoff (2x)

### Backend

Implementado no service, mas pode ser desabilitado se necessário.

---

## Monitoramento

### Logs Úteis

```typescript
// Backend
console.log('Image uploaded:', {
  id: image.id,
  size: image.fileSize,
  dimensions: `${image.width}x${image.height}`,
  storageKey: image.storageKey,
  thumbnails: !!image.urlThumbnail
});

// Mobile
console.log('Upload retry attempt', attempt, error);
```

### Métricas Recomendadas

- Taxa de sucesso de upload (%)
- Tempo médio de upload
- Tamanho médio de arquivo
- Total de storage usado
- Taxa de retry

---

## Troubleshooting

### Erro: "The bucket does not allow ACLs"

**Causa**: O bucket S3/R2 está configurado para bloquear ACLs (configuração moderna padrão)

**Solução**:
1. ✅ **CÓDIGO JÁ CORRIGIDO** - A versão atual NÃO tenta definir ACLs
2. Configure o bucket com política pública (ver seção "Configurar Política de Bucket")
3. Adicione a política JSON no bucket para permitir acesso público aos objetos

**Política JSON necessária**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::SEU-BUCKET-AQUI/*"
    }
  ]
}
```

### Erro: "Image dimensions too small"

**Causa**: Imagem menor que 640x480px

**Solução**: Ajuste `MIN_IMAGE_WIDTH` e `MIN_IMAGE_HEIGHT` ou use imagens maiores

### Erro: "Failed to upload to S3"

**Causa**: Credenciais inválidas ou bucket não existe

**Solução**:
1. Verifique `S3_ACCESS_KEY_ID` e `S3_SECRET_ACCESS_KEY`
2. Confirme que o bucket existe
3. Verifique permissões do token

### Erro: "Timeout on upload"

**Causa**: Arquivo muito grande ou conexão lenta

**Solução**:
1. Aumente `timeout` no `api.service.ts`
2. Reduza qualidade de compressão mobile
3. Use rede Wi-Fi

### Storage cheio

**Local Storage**: Limpar pasta `uploads/temp` regularmente

**S3 Storage**: Implementar lifecycle policy para deletar imagens antigas

---

## Custos Estimados (Produção)

### Cloudflare R2

- **Storage**: $0.015/GB/mês
- **Operações Classe A** (write): $4.50 por milhão
- **Operações Classe B** (read): $0.36 por milhão
- **Egress**: **GRÁTIS**

**Exemplo**: 10.000 fotos/mês (5MB média) = 50GB

- Storage: 50GB × $0.015 = **$0.75/mês**
- Uploads: 40.000 operações (original + 3 thumbs) = **$0.18/mês**
- **Total: ~$1/mês**

### DigitalOcean Spaces

- **Storage + 250GB transfer**: $5/mês fixo
- **Transfer adicional**: $0.01/GB

**Exemplo**: 50GB storage + 100GB transfer = **$5/mês**

### MinIO (Self-hosted)

- **Server**: Custo da infraestrutura
- **Storage**: Custo de disco
- **Sem custos de API**

---

## Próximos Passos (Opcional)

### 1. Detecção de Faces (LGPD)

Integrar com serviço de detecção de faces para alertar usuário:

```bash
npm install @google-cloud/vision
```

### 2. OCR para Extração de Dados

Ler automaticamente dados da balança:

```bash
npm install tesseract.js
```

### 3. Background Upload

Upload não bloqueante:

```bash
npx expo install expo-task-manager expo-background-fetch
```

### 4. Compressão Progressiva

Enviar thumbnail primeiro, depois imagem completa.

---

## Suporte

Para dúvidas ou problemas:

1. Verifique logs do backend: `backend/logs/app.log`
2. Verifique console do mobile
3. Consulte documentação do provedor S3

---

**Última atualização**: 12/01/2025
**Versão**: 1.0.0
