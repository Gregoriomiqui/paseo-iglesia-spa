import { FARE_ADULT, FARE_CHILD, FARE_FREE } from '../domain/fares'
import { formatCLP } from '../ui/format'

const FARES = [
  { range: '0 a 5 años', amount: FARE_FREE, note: 'No pagan' },
  { range: '6 a 10 años', amount: FARE_CHILD },
  { range: '11 años o más', amount: FARE_ADULT },
]

const TRANSPORT_RULES = [
  'Salida única desde la iglesia, directo al recinto y sin paradas en el camino.',
  'El regreso tampoco tiene paradas intermedias: la única parada es la iglesia.',
  'La hora de salida se avisará en los servicios de la iglesia antes del paseo, y también el mismo día o el día anterior.',
  'Si el bus va lleno, los menores de 2 años viajan en brazos y ceden su asiento.',
]

export function EventInfoBanner() {
  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="fares-title">
        <h2 id="fares-title" className="font-display text-xl font-bold">
          Valores por persona
        </h2>
        <dl className="mt-3 divide-y divide-line border-y border-line">
          {FARES.map((fare) => (
            <div key={fare.range} className="flex items-baseline justify-between gap-4 py-3">
              <dt>{fare.range}</dt>
              <dd className="text-right">
                <span className="font-display text-lg font-bold tabular-nums">{formatCLP(fare.amount)}</span>
                {fare.note && <span className="block text-sm text-muted">{fare.note}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="bus-title">
        <h2 id="bus-title" className="font-display text-xl font-bold">
          Buses de acercamiento
        </h2>
        <ul className="mt-3 flex flex-col gap-3">
          {TRANSPORT_RULES.map((rule) => (
            <li key={rule} className="flex gap-3">
              <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-lagoon" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
