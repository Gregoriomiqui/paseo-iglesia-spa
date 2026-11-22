import { describe, expect, it } from 'vitest'
import { formatRut, normalizeRut, validateRut } from './rut'

describe('validateRut', () => {
  it('V-01: RUT válido con formato', () => {
    expect(validateRut('12.345.678-5')).toBe(true)
  })

  it('V-02: RUT válido sin puntos ni guion y con k minúscula', () => {
    expect(validateRut('10000013k')).toBe(true)
  })

  it('V-03: dígito verificador incorrecto', () => {
    expect(validateRut('12.345.678-9')).toBe(false)
  })

  it('acepta espacios alrededor', () => {
    expect(validateRut(' 12.345.678-5 ')).toBe(true)
  })

  it('acepta dígito verificador 0 (cuando 11 - resto = 11)', () => {
    expect(validateRut('10.000.004-0')).toBe(true)
    expect(validateRut('10.000.004-1')).toBe(false)
  })

  it.each(['', '   ', '5', 'abc', '12.345.678-X', '123456789-0'])(
    'rechaza entrada vacía, de largo inválido o con caracteres inválidos: %j',
    (rut) => {
      expect(validateRut(rut)).toBe(false)
    },
  )
})

describe('formatRut', () => {
  it('V-23: agrega el guion antes del dígito verificador si el usuario no lo escribió', () => {
    expect(formatRut('269054298')).toBe('26905429-8')
    expect(formatRut('10000013k')).toBe('10000013-K')
  })

  it('V-24: quita puntos y espacios y deja intacto un RUT ya formateado', () => {
    expect(formatRut('26.905.429-8')).toBe('26905429-8')
    expect(formatRut(' 26905429-8 ')).toBe('26905429-8')
    expect(formatRut('26905429-8')).toBe('26905429-8')
  })

  it('formatea aunque el dígito verificador sea incorrecto, para que el error se entienda', () => {
    expect(formatRut('269054291')).toBe('26905429-1')
  })

  it.each(['', 'abc', '1234567890', '2690542X8'])('devuelve la entrada sin cambios si no tiene forma de RUT: %j', (rut) => {
    expect(formatRut(rut)).toBe(rut)
  })
})

describe('normalizeRut', () => {
  it('V-04: quita puntos/espacios, pone guion y K mayúscula', () => {
    expect(normalizeRut('10.000.013-k')).toBe('10000013-K')
    expect(normalizeRut('123456785')).toBe('12345678-5')
    expect(normalizeRut(' 12 345 678 - 5 ')).toBe('12345678-5')
  })
})
