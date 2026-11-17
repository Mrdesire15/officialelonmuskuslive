import type React from 'react';

export const FALLBACK_ELON_PHOTO = '/assets/aistudio/elonxx0_53270167.jpg';

export function normalizePhotoSrc(src?: string | null): string {
  if (!src || !src.trim()) {
    return FALLBACK_ELON_PHOTO;
  }
  const trimmed = src.trim();
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }
  return `/${trimmed.replace(/^\.\//, '')}`;
}

export function handleImageFallback(
  e: React.SyntheticEvent<HTMLImageElement>,
  fallbackSrc: string = FALLBACK_ELON_PHOTO
): void {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied === 'true') {
    return;
  }
  img.dataset.fallbackApplied = 'true';
  img.src = fallbackSrc;
}
