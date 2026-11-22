import { useState } from 'react'
import { calculateRegistrationSummary } from '../domain/fares'
import type { Participant, PaymentData } from '../domain/types'
import { VOUCHER_ACCEPT, validateVoucher } from '../domain/voucher'
import { formatCLP } from '../ui/format'
import { inputClass, primaryButton, textButton } from '../ui/styles'
import { Field } from './Field'
import type { SubmissionStatus } from './types'

interface PaymentStepProps {
  participants: Participant[]
  paymentData: PaymentData
  onChange: (paymentData: PaymentData) => void
  onBack: () => void
  onSubmit: () => void
  status: SubmissionStatus
}

export function PaymentStep({ participants, paymentData, onChange, onBack, onSubmit, status }: PaymentStepProps) {
  const [revealErrors, setRevealErrors] = useState(false)
  const [touched, setTouched] = useState({ depositMadeBy: false, voucher: false })

  const summary = calculateRegistrationSummary(participants)
  const depositError = paymentData.depositMadeBy.trim() ? undefined : 'Ingresa el nombre de quien hizo el depósito'
  const voucherError = validateVoucher(paymentData.voucher) ?? undefined
  const submitting = status === 'submitting'

  function handleSubmit() {
    if (depositError || voucherError) {
      setRevealErrors(true)
      return
    }
    onSubmit()
  }

  return (
    <section aria-labelledby="payment-title" className="flex flex-col gap-8">
      <header>
        <h2 id="payment-title" className="font-display text-2xl font-bold sm:text-3xl">
          Resumen y pago
        </h2>
        <p className="mt-1 text-muted">Transfiere el total y adjunta el comprobante para terminar la inscripción.</p>
      </header>

      <section aria-labelledby="ticket-title" className="overflow-hidden rounded-2xl bg-white">
        <div className="px-5 pt-5 pb-6 sm:px-7">
          <h3 id="ticket-title" className="font-display text-lg font-bold">
            Participantes
          </h3>
          <ul className="mt-3 flex flex-col gap-3">
            {summary.items.map((item) => (
              <li key={item.id} className="flex items-baseline justify-between gap-4">
                <span className="min-w-0">
                  <span className="block truncate font-bold">{item.fullName}</span>
                  <span className="block text-sm text-muted">{item.age} años</span>
                </span>
                <span className="shrink-0 font-display font-bold tabular-nums">{formatCLP(item.fare)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div aria-hidden="true" className="relative h-0 border-t-2 border-dashed border-line">
          <span className="absolute -top-3 -left-3 size-6 rounded-full bg-mist" />
          <span className="absolute -top-3 -right-3 size-6 rounded-full bg-mist" />
        </div>

        <dl className="flex items-baseline justify-between gap-4 bg-lagoon px-5 py-5 sm:px-7">
          <dt className="font-bold">Total a pagar</dt>
          <dd className="font-display text-4xl font-bold tabular-nums">{formatCLP(summary.total)}</dd>
        </dl>
      </section>

      <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-5">
        <Field
          id="depositMadeBy"
          label="Nombre de quien hizo el depósito"
          error={revealErrors || touched.depositMadeBy ? depositError : undefined}
        >
          {(a11y) => (
            <input
              {...a11y}
              type="text"
              autoComplete="name"
              required
              className={inputClass}
              value={paymentData.depositMadeBy}
              onChange={(e) => onChange({ ...paymentData, depositMadeBy: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, depositMadeBy: true }))}
            />
          )}
        </Field>

        <Field
          id="voucher"
          label="Comprobante de pago"
          hint="Foto o captura de la transferencia. PNG o JPG, hasta 5 MB."
          error={revealErrors || touched.voucher ? voucherError : undefined}
        >
          {(a11y) => (
            <div className="rounded-lg border-2 border-dashed border-field bg-white p-4">
              <input
                {...a11y}
                type="file"
                accept={VOUCHER_ACCEPT}
                required
                className={
                  'block w-full text-sm text-muted ' +
                  'file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-full file:border-0 file:bg-brand/10 ' +
                  'file:px-5 file:font-bold file:text-brand hover:file:bg-brand/15 ' +
                  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand'
                }
                onChange={(e) => {
                  onChange({ ...paymentData, voucher: e.target.files?.[0] ?? null })
                  setTouched((t) => ({ ...t, voucher: true }))
                }}
              />
              {paymentData.voucher && (
                <p className="mt-3 text-sm">
                  Archivo seleccionado: <span className="font-bold break-all">{paymentData.voucher.name}</span>
                </p>
              )}
            </div>
          )}
        </Field>
      </form>

      {status === 'error' && (
        <div role="alert" className="rounded-lg border-l-4 border-error bg-error/8 px-4 py-3">
          <p className="font-bold text-error">No pudimos enviar la inscripción.</p>
          <p className="mt-1">Revisa tu conexión y vuelve a intentarlo. Tus datos siguen aquí.</p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" className={textButton} onClick={onBack} disabled={submitting}>
          Anterior
        </button>
        <button type="button" className={primaryButton} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Enviando…' : 'Finalizar inscripción'}
        </button>
      </div>
    </section>
  )
}
