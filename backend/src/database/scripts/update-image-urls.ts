import { Image } from '../models';
import { Op } from 'sequelize';

const PUBLIC_URL = process.env.S3_PUBLIC_URL || 'https://ciclo-azul-img-coletas.s3.us-east-2.amazonaws.com';

async function updateImageUrls(): Promise<void> {
  console.log('🔄 Atualizando URLs de imagens no banco de dados...\n');

  try {
    const images = await Image.findAll({
      where: {
        url: {
          [Op.or]: [
            { [Op.like]: 'http://localhost:%' },
            { [Op.like]: '/uploads/%' },
          ],
        },
      },
    });

    console.log(`📊 Total de imagens para atualizar: ${images.length}\n`);

    if (images.length === 0) {
      console.log('✅ Nenhuma imagem precisa ser atualizada.');
      return;
    }

    let updated = 0;

    for (const image of images) {
      try {
        const oldUrl = image.url;
        const storageKey = image.storageKey || extractKeyFromUrl(oldUrl);

        if (!storageKey) {
          console.log(`⚠️  Não foi possível extrair storage key de: ${oldUrl}`);
          continue;
        }

        const newUrl = `${PUBLIC_URL}/${storageKey}`;

        let newUrlMedium = image.urlMedium;
        let newUrlSmall = image.urlSmall;
        let newUrlThumbnail = image.urlThumbnail;

        if (image.urlMedium && !image.urlMedium.startsWith('https://')) {
          const mediumKey = extractKeyFromUrl(image.urlMedium);
          if (mediumKey) newUrlMedium = `${PUBLIC_URL}/${mediumKey}`;
        }

        if (image.urlSmall && !image.urlSmall.startsWith('https://')) {
          const smallKey = extractKeyFromUrl(image.urlSmall);
          if (smallKey) newUrlSmall = `${PUBLIC_URL}/${smallKey}`;
        }

        if (image.urlThumbnail && !image.urlThumbnail.startsWith('https://')) {
          const thumbnailKey = extractKeyFromUrl(image.urlThumbnail);
          if (thumbnailKey) newUrlThumbnail = `${PUBLIC_URL}/${thumbnailKey}`;
        }

        await image.update({
          url: newUrl,
          urlMedium: newUrlMedium,
          urlSmall: newUrlSmall,
          urlThumbnail: newUrlThumbnail,
          storageKey,
        });

        console.log(`✅ Atualizada imagem ID ${image.id}:`);
        console.log(`   Antiga: ${oldUrl}`);
        console.log(`   Nova: ${newUrl}`);
        updated++;
      } catch (error) {
        console.error(`❌ Erro ao atualizar imagem ID ${image.id}:`, error);
      }
    }

    console.log(`\n✨ Atualização concluída!`);
    console.log(`📊 Total atualizado: ${updated}/${images.length}`);
  } catch (error) {
    console.error('❌ Erro na atualização:', error);
    throw error;
  }
}

function extractKeyFromUrl(url: string): string | null {
  try {
    const match = url.match(/images\/[^?]+/);
    return match ? match[0] : null;
  } catch {
    return null;
  }
}

async function main() {
  try {
    await updateImageUrls();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { updateImageUrls };
