import { calculateRegistrationSummary } from './fares'
import { getFullName } from './participant'
import { normalizePhone } from './phone'
import { normalizeRut } from './rut'
import type { MakePayload, Participant, PaymentData } from './types'

/** Arma el body JSON para el webhook de Make. Los participantes deben estar validados. */
export function buildMakePayload(
  participants: Participant[],
  payment: Pick<PaymentData, 'depositMadeBy'>,
  voucherDataUrl: string,
): MakePayload {
  return {
    amount: calculateRegistrationSummary(participants).total,
    depositMadeBy: payment.depositMadeBy.trim(),
    voucher: voucherDataUrl,
    participants: participants.map((p) => {
      if (p.age === null || p.sex === '' || p.needsTransport === null) {
        throw new Error(`Participante ${p.id} incompleto: validar antes de enviar`)
      }
      const phone = p.phone.trim()
      return {
        nameAndLastName: getFullName(p),
        rut: normalizeRut(p.rut),
        age: p.age,
        sex: p.sex,
        phone: phone ? normalizePhone(phone) : '',
        email: p.email.trim(),
        needsTransport: p.needsTransport,
        is_contact_principal: p.isPrincipal,
      }
    }),
  }
}
