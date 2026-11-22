const SEPARATORS = /[.\-\s]/g
/** Cuerpo de 1 a 8 dígitos + dígito verificador (0-9 o K). */
const RUT_SHAPE = /^\d{1,8}[0-9K]$/

function clean(rut: string): string {
  return rut.replace(SEPARATORS, '').toUpperCase()
}

/** Dígito verificador por Módulo 11. */
function computeCheckDigit(body: string): string {
  let sum = 0
  let factor = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * factor
    factor = factor === 7 ? 2 : factor + 1
  }
  const result = 11 - (sum % 11)
  if (result === 11) return '0'
  if (result === 10) return 'K'
  return String(result)
}

/** "10.000.013-k" → "10000013-K". */
export function normalizeRut(rut: string): string {
  const value = clean(rut)
  if (value.length < 2) return value
  return `${value.slice(0, -1)}-${value.slice(-1)}`
}

/**
 * Formato de visualización "26905429-8": sin puntos y con guion antes del dígito verificador.
 * Solo formatea si tiene forma de RUT (no valida el dígito); si no, devuelve la entrada intacta.
 */
export function formatRut(rut: string): string {
  const value = clean(rut)
  if (!RUT_SHAPE.test(value)) return rut
  return normalizeRut(value)
}

export function validateRut(rut: string): boolean {
  const value = clean(rut)
  if (!RUT_SHAPE.test(value)) return false
  return computeCheckDigit(value.slice(0, -1)) === value.slice(-1)
}
