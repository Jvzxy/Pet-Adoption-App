import { supabase } from './supabaseClient';

function decodeBase64Image(base64: string): Uint8Array {
  const encoded = base64.replace(/^data:image\/[^;]+;base64,/, '').replace(/\s/g, '');
  if (!encoded || encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) {
    throw new Error('The image data from your photo picker is invalid. Select the photo again.');
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const padding = encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0;
  const bytes = new Uint8Array((encoded.length / 4) * 3 - padding);
  let accumulator = 0;
  let bitCount = 0;
  let byteIndex = 0;

  for (const character of encoded) {
    if (character === '=') break;
    const value = alphabet.indexOf(character);
    if (value < 0) throw new Error('The selected photo could not be decoded.');

    accumulator = (accumulator << 6) | value;
    bitCount += 6;
    if (bitCount >= 8) {
      bitCount -= 8;
      bytes[byteIndex] = (accumulator >> bitCount) & 0xff;
      byteIndex += 1;
      accumulator &= (1 << bitCount) - 1;
    }
  }

  if (byteIndex !== bytes.length) {
    throw new Error('The selected photo could not be decoded completely.');
  }
  return bytes;
}

export async function uploadCatalogImage(base64: string, userId: string): Promise<string> {
  const [imageUrl] = await uploadImagesToBucket([{ base64 }], userId, 'catalog-images');
  return imageUrl;
}

export interface ImageUpload {
  base64: string;
  mimeType?: string | null;
}

async function uploadImagesToBucket(
  images: ImageUpload[],
  userId: string,
  bucket: 'catalog-images' | 'profile-images',
): Promise<string[]> {
  if (images.length === 0) return [];

  return Promise.all(images.map(async ({ base64, mimeType }) => {
    const image = decodeBase64Image(base64);
    if (image.length === 0) throw new Error('The selected photo is empty. Choose another image.');

    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (mimeType && !supportedTypes.includes(mimeType)) {
      throw new Error('Choose a JPEG, PNG, or WebP image.');
    }
    const contentType = mimeType ?? 'image/jpeg';
    const extension = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, image, { contentType, upsert: false });

    if (error) throw error;

    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }));
}

export async function uploadCatalogImages(images: ImageUpload[], userId: string): Promise<string[]> {
  return uploadImagesToBucket(images, userId, 'catalog-images');
}

export async function uploadProfileImage(base64: string, userId: string, mimeType?: string | null): Promise<string> {
  const [imageUrl] = await uploadImagesToBucket([{ base64, mimeType }], userId, 'profile-images');
  return imageUrl;
}
