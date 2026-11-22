import { describe, expect, it } from 'vitest'
import { MAX_VOUCHER_BYTES, validateVoucher } from './voucher'

function fileOfSize(bytes: number, name: string, type: string): File {
  return new File([new Uint8Array(bytes)], name, { type })
}

describe('validateVoucher', () => {
  it('V-20: imágenes png / jpg / jpeg son válidas', () => {
    expect(validateVoucher(fileOfSize(10, 'v.jpg', 'image/jpeg'))).toBeNull()
    expect(validateVoucher(fileOfSize(10, 'v.jpeg', 'image/jpeg'))).toBeNull()
    expect(validateVoucher(fileOfSize(10, 'v.png', 'image/png'))).toBeNull()
  })

  it('V-21: tipo no permitido o ausente → mensaje de error', () => {
    expect(validateVoucher(fileOfSize(10, 'v.pdf', 'application/pdf'))).toEqual(expect.any(String))
    expect(validateVoucher(fileOfSize(10, 'v.webp', 'image/webp'))).toEqual(expect.any(String))
    expect(validateVoucher(null)).toEqual(expect.any(String))
  })

  it('V-22: exactamente 5 MB es válido, 5 MB + 1 byte es error', () => {
    expect(MAX_VOUCHER_BYTES).toBe(5 * 1024 * 1024)
    expect(validateVoucher(fileOfSize(MAX_VOUCHER_BYTES, 'v.png', 'image/png'))).toBeNull()
    expect(validateVoucher(fileOfSize(MAX_VOUCHER_BYTES + 1, 'v.png', 'image/png'))).toEqual(expect.any(String))
  })
})
