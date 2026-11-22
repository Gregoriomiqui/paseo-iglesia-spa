import { formatCLP } from '../ui/format'

interface SuccessScreenProps {
  email: string
  participantCount: number
  total: number
}

export function SuccessScreen({ email, participantCount, total }: SuccessScreenProps) {
  const people = participantCount === 1 ? '1 persona' : `${participantCount} personas`

  return (
    <section aria-labelledby="success-title" className="overflow-hidden rounded-2xl bg-white">
      <div className="h-3 bg-ocean" aria-hidden="true" />
      <div className="flex flex-col gap-4 px-5 py-8 sm:px-8">
        <h2 id="success-title" className="font-display text-3xl font-bold">
          Recibimos tu inscripción
        </h2>
        <p className="text-lg">
          Inscribiste a {people} por un total de <span className="font-display font-bold">{formatCLP(total)}</span>.
        </p>
        <p className="text-lg">
          Cuando confirmemos el pago, enviaremos la entrada con el código QR a <strong className="break-all">{email}</strong>.
        </p>
        <p className="text-muted">Si no la ves en unos días, revisa la carpeta de spam.</p>
      </div>
    </section>
  )
}
