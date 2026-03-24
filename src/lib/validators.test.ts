import { isValidVnPhone, toE164 } from '@/lib/validators'

describe('toE164', () => {
  it('converts 0-prefix phone to +84 E.164 format', () => {
    expect(toE164('0912345678')).toBe('+84912345678')
  })

  it('returns +84 phone as-is (no double prefix)', () => {
    expect(toE164('+84912345678')).toBe('+84912345678')
  })

  it('strips spaces before converting', () => {
    expect(toE164('0912 345 678')).toBe('+84912345678')
  })

  it('strips dots before converting', () => {
    expect(toE164('0912.345.678')).toBe('+84912345678')
  })

  it('strips dashes before converting', () => {
    expect(toE164('0912-345-678')).toBe('+84912345678')
  })
})

describe('isValidVnPhone', () => {
  it('accepts valid Vietnamese phone starting with 0', () => {
    expect(isValidVnPhone('0912345678')).toBe(true)
  })

  it('accepts valid Vietnamese phone in +84 format', () => {
    expect(isValidVnPhone('+84912345678')).toBe(true)
  })

  it('rejects phone that does not start with 0 or +84', () => {
    expect(isValidVnPhone('1234567890')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidVnPhone('')).toBe(false)
  })

  it('rejects phone with invalid middle digits', () => {
    expect(isValidVnPhone('0112345678')).toBe(false)
  })
})
