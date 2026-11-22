/** usuario@dominio.ext: sin espacios, un solo @, dominio con al menos una extensión. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

export function validateEmail(email: string): boolean {
  return EMAIL_SHAPE.test(email)
}
