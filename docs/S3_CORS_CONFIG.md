# Configuração CORS para S3 Bucket

## Bucket: ciclo-azul-img-coletas

### Passo a Passo

1. Acesse o AWS Console: https://console.aws.amazon.com/s3/
2. Selecione o bucket `ciclo-azul-img-coletas`
3. Vá em **Permissions** > **CORS configuration**
4. Adicione a configuração JSON abaixo

### Configuração CORS (JSON)

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag",
            "Content-Length",
            "Content-Type"
        ],
        "MaxAgeSeconds": 3600
    },
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "PUT",
            "POST"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://localhost:19006"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3600
    }
]
```

### Configurar Política de Bucket Pública (OBRIGATÓRIO)

**IMPORTANTE**: Este bucket tem ACLs desabilitados, então você DEVE usar Bucket Policy:

1. Vá em **Permissions** > **Block public access (bucket settings)**
2. Clique em **Edit**
3. Desmarque **Block all public access** (ou pelo menos desmarque as opções relacionadas a policies)
4. Salve as alterações
5. Em **Bucket Policy**, clique em **Edit** e adicione:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::ciclo-azul-img-coletas/images/*"
        }
    ]
}
```

6. Salve a política

### Verificar Configuração

Teste acessando diretamente uma URL:
```
https://ciclo-azul-img-coletas.s3.us-east-2.amazonaws.com/images/test.jpg
```

### Permissões IAM Necessárias

O usuário com as credenciais configuradas precisa ter:
- `s3:PutObject`
- `s3:GetObject`
- `s3:DeleteObject`
- `s3:ListBucket`

### Notas de Segurança

- AllowedOrigins com "*" permite acesso de qualquer origem (OK para imagens públicas)
- Para produção, considere restringir origens específicas do app
- Mantenha as credenciais AWS seguras e nunca commite no git
