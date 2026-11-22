import { describe, expect, it } from 'vitest'
import { calculateRegistrationSummary, getFare } from './fares'
import { makeAdditional, makeParticipant } from './testUtils'

describe('getFare', () => {
  it.each([
    ['T-01', 0, 0],
    ['T-02', 5, 0],
    ['T-03', 6, 4500],
    ['T-04', 10, 4500],
    ['T-05', 11, 9000],
    ['adulto mayor', 80, 9000],
  ])('%s: edad %i → $%i', (_id, age, fare) => {
    expect(getFare(age)).toBe(fare)
  })
})

describe('calculateRegistrationSummary', () => {
  it('T-06: grupo mixto [35, 8, 3] → total 13500 con desglose', () => {
    const summary = calculateRegistrationSummary([
      makeParticipant({ id: 'a', firstName: ' María ', lastName: ' Pérez ', age: 35 }),
      makeAdditional({ id: 'b', firstName: 'Tomás', age: 8 }),
      makeAdditional({ id: 'c', firstName: 'Sofía', age: 3 }),
    ])

    expect(summary.total).toBe(13500)
    expect(summary.items).toEqual([
      { id: 'a', fullName: 'María Pérez', age: 35, fare: 9000 },
      { id: 'b', fullName: 'Tomás Pérez', age: 8, fare: 4500 },
      { id: 'c', fullName: 'Sofía Pérez', age: 3, fare: 0 },
    ])
  })
})
