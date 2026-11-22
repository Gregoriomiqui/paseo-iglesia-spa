import { useEffect, useRef, useState } from 'react'
import { MAX_AGE, MAX_NAME_LENGTH, validateParticipant } from '../domain/participant'
import { formatPhone, validatePhone } from '../domain/phone'
import { formatRut } from '../domain/rut'
import type { Participant, ParticipantField, Sex } from '../domain/types'
import { dangerTextButton, inputClass, primaryButton, secondaryButton, textButton } from '../ui/styles'
import { EmailAutocompleteInput } from './EmailAutocompleteInput'
import { Field, RadioGroup } from './Field'

interface ParticipantStepProps {
  participant: Participant
  /** RUTs de los participantes anteriores (para rechazar duplicados). */
  previousRuts: string[]
  stepNumber: number
  totalParticipants: number
  isLast: boolean
  canAddMore: boolean
  revealErrors: boolean
  onChange: (participant: Participant) => void
  onRevealErrors: () => void
  onAddAnother: () => void
  onNext: () => void
  onContinueToPayment: () => void
  onBack?: () => void
  onRemove?: () => void
}

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'femenino', label: 'Femenino' },
  { value: 'masculino', label: 'Masculino' },
]

const TRANSPORT_OPTIONS = [
  { value: 'yes', label: 'Sí' },
  { value: 'no', label: 'No' },
] as const

