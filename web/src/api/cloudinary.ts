// src/api/cloudinary.ts
import axios from "axios";

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * Get signed Cloudinary info from backend
 */
export async function getCloudinarySignature(subfolder = "uploads"): Promise<CloudinarySignature> {
  const res = await axios.get("/api/v3/cloudinary/signature", { params: { subfolder } });
  return res.data.data;
}

/**
 * Uploads a file to Cloudinary using the proper resource_type
 */
export async function uploadToCloudinary(
  file: File,
  subfolder = "uploads",
  resourceType: "auto" | "image" | "raw" = "auto"
) {
  const sig = await getCloudinarySignature(subfolder);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.apiKey);
  formData.append("timestamp", sig.timestamp.toString());
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder);

  const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`;

  const cloudRes = await axios.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return cloudRes.data; // contains secure_url, public_id, etc.
}