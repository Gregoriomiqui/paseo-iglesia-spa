import { useRef, useState } from 'react'
import { calculateRegistrationSummary } from '../domain/fares'
import { buildMakePayload } from '../domain/makePayload'
import { createEmptyParticipant, validateParticipant } from '../domain/participant'
import type { Participant, PaymentData } from '../domain/types'
import { fileToDataUrl } from '../infra/fileToDataUrl'
import { submitRegistration } from '../infra/submitRegistration'
import { ParticipantStep } from './ParticipantStep'
import { PaymentStep } from './PaymentStep'
import { SuccessScreen } from './SuccessScreen'
import type { SubmissionStatus } from './types'

const MAX_PARTICIPANTS = 5

export function RegistrationWizard() {
  const nextId = useRef(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const [participants, setParticipants] = useState<Participant[]>(() => [createEmptyParticipant('participant-0', true)])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [paymentData, setPaymentData] = useState<PaymentData>({ depositMadeBy: '', voucher: null })
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  const isPaymentStep = currentStepIndex >= participants.length
  const totalSteps = participants.length + 1

  /** Un RUT repetido se marca en el participante que lo ingresó después. */
  const previousRuts = (index: number) =>
    participants
      .slice(0, index)
      .map((p) => p.rut)
      .filter((rut) => rut.trim() !== '')
  const isInvalid = (index: number) => Object.keys(validateParticipant(participants[index], previousRuts(index))).length > 0

  function goTo(index: number) {
    setCurrentStepIndex(index)
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    containerRef.current?.scrollIntoView?.({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  function reveal(id: string) {
    setRevealed((r) => ({ ...r, [id]: true }))
  }

  function updateParticipant(updated: Participant) {
    setParticipants((ps) => ps.map((p) => (p.id === updated.id ? updated : p)))
  }

  function addParticipant() {
    const participant = createEmptyParticipant(`participant-${nextId.current++}`, false)
    setParticipants((ps) => [...ps, participant])
    goTo(participants.length)
  }

  function removeParticipant(index: number) {
    setParticipants((ps) => ps.filter((_, i) => i !== index))
    goTo(index - 1)
  }

  function continueToPayment() {
    const invalidIndex = isInvalid(currentStepIndex)
      ? currentStepIndex
      : participants.findIndex((_, i) => isInvalid(i))
    if (invalidIndex === -1) {
      goTo(participants.length)
      return
    }
    reveal(participants[invalidIndex].id)
    if (invalidIndex !== currentStepIndex) goTo(invalidIndex)
  }

  async function submit() {
    if (!paymentData.voucher) return
    setSubmissionStatus('submitting')
    try {
      const voucherDataUrl = await fileToDataUrl(paymentData.voucher)
      await submitRegistration(buildMakePayload(participants, paymentData, voucherDataUrl))
      setSubmissionStatus('success')
      containerRef.current?.scrollIntoView?.({ block: 'start' })
    } catch (error) {
      console.error(error)
      setSubmissionStatus('error')
    }
  }

  if (submissionStatus === 'success') {
    return (
      <div ref={containerRef} className="scroll-mt-6">
        <SuccessScreen
          email={participants[0].email.trim()}
          participantCount={participants.length}
          total={calculateRegistrationSummary(participants).total}
        />
      </div>
    )
  }

  const participant = participants[currentStepIndex]

  return (
    <div ref={containerRef} className="flex scroll-mt-6 flex-col gap-6">
      <div>
        <p className="text-sm font-bold text-muted">
          Paso {currentStepIndex + 1} de {totalSteps}
        </p>
        <div aria-hidden="true" className="mt-2 flex gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= currentStepIndex ? 'bg-brand' : 'bg-line'}`} />
          ))}
        </div>
      </div>

      {isPaymentStep ? (
        <PaymentStep
          participants={participants}
          paymentData={paymentData}
          onChange={setPaymentData}
          onBack={() => goTo(participants.length - 1)}
          onSubmit={submit}
          status={submissionStatus}
        />
      ) : (
        <ParticipantStep
          key={participant.id}
          participant={participant}
          previousRuts={previousRuts(currentStepIndex)}
          stepNumber={currentStepIndex + 1}
          totalParticipants={participants.length}
          isLast={currentStepIndex === participants.length - 1}
          canAddMore={participants.length < MAX_PARTICIPANTS}
          revealErrors={Boolean(revealed[participant.id])}
          onChange={updateParticipant}
          onRevealErrors={() => reveal(participant.id)}
          onAddAnother={addParticipant}
          onNext={() => goTo(currentStepIndex + 1)}
          onContinueToPayment={continueToPayment}
          onBack={currentStepIndex > 0 ? () => goTo(currentStepIndex - 1) : undefined}
          onRemove={participant.isPrincipal ? undefined : () => removeParticipant(currentStepIndex)}
        />
      )}
    </div>
  )
}
