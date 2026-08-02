// Canonical Cloudinary upload service — the single implementation every
// upload flow in the app should call through (Media Library, Projects
// gallery/PDF fields, and the legacy careers/suppliers document uploads,
// which pass their own preset/resourceType to preserve exact prior behavior).
const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const MEDIA_PRESET  = process.env.NEXT_PUBLIC_CLOUDINARY_MEDIA_PRESET;

function detectResourceType(file) {
  if (file.type?.startsWith("image/")) return "image";
  if (file.type?.startsWith("video/")) return "video";
  // Cloudinary serves PDFs under the "image" resource type (enables page
  // thumbnails/transformations); anything else falls back to "raw".
  if (file.type === "application/pdf") return "image";
  return "raw";
}

export function validateFile(file, { maxSizeMB = 15, acceptedExt } = {}) {
  if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) return "too_large";
  if (acceptedExt?.length) {
    const lower = file.name.toLowerCase();
    if (!acceptedExt.some((ext) => lower.endsWith(ext))) return "invalid_type";
  }
  return null;
}

export async function uploadAsset(file, opts = {}) {
  const {
    folder,
    resourceType = detectResourceType(file),
    cloudName = CLOUD_NAME,
    preset = MEDIA_PRESET,
  } = opts;

  if (!cloudName) throw new Error("Cloudinary cloud name not configured");
  if (!preset) throw new Error("Cloudinary upload preset not configured");

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);
  if (folder) fd.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Cloudinary error ${res.status}`);
  }
  const data = await res.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width || null,
    height: data.height || null,
    format: data.format,
    bytes: data.bytes,
    originalFilename: file.name,
    resourceType,
  };
}
