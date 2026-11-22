import { describe, expect, it } from 'vitest'
import { formatPhone, normalizePhone, validatePhone } from './phone'

describe('normalizePhone', () => {
  it('V-08: autocompleta +56 cuando el usuario no lo escribe', () => {
    expect(normalizePhone('9 1234 5678')).toBe('+56912345678')
    expect(normalizePhone('912345678')).toBe('+56912345678')
  })

  it('V-09: respeta un número que ya trae +56', () => {
    expect(normalizePhone('+56 9 1234 5678')).toBe('+56912345678')
  })

  it('antepone + cuando empieza con 56', () => {
    expect(normalizePhone('56912345678')).toBe('+56912345678')
  })

  it('quita guiones y paréntesis', () => {
    expect(normalizePhone('(9) 1234-5678')).toBe('+56912345678')
  })
})

describe('validatePhone', () => {
  it('V-09: número con +56 es válido', () => {
    expect(validatePhone('+56 9 1234 5678')).toBe(true)
    expect(validatePhone('912345678')).toBe(true)
  })

  it.each(['12345', '+56 2 2123 4567', '+56 9 1234 567', '', '9123456789'])('V-10: rechaza %j', (phone) => {
    expect(validatePhone(phone)).toBe(false)
  })
})

describe('formatPhone', () => {
  it('formatea a +56 9 XXXX XXXX', () => {
    expect(formatPhone('912345678')).toBe('+56 9 1234 5678')
    expect(formatPhone('+56912345678')).toBe('+56 9 1234 5678')
  })

  it('devuelve la entrada sin cambios si no es un teléfono válido', () => {
    expect(formatPhone('12345')).toBe('12345')
  })
})
