import type { Participant } from './types'

/** Participante principal válido por defecto; sobrescribir lo necesario. */
export function makeParticipant(overrides: Partial<Participant> = {}): Participant {
  return {
    id: 'p1',
    firstName: 'María',
    lastName: 'Pérez',
    rut: '12.345.678-5',
    sex: 'femenino',
    age: 35,
    email: 'maria@gmail.com',
    phone: '+56 9 1234 5678',
    needsTransport: true,
    isPrincipal: true,
    ...overrides,
  }
}

/** Participante adicional válido, sin correo ni teléfono. */
export function makeAdditional(overrides: Partial<Participant> = {}): Participant {
  return makeParticipant({
    id: 'p2',
    firstName: 'Tomás',
    lastName: 'Pérez',
    rut: '10.000.013-K',
    sex: 'masculino',
    age: 8,
    email: '',
    phone: '',
    isPrincipal: false,
    ...overrides,
  })
}
