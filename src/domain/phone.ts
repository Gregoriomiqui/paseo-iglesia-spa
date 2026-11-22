const SEPARATORS = /[\s\-()]/g
const CHILEAN_MOBILE = /^\+569\d{8}$/

/** Formato canónico "+569XXXXXXXX"; autocompleta el +56 si falta. */
export function normalizePhone(phone: string): string {
  const value = phone.replace(SEPARATORS, '')
  if (value.startsWith('+56')) return value
  if (value.startsWith('56')) return `+${value}`
  if (/^9\d{8}$/.test(value)) return `+56${value}`
  return value
}

export function validatePhone(phone: string): boolean {
  return CHILEAN_MOBILE.test(normalizePhone(phone))
}

/** "+56 9 XXXX XXXX" para mostrar; devuelve la entrada intacta si no es válida. */
export function formatPhone(phone: string): string {
  const value = normalizePhone(phone)
  if (!CHILEAN_MOBILE.test(value)) return phone
  return `+56 9 ${value.slice(4, 8)} ${value.slice(8)}`
}
