/** Values sent as-is to Make. */
export type Sex = 'femenino' | 'masculino'

export interface Participant {
  id: string                    // local identifier
  firstName: string
  lastName: string
  rut: string                   // as typed by the user; normalized on validation/submission
  sex: Sex | ''                 // '' = not selected
  age: number | null            // integer; null = not entered; under 1 year old = 0
  email: string                 // '' = empty
  phone: string                 // '' = empty
  needsTransport: boolean | null // null = not answered (required: explicit Yes / No)
  isPrincipal: boolean
}

export interface PaymentData {
  depositMadeBy: string
  voucher: File | null
}

export type ParticipantField = Exclude<keyof Participant, 'id' | 'isPrincipal'>
export type ParticipantErrors = Partial<Record<ParticipantField, string>>

export interface RegistrationSummary {
  items: { id: string; fullName: string; age: number; fare: number }[]
  total: number // integer CLP
}

export interface MakePayload {
  amount: number
  depositMadeBy: string
  voucher: string // data URL: "data:image/png;base64,..." or "data:image/jpeg;base64,..."
  participants: {
    nameAndLastName: string
    rut: string
    age: number
    sex: Sex
    phone: string
    email: string
    needsTransport: boolean
    is_contact_principal: boolean
  }[]
}
