// Cloudinary direct upload utility for Client & Server

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  resourceType: "image" | "video" | "raw" | string;
}

/**
 * Uploads any file directly to Cloudinary using Unsigned Upload Preset.
 * Works seamlessly with images (png, jpg, webp), audio (mp3, wav, m4a), and documents (pdf).
 */
export async function uploadToCloudinary(
  file: File | Blob,
  options?: {
    folder?: string;
    fileName?: string;
    cloudName?: string;
    uploadPreset?: string;
  }
): Promise<CloudinaryUploadResult> {
  const cloudName =
    options?.cloudName ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "vf56y0nk";
  const uploadPreset =
    options?.uploadPreset ||
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
    "hsk_upload";

  if (!cloudName) {
    throw new Error("Missing Cloudinary Cloud Name");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  if (options?.folder) {
    formData.append("folder", options.folder);
  }

  // Use /auto/upload endpoint so Cloudinary automatically handles image, video/audio, and raw
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errMessage = "Upload to Cloudinary failed";
    try {
      const errData = await response.json();
      if (errData?.error?.message) {
        errMessage = errData.error.message;
      }
    } catch {}
    throw new Error(errMessage);
  }

  const data = await response.json();

  return {
    url: data.url,
    secureUrl: data.secure_url,
    publicId: data.public_id,
    format: data.format,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
    duration: data.duration,
    resourceType: data.resource_type,
  };
}
