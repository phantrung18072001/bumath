const VN_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[6-9]|7[06-9]|8[0-9]|9[0-9])[0-9]{7}$/;

export function isValidVnPhone(phone: string): boolean {
  return VN_PHONE_REGEX.test(phone);
}

/**
 * Convert Vietnamese local phone (0xxx) to E.164 format (+84xxx).
 * If already in +84 format, returns as-is.
 * Strips all spaces, dots, dashes before converting.
 */
export function toE164(phone: string): string {
  const cleaned = phone.replace(/[\s.\-()]/g, '')
  if (cleaned.startsWith('+84')) return cleaned
  if (cleaned.startsWith('0')) return '+84' + cleaned.slice(1)
  return cleaned
}
export function phoneToEmail(phone: string): string {
  return `${toE164(phone)}@bumath.local`
}
