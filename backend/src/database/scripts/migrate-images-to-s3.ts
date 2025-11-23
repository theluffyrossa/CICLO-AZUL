import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { connectDatabase } from '../connection';
import { Image } from '../models';

dotenv.config();

interface MigrationResult {
  success: number;
  failed: number;
  errors: Array<{ file: string; error: string }>;
}

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET || 'ciclo-azul-img-coletas';
const PUBLIC_URL = process.env.S3_PUBLIC_URL || `https://${BUCKET_NAME}.s3.us-east-2.amazonaws.com`;
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'images');

async function uploadFileToS3(filePath: string, fileName: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);
  const key = `images/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: 'image/jpeg',
  });

  await s3Client.send(command);
  return `${PUBLIC_URL}/${key}`;
}

async function migrateImages(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  console.log('🚀 Iniciando migração de imagens para S3...\n');
  console.log(`📁 Diretório: ${UPLOADS_DIR}`);
  console.log(`🪣 Bucket: ${BUCKET_NAME}`);
  console.log(`🌐 Public URL: ${PUBLIC_URL}\n`);

  await connectDatabase();

  try {
    const files = await fs.readdir(UPLOADS_DIR);
    console.log(`📊 Total de arquivos encontrados: ${files.length}\n`);

    for (const fileName of files) {
      if (!fileName.match(/\.(jpg|jpeg|png)$/i)) {
        console.log(`⏭️  Ignorando arquivo não-imagem: ${fileName}`);
        continue;
      }

      try {
        const filePath = path.join(UPLOADS_DIR, fileName);
        const stats = await fs.stat(filePath);

        if (!stats.isFile()) {
          continue;
        }

        console.log(`📤 Enviando: ${fileName} (${(stats.size / 1024).toFixed(2)} KB)`);

        const s3Url = await uploadFileToS3(filePath, fileName);

        console.log(`✅ Upload concluído: ${s3Url}`);

        const imageRecord = await Image.findOne({
          where: {
            storageKey: `images/${fileName}`,
          },
        });

        if (imageRecord) {
          const oldUrl = imageRecord.url;
          await imageRecord.update({ url: s3Url });
          console.log(`📝 URL atualizada no banco de dados`);
          console.log(`   Antiga: ${oldUrl}`);
          console.log(`   Nova: ${s3Url}`);
        } else {
          console.log(`⚠️  Registro não encontrado no banco para: ${fileName}`);
        }

        result.success++;
        console.log('');
      } catch (error) {
        result.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        result.errors.push({ file: fileName, error: errorMessage });
        console.error(`❌ Erro ao processar ${fileName}:`, errorMessage);
        console.log('');
      }
    }

    console.log('\n📊 RESUMO DA MIGRAÇÃO:');
    console.log(`✅ Sucesso: ${result.success}`);
    console.log(`❌ Falhas: ${result.failed}`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  ERROS:');
      result.errors.forEach(({ file, error }) => {
        console.log(`   - ${file}: ${error}`);
      });
    }

    console.log('\n✨ Migração concluída!');
  } catch (error) {
    console.error('❌ Erro fatal na migração:', error);
    throw error;
  }

  return result;
}

async function main() {
  try {
    if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
      throw new Error('Credenciais S3 não configuradas. Verifique o arquivo .env');
    }

    const dirExists = await fs
      .access(UPLOADS_DIR)
      .then(() => true)
      .catch(() => false);

    if (!dirExists) {
      console.log(`⚠️  Diretório ${UPLOADS_DIR} não encontrado. Nada para migrar.`);
      process.exit(0);
    }

    await migrateImages();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { migrateImages };
