import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImageBuffer(
  buffer: Buffer,
  productId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `glowguide/products/${productId}`,
        public_id: productId,
        overwrite: true,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

export async function uploadImageFile(
  filePath: string,
  productId: string
): Promise<string> {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: `glowguide/products/${productId}`,
    public_id: productId,
    overwrite: true,
    resource_type: "image",
  });
  return result.secure_url;
}

export async function deleteImage(productId: string): Promise<void> {
  await cloudinary.uploader.destroy(`glowguide/products/${productId}/${productId}`);
}
