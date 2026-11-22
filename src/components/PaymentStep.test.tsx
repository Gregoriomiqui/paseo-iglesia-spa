import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { makeParticipant } from '../domain/testUtils'
import type { PaymentData } from '../domain/types'
import { MAX_VOUCHER_BYTES } from '../domain/voucher'
import { PaymentStep } from './PaymentStep'

function Harness({ onSubmit }: { onSubmit: () => void }) {
  const [payment, setPayment] = useState<PaymentData>({ depositMadeBy: 'María', voucher: null })
  return (
    <PaymentStep
      participants={[makeParticipant()]}
      paymentData={payment}
      onChange={setPayment}
      onBack={() => {}}
      onSubmit={onSubmit}
      status="idle"
    />
  )
}

function image(bytes: number, name: string, type: string) {
  return new File([new Uint8Array(bytes)], name, { type })
}

describe('PaymentStep', () => {
  it('U-12: un .pdf muestra error de tipo y no permite finalizar', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup({ applyAccept: false })
    render(<Harness onSubmit={onSubmit} />)

    await user.upload(screen.getByLabelText('Comprobante de pago'), image(10, 'v.pdf', 'application/pdf'))
    expect(screen.getByText('El comprobante debe ser una imagen PNG o JPG')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Finalizar inscripción' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('U-13: una imagen de más de 5 MB muestra error de tamaño y no permite finalizar', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<Harness onSubmit={onSubmit} />)

    await user.upload(screen.getByLabelText('Comprobante de pago'), image(MAX_VOUCHER_BYTES + 1, 'v.png', 'image/png'))
    expect(screen.getByText('El comprobante no puede pesar más de 5 MB')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Finalizar inscripción' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('sin comprobante ni depositante muestra ambos errores', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<Harness onSubmit={onSubmit} />)

    await user.clear(screen.getByLabelText('Nombre de quien hizo el depósito'))
    await user.click(screen.getByRole('button', { name: 'Finalizar inscripción' }))

    expect(screen.getByText('Ingresa el nombre de quien hizo el depósito')).toBeInTheDocument()
    expect(screen.getByText('Adjunta el comprobante de pago')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('con datos válidos llama a onSubmit', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<Harness onSubmit={onSubmit} />)

    await user.upload(screen.getByLabelText('Comprobante de pago'), image(10, 'v.jpg', 'image/jpeg'))
    await user.click(screen.getByRole('button', { name: 'Finalizar inscripción' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('muestra el desglose por participante', () => {
    render(<Harness onSubmit={() => {}} />)
    expect(screen.getByText('María Pérez')).toBeInTheDocument()
    expect(screen.getByText('35 años')).toBeInTheDocument()
  })
})
