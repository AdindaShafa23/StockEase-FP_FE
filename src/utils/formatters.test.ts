import { describe, it, expect } from 'vitest'
import { formatRupiah } from './formatters'

describe('formatRupiah', () => {
  it('memformat angka ke format Rupiah Indonesia (pemisah ribuan titik)', () => {
    const out = formatRupiah(2000)
    expect(out).toMatch(/Rp/)
    expect(out).toContain('2.000')
  })

  it('tidak menampilkan desimal', () => {
    expect(formatRupiah(15000)).toContain('15.000')
    expect(formatRupiah(15000)).not.toContain(',00')
  })

  it('menangani nilai nol', () => {
    expect(formatRupiah(0)).toContain('0')
  })
})
