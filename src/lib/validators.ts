const VN_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[6-9]|7[06-9]|8[0-9]|9[0-9])[0-9]{7}$/;

export function isValidVnPhone(phone: string): boolean {
  return VN_PHONE_REGEX.test(phone);
}
