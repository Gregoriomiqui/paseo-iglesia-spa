import { validateEmail } from './email'
import { validatePhone } from './phone'
import { normalizeRut, validateRut } from './rut'
import type { Participant, ParticipantErrors } from './types'

export const MAX_NAME_LENGTH = 250
export const MAX_AGE = 120
export const DUPLICATE_RUT_ERROR = 'Este RUT ya fue ingresado en este registro'

export function createEmptyParticipant(id: string, isPrincipal: boolean): Participant {
  return {
    id,
    firstName: '',
    lastName: '',
    rut: '',
    sex: '',
    age: null,
    email: '',
    phone: '',
    needsTransport: null,
    isPrincipal,
  }
}

export function getFullName(p: Pick<Participant, 'firstName' | 'lastName'>): string {
  return `${p.firstName.trim()} ${p.lastName.trim()}`
}

function validateName(value: string, label: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return `Ingresa el ${label}`
  if (trimmed.length > MAX_NAME_LENGTH) return `El ${label} no puede superar ${MAX_NAME_LENGTH} caracteres`
  return undefined
}

/**
 * Devuelve un mensaje por cada campo inválido; `{}` significa participante válido.
 * `otherRuts` son los RUT de los demás participantes del mismo registro.
 */
export function validateParticipant(p: Participant, otherRuts: string[]): ParticipantErrors {
  const errors: ParticipantErrors = {}

  const firstNameError = validateName(p.firstName, 'nombre')
  if (firstNameError) errors.firstName = firstNameError
  const lastNameError = validateName(p.lastName, 'apellido')
  if (lastNameError) errors.lastName = lastNameError

  if (!p.rut.trim()) {
    errors.rut = 'Ingresa el RUT'
  } else if (!validateRut(p.rut)) {
    errors.rut = 'RUT inválido'
  } else if (otherRuts.some((other) => normalizeRut(other) === normalizeRut(p.rut))) {
    errors.rut = DUPLICATE_RUT_ERROR
  }

  if (p.sex !== 'femenino' && p.sex !== 'masculino') {
    errors.sex = 'Selecciona el sexo'
  }

  if (p.age === null || !Number.isInteger(p.age) || p.age < 0 || p.age > MAX_AGE) {
    errors.age = 'Ingresa una edad válida (número entero; 0 si es menor de 1 año)'
  }

  const email = p.email.trim()
  if (!email) {
    if (p.isPrincipal) errors.email = 'El correo es obligatorio para el participante principal'
  } else if (!validateEmail(email)) {
    errors.email = 'Correo inválido'
  }

  const phone = p.phone.trim()
  if (!phone) {
    if (p.isPrincipal) errors.phone = 'El teléfono es obligatorio para el participante principal'
  } else if (!validatePhone(phone)) {
    errors.phone = 'Teléfono inválido (formato +56 9 XXXX XXXX)'
  }

  if (p.needsTransport === null) {
    errors.needsTransport = 'Indica si viajará en el bus'
  }

  return errors
}
