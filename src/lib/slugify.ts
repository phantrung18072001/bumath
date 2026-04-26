/**
 * Converts a Vietnamese (or any) string to a URL-safe slug.
 * Example: "Toán Lớp 7 Nâng Cao" → "toan-lop-7-nang-cao"
 */
export function slugify(text: string): string {
  const result = text
    .replace(/[đĐ]/g, 'd')              // đ does not decompose in NFD
    .normalize('NFD')                   // decompose combined chars (e.g. ô → o + ^)
    .replace(/[\u0300-\u036f]/g, '')    // strip combining diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')        // collapse non-alphanumeric to dash
    .replace(/^-+|-+$/g, '')            // trim leading/trailing dashes

  return result || 'untitled'
}
