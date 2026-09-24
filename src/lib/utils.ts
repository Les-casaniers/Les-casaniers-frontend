import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PLACEHOLDER_IMAGE = "/placeholder-pc.jpg";

function getApiOrigin(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined) || "http://127.0.0.1:8000";
  return raw.replace(/\/api\/?$/, "").replace(/\/+$/, "");
}

export function resolveImageUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== "string" || rawUrl.trim() === "") {
    return PLACEHOLDER_IMAGE;
  }
  if (rawUrl.startsWith("data:image")) {
    return rawUrl;
  }
  let path = rawUrl.trim();
  if (/^https?:\/\//i.test(path)) {
    try {
      path = new URL(path).pathname;
    } catch {
      // on garde path tel quel
    }
  }
  if (!path.includes("/")) {
    path = `/image/${path}`;
  }
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  return `${getApiOrigin()}${path}`;
}

interface ProduitImageLike {
  url?: string | null;
  path?: string | null;
  filename?: string | null;
  ordre?: number | null;
}

interface ProduitLike {
  images?: ProduitImageLike[] | null;
  image?: string | null;
  image_url?: string | null;
  photo?: string | null;
}

export function getProductImageUrl(produit?: ProduitLike | null): string {
  if (!produit) return PLACEHOLDER_IMAGE;

  const images = produit.images;
  let raw: string | null | undefined;

  if (Array.isArray(images) && images.length > 0) {
    const mainImage = images.find((img) => img?.ordre === 0) ?? images[0];
    raw = mainImage?.url ?? mainImage?.path ?? mainImage?.filename;
  }

  if (!raw) raw = produit.image;
  if (!raw) raw = produit.image_url;
  if (!raw) raw = produit.photo;

  return resolveImageUrl(raw);
}