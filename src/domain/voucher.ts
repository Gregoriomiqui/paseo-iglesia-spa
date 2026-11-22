export const MAX_VOUCHER_BYTES = 5 * 1024 * 1024
export const ALLOWED_VOUCHER_TYPES = ['image/png', 'image/jpeg']
/** Valor para el atributo `accept` del input file. */
export const VOUCHER_ACCEPT = '.png,.jpg,.jpeg,image/png,image/jpeg'

/** Devuelve un mensaje de error, o `null` si el archivo es válido. */
export function validateVoucher(file: File | null): string | null {
  if (!file) return 'Adjunta el comprobante de pago'
  if (!ALLOWED_VOUCHER_TYPES.includes(file.type)) return 'El comprobante debe ser una imagen PNG o JPG'
  if (file.size > MAX_VOUCHER_BYTES) return 'El comprobante no puede pesar más de 5 MB'
  return null
}