export function ParticipantStep({
  participant,
  previousRuts,
  stepNumber,
  totalParticipants,
  isLast,
  canAddMore,
  revealErrors,
  onChange,
  onRevealErrors,
  onAddAnother,
  onNext,
  onContinueToPayment,
  onBack,
  onRemove,
}: ParticipantStepProps) {
  const firstNameRef = useRef<HTMLInputElement>(null)
  const [touched, setTouched] = useState<Partial<Record<ParticipantField, boolean>>>({})

  useEffect(() => {
    firstNameRef.current?.focus({ preventScroll: true })
  }, [])

  const errors = validateParticipant(participant, previousRuts)
  const isValid = Object.keys(errors).length === 0
  const errorFor = (field: ParticipantField) => (revealErrors || touched[field] ? errors[field] : undefined)
  const touch = (field: ParticipantField) => setTouched((t) => ({ ...t, [field]: true }))
  const set = <K extends ParticipantField>(field: K, value: Participant[K]) =>
    onChange({ ...participant, [field]: value })

  const fieldId = (field: ParticipantField) => `${participant.id}-${field}`
  const isPrincipal = participant.isPrincipal

  function handleNext() {
    if (isValid) onNext()
    else onRevealErrors()
  }

  return (
    <section aria-labelledby={`${participant.id}-title`} className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 id={`${participant.id}-title`} className="font-display text-2xl font-bold sm:text-3xl">
            Participante {stepNumber} de {totalParticipants}
          </h2>
          <p className="mt-1 text-muted">
            {isPrincipal
              ? 'Tus datos. Eres el contacto principal de la inscripción.'
              : 'Correo y teléfono son opcionales para esta persona.'}
          </p>
        </div>
        {onRemove && (
          <button type="button" className={dangerTextButton} onClick={onRemove}>
            Eliminar participante
          </button>
        )}
      </header>

      <form noValidate onSubmit={(event) => event.preventDefault()} className="grid gap-5 sm:grid-cols-2">
        <Field id={fieldId('firstName')} label="Nombre" error={errorFor('firstName')}>
          {(a11y) => (
            <input
              ref={firstNameRef}
              {...a11y}
              type="text"
              autoComplete={isPrincipal ? 'given-name' : 'off'}
              maxLength={MAX_NAME_LENGTH}
              required
              className={inputClass}
              value={participant.firstName}
              onChange={(e) => set('firstName', e.target.value)}
              onBlur={() => touch('firstName')}
            />
          )}
        </Field>

        <Field id={fieldId('lastName')} label="Apellido" error={errorFor('lastName')}>
          {(a11y) => (
            <input
              {...a11y}
              type="text"
              autoComplete={isPrincipal ? 'family-name' : 'off'}
              maxLength={MAX_NAME_LENGTH}
              required
              className={inputClass}
              value={participant.lastName}
              onChange={(e) => set('lastName', e.target.value)}
              onBlur={() => touch('lastName')}
            />
          )}
        </Field>

        <Field id={fieldId('rut')} label="RUT" error={errorFor('rut')}>
          {(a11y) => (
            <input
              {...a11y}
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="12345678-5"
              required
              className={inputClass}
              value={participant.rut}
              onChange={(e) => set('rut', e.target.value)}
              onBlur={() => {
                touch('rut')
                const formatted = formatRut(participant.rut)
                if (formatted !== participant.rut) set('rut', formatted)
              }}
            />
          )}
        </Field>

        <Field id={fieldId('age')} label="Edad" hint="En años. Si es menor de 1 año, escribe 0." error={errorFor('age')}>
          {(a11y) => (
            <input
              {...a11y}
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_AGE}
              step={1}
              required
              className={inputClass}
              value={participant.age ?? ''}
              onChange={(e) => set('age', e.target.value === '' ? null : Number(e.target.value))}
              onBlur={() => touch('age')}
            />
          )}
        </Field>

        <div className="sm:col-span-2">
          <RadioGroup
            name={fieldId('sex')}
            legend="Sexo"
            options={SEX_OPTIONS}
            value={participant.sex}
            onChange={(value) => {
              set('sex', value)
              touch('sex')
            }}
            error={errorFor('sex')}
          />
        </div>

        <div className="sm:col-span-2">
          <Field
            id={fieldId('email')}
            label="Correo electrónico"
            optional={!isPrincipal}
            hint={isPrincipal ? 'Aquí enviaremos la entrada con el código QR.' : undefined}
            error={errorFor('email')}
          >
            {(a11y) => (
              <EmailAutocompleteInput
                {...a11y}
                required={isPrincipal}
                value={participant.email}
                onChange={(value) => set('email', value)}
                onBlur={() => touch('email')}
              />
            )}
          </Field>
        </div>

        <Field
          id={fieldId('phone')}
          label="Teléfono"
          optional={!isPrincipal}
          hint={isPrincipal ? 'Para avisarte si hay cambios.' : undefined}
          error={errorFor('phone')}
        >
          {(a11y) => (
            <input
              {...a11y}
              type="tel"
              inputMode="tel"
              autoComplete={isPrincipal ? 'tel' : 'off'}
              placeholder="+56 9 1234 5678"
              required={isPrincipal}
              className={inputClass}
              value={participant.phone}
              onChange={(e) => set('phone', e.target.value)}
              onBlur={() => {
                touch('phone')
                if (validatePhone(participant.phone)) set('phone', formatPhone(participant.phone))
              }}
            />
          )}
        </Field>

        <div className="sm:col-span-2">
          <RadioGroup
            name={fieldId('needsTransport')}
            legend="¿Viajará en el bus de acercamiento?"
            options={[...TRANSPORT_OPTIONS]}
            value={participant.needsTransport === null ? '' : participant.needsTransport ? 'yes' : 'no'}
            onChange={(value) => {
              set('needsTransport', value === 'yes')
              touch('needsTransport')
            }}
            error={errorFor('needsTransport')}
          />
        </div>
      </form>

      {revealErrors && !isValid && (
        <p role="alert" className="rounded-lg border-l-4 border-error bg-error/8 px-4 py-3 font-bold text-error">
          Revisa los campos con error antes de continuar.
        </p>
      )}

      <div className="flex flex-col-reverse gap-4 border-t border-line pt-6 sm:flex-row sm:items-start sm:justify-between">
        {onBack ? (
          <button type="button" className={textButton} onClick={onBack}>
            Anterior
          </button>
        ) : (
          <span className="hidden sm:block" />
        )}

        {isLast ? (
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <button type="button" className={primaryButton} onClick={onContinueToPayment}>
                Continuar al pago
              </button>
              {canAddMore && (
                <button type="button" className={secondaryButton} disabled={!isValid} onClick={onAddAnother}>
                  Agregar otro participante
                </button>
              )}
            </div>
            {canAddMore && !isValid && (
              <p className="text-sm text-muted">Completa los datos de esta persona para agregar a alguien más.</p>
            )}
          </div>
        ) : (
          <button type="button" className={primaryButton} onClick={handleNext}>
            Siguiente participante
          </button>
        )}
      </div>
    </section>
  )
}
