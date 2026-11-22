import { describe, expect, it } from 'vitest'
import { createEmptyParticipant, DUPLICATE_RUT_ERROR, validateParticipant } from './participant'
import { makeAdditional, makeParticipant } from './testUtils'

describe('createEmptyParticipant', () => {
  it('crea un participante vacío sin respuestas preseleccionadas', () => {
    expect(createEmptyParticipant('x', true)).toEqual({
      id: 'x',
      firstName: '',
      lastName: '',
      rut: '',
      sex: '',
      age: null,
      email: '',
      phone: '',
      needsTransport: null,
      isPrincipal: true,
    })
  })
})

describe('validateParticipant', () => {
  it('V-19: participante principal completo y válido → {}', () => {
    expect(validateParticipant(makeParticipant(), [])).toEqual({})
  })

  it('adicional válido sin correo ni teléfono → {}', () => {
    expect(validateParticipant(makeAdditional(), [])).toEqual({})
  })

  describe('correo (V-07)', () => {
    it('principal: es obligatorio', () => {
      expect(validateParticipant(makeParticipant({ email: '' }), [])).toHaveProperty('email')
    })

    it('adicional: vacío es válido, mal formado es error', () => {
      expect(validateParticipant(makeAdditional({ email: '' }), [])).not.toHaveProperty('email')
      expect(validateParticipant(makeAdditional({ email: 'mal-correo' }), [])).toHaveProperty('email')
    })
  })

  describe('teléfono (V-11)', () => {
    it('principal: vacío es error', () => {
      expect(validateParticipant(makeParticipant({ phone: '' }), [])).toHaveProperty('phone')
    })

    it('adicional: vacío es válido, inválido es error', () => {
      expect(validateParticipant(makeAdditional({ phone: '' }), [])).not.toHaveProperty('phone')
      expect(validateParticipant(makeAdditional({ phone: '12345' }), [])).toHaveProperty('phone')
    })
  })

  describe('nombre y apellido', () => {
    it('V-12: 250 caracteres es válido, 251 es error', () => {
      expect(validateParticipant(makeParticipant({ firstName: 'a'.repeat(250) }), [])).not.toHaveProperty('firstName')
      expect(validateParticipant(makeParticipant({ firstName: 'a'.repeat(251) }), [])).toHaveProperty('firstName')
      expect(validateParticipant(makeParticipant({ lastName: 'a'.repeat(251) }), [])).toHaveProperty('lastName')
    })

    it('V-13: solo espacios es error', () => {
      const errors = validateParticipant(makeParticipant({ firstName: '   ', lastName: '' }), [])
      expect(errors).toHaveProperty('firstName')
      expect(errors).toHaveProperty('lastName')
    })
  })

  describe('edad', () => {
    it('V-14: 0 (menor de 1 año) es válido', () => {
      expect(validateParticipant(makeAdditional({ age: 0 }), [])).not.toHaveProperty('age')
    })

    it.each([2.5, -1, null, 121, Number.NaN])('V-15: rechaza %s', (age) => {
      expect(validateParticipant(makeParticipant({ age }), [])).toHaveProperty('age')
    })
  })

  it('V-16: sexo sin seleccionar es error', () => {
    expect(validateParticipant(makeParticipant({ sex: '' }), [])).toHaveProperty('sex')
  })

  describe('RUT', () => {
    it('RUT inválido es error', () => {
      expect(validateParticipant(makeParticipant({ rut: '12.345.678-9' }), [])).toHaveProperty('rut')
    })

    it('V-17: RUT duplicado dentro del registro (comparación normalizada)', () => {
      const errors = validateParticipant(makeParticipant({ rut: '12.345.678-5' }), ['123456785'])
      expect(errors.rut).toBe(DUPLICATE_RUT_ERROR)
    })

    it('RUT distinto a los demás no es error', () => {
      expect(validateParticipant(makeParticipant(), ['10.000.013-K'])).not.toHaveProperty('rut')
    })
  })

  it('V-18: transporte sin responder es error; false es una respuesta válida', () => {
    expect(validateParticipant(makeParticipant({ needsTransport: null }), [])).toHaveProperty('needsTransport')
    expect(validateParticipant(makeParticipant({ needsTransport: false }), [])).not.toHaveProperty('needsTransport')
  })
})
