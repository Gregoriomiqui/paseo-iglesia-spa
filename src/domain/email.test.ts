import { describe, expect, it } from 'vitest'
import { validateEmail } from './email'

describe('validateEmail', () => {
  it('V-05: correo válido', () => {
    expect(validateEmail('usuario@gmail.com')).toBe(true)
    expect(validateEmail('nombre.apellido+tag@sub.dominio.cl')).toBe(true)
  })

  it.each(['usuario@gmail', 'usuario@.com', 'usuario', '@gmail.com', 'us er@gmail.com', 'usuario@@gmail.com', ''])(
    'V-06: rechaza correo mal formado %j',
    (email) => {
      expect(validateEmail(email)).toBe(false)
    },
  )
})
