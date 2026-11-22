import { describe, expect, it } from 'vitest'
import { buildMakePayload } from './makePayload'
import { makeAdditional, makeParticipant } from './testUtils'

const VOUCHER = 'data:image/png;base64,iVBORw0KGgo='

describe('buildMakePayload', () => {
  it('P-01: mapea principal + adicional sin correo ni teléfono', () => {
    const payload = buildMakePayload(
      [makeParticipant(), makeAdditional()],
      { depositMadeBy: '  María Pérez  ' },
      VOUCHER,
    )

    expect(payload).toEqual({
      amount: 13500,
      depositMadeBy: 'María Pérez',
      voucher: VOUCHER,
      participants: [
        {
          nameAndLastName: 'María Pérez',
          rut: '12345678-5',
          age: 35,
          sex: 'femenino',
          phone: '+56912345678',
          email: 'maria@gmail.com',
          needsTransport: true,
          is_contact_principal: true,
        },
        {
          nameAndLastName: 'Tomás Pérez',
          rut: '10000013-K',
          age: 8,
          sex: 'masculino',
          phone: '',
          email: '',
          needsTransport: true,
          is_contact_principal: false,
        },
      ],
    })
  })

  it('P-02: normaliza RUT, teléfono y recorta correo y nombres', () => {
    const payload = buildMakePayload(
      [
        makeParticipant({
          firstName: ' María ',
          lastName: ' Pérez ',
          rut: '12.345.678-5',
          phone: '912345678',
          email: ' maria@gmail.com ',
          needsTransport: false,
        }),
      ],
      { depositMadeBy: 'María' },
      VOUCHER,
    )

    expect(payload.participants[0]).toMatchObject({
      nameAndLastName: 'María Pérez',
      rut: '12345678-5',
      phone: '+56912345678',
      email: 'maria@gmail.com',
      needsTransport: false,
    })
  })
})
