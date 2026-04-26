import { describe, it, expect } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('converts ASCII title to kebab-case', () => {
    expect(slugify('Toan Lop 7')).toBe('toan-lop-7')
  })

  it('removes Vietnamese diacritics', () => {
    expect(slugify('Toán Lớp 7 Nâng Cao')).toBe('toan-lop-7-nang-cao')
  })

  it('handles đ and Đ correctly', () => {
    expect(slugify('Đại số cơ bản')).toBe('dai-so-co-ban')
  })

  it('collapses multiple spaces and special chars to single dash', () => {
    expect(slugify('Ôn  thi   chuyên!')).toBe('on-thi-chuyen')
  })

  it('trims leading and trailing dashes', () => {
    expect(slugify('  Lớp 9  ')).toBe('lop-9')
  })

  it('returns "untitled" for empty or whitespace-only input', () => {
    expect(slugify('')).toBe('untitled')
    expect(slugify('   ')).toBe('untitled')
  })

  it('lowercases everything', () => {
    expect(slugify('TOÁN HỌC')).toBe('toan-hoc')
  })
})
