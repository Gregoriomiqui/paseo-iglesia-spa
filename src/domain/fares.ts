import { getFullName } from './participant'
import type { Participant, RegistrationSummary } from './types'

export const FARE_FREE = 0
export const FARE_CHILD = 4500
export const FARE_ADULT = 9000

/** 0–5 años: $0 · 6–10 años: $4.500 · 11+ años: $9.000 (CLP). */
export function getFare(age: number): number {
  if (age <= 5) return FARE_FREE
  if (age <= 10) return FARE_CHILD
  return FARE_ADULT
}

/** Se llama solo con participantes ya validados. */
export function calculateRegistrationSummary(participants: Participant[]): RegistrationSummary {
  const items = participants.map((p) => {
    if (p.age === null) throw new Error(`Participante ${p.id} sin edad: validar antes de calcular`)
    return { id: p.id, fullName: getFullName(p), age: p.age, fare: getFare(p.age) }
  })
  return { items, total: items.reduce((sum, item) => sum + item.fare, 0) }
}
