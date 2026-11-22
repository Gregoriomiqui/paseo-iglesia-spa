import { render, screen, waitFor } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RegistrationWizard } from './RegistrationWizard'

/** Values as typed in the form (option labels as shown on screen). */
interface PersonData {
  firstName: string
  lastName: string
  rut: string
  sex: 'Femenino' | 'Masculino'
  age: string
  email?: string
  phone?: string
  needsTransport: 'Sí' | 'No'
}

const PRINCIPAL: PersonData = {
  firstName: 'María',
  lastName: 'Pérez',
  rut: '12.345.678-5',
  sex: 'Femenino',
  age: '35',
  email: 'maria@gmail.com',
  phone: '912345678',
  needsTransport: 'Sí',
}

/** RUTs válidos y distintos para participantes adicionales. */
const EXTRA_RUTS = ['10.000.013-K', '10.000.004-0', '10.000.018-0', '10.000.027-K']

function extra(n: number, overrides: Partial<PersonData> = {}): PersonData {
  return {
    firstName: `Hijo${n}`,
    lastName: 'Pérez',
    rut: EXTRA_RUTS[n - 1],
    sex: 'Masculino',
    age: '8',
    needsTransport: 'Sí',
    ...overrides,
  }
}

async function fill(user: UserEvent, data: PersonData) {
  await user.type(screen.getByLabelText('Nombre'), data.firstName)
  await user.type(screen.getByLabelText('Apellido'), data.lastName)
  await user.type(screen.getByLabelText('RUT'), data.rut)
  await user.click(screen.getByRole('radio', { name: data.sex }))
  await user.type(screen.getByLabelText(/^Edad/), data.age)
  if (data.email) await user.type(screen.getByLabelText(/^Correo electrónico/), data.email)
  if (data.phone) await user.type(screen.getByLabelText(/^Teléfono/), data.phone)
  await user.click(screen.getByRole('radio', { name: data.needsTransport }))
}

const button = (name: string | RegExp) => screen.getByRole('button', { name })

beforeEach(() => {
  vi.stubEnv('VITE_MAKE_WEBHOOK_URL', 'https://hook.test/abc')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('RegistrationWizard', () => {
  it('U-02: al cargar, el input Nombre del step 1 tiene el foco', () => {
    render(<RegistrationWizard />)
    expect(screen.getByRole('heading', { name: 'Participante 1 de 1' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveFocus()
  })

  it('marca correo y teléfono como obligatorios en el principal y opcionales en los adicionales', async () => {
    const user = userEvent.setup()
    render(<RegistrationWizard />)
    expect(screen.getByLabelText('Correo electrónico')).toBeRequired()
    expect(screen.getByLabelText('Teléfono')).toBeRequired()

    await fill(user, PRINCIPAL)
    await user.click(button('Agregar otro participante'))
    expect(screen.getByLabelText('Correo electrónico (opcional)')).not.toBeRequired()
    expect(screen.getByLabelText('Teléfono (opcional)')).not.toBeRequired()
  })

  it('U-03: al agregar un participante, el step 2 enfoca Nombre', async () => {
    const user = userEvent.setup()
    render(<RegistrationWizard />)

    await fill(user, PRINCIPAL)
    await user.click(button('Agregar otro participante'))

    expect(screen.getByRole('heading', { name: 'Participante 2 de 2' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveFocus()
    expect(screen.getByLabelText('Nombre')).toHaveValue('')
  })

  it('no permite agregar ni continuar mientras el step sea inválido, y muestra los errores', async () => {
    const user = userEvent.setup()
    render(<RegistrationWizard />)

    expect(button('Agregar otro participante')).toBeDisabled()
    await user.click(button('Continuar al pago'))

    expect(screen.getByRole('heading', { name: 'Participante 1 de 1' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(/revisa los campos/i)
    expect(screen.getByText('Ingresa el nombre')).toBeInTheDocument()
    expect(screen.getByText('Indica si viajará en el bus')).toBeInTheDocument()
  })

  it('U-04: con 5 participantes ya no se puede agregar otro', async () => {
    const user = userEvent.setup()
    render(<RegistrationWizard />)

    await fill(user, PRINCIPAL)
    for (let n = 1; n <= 4; n++) {
      await user.click(button('Agregar otro participante'))
      await fill(user, extra(n))
    }

    expect(screen.getByRole('heading', { name: 'Participante 5 de 5' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Agregar otro participante' })).not.toBeInTheDocument()
    expect(button('Continuar al pago')).toBeEnabled()
  }, 20_000)

  it('U-06: el step de pago muestra el total y no enfoca ningún input', async () => {
    const user = userEvent.setup()
    render(<RegistrationWizard />)

    await fill(user, PRINCIPAL)
    await user.click(button('Agregar otro participante'))
    await fill(user, extra(1))
    await user.click(button('Continuar al pago'))

    expect(screen.getByRole('heading', { name: 'Resumen y pago' })).toBeInTheDocument()
    expect(screen.getByText('Total a pagar').nextElementSibling).toHaveTextContent('$13.500')
    expect(document.body).toHaveFocus()
  })

  it('U-09: eliminar al participante 3 de 4 vuelve al 2 y conserva al 4', async () => {
    const user = userEvent.setup()
    render(<RegistrationWizard />)

    await fill(user, PRINCIPAL)
    for (let n = 1; n <= 3; n++) {
      await user.click(button('Agregar otro participante'))
      await fill(user, extra(n))
    }
    await user.click(button('Anterior'))
    expect(screen.getByLabelText('Nombre')).toHaveValue('Hijo2')

    await user.click(button('Eliminar participante'))

    expect(screen.getByRole('heading', { name: 'Participante 2 de 3' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Hijo1')
    expect(screen.getByLabelText('Nombre')).toHaveFocus()

    await user.click(button('Siguiente participante'))
    expect(screen.getByRole('heading', { name: 'Participante 3 de 3' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Hijo3')
  }, 20_000)

  it('el participante principal no se puede eliminar', () => {
    render(<RegistrationWizard />)
    expect(screen.queryByRole('button', { name: 'Eliminar participante' })).not.toBeInTheDocument()
  })

  it('U-10: al salir del teléfono se autocompleta el +56 con formato', async () => {
    const user = userEvent.setup()
    render(<RegistrationWizard />)

    await user.type(screen.getByLabelText('Teléfono'), '912345678')
    await user.tab()

    expect(screen.getByLabelText('Teléfono')).toHaveValue('+56 9 1234 5678')
  })

  it('U-14: al salir del RUT se formatea con guion antes del dígito verificador', async () => {
    const user = userEvent.setup()
    render(<RegistrationWizard />)

    await user.type(screen.getByLabelText('RUT'), '269054298')
    await user.tab()

    expect(screen.getByLabelText('RUT')).toHaveValue('26905429-8')
    expect(screen.queryByText('RUT inválido')).not.toBeInTheDocument()
  })

  it('U-11: un RUT repetido en el participante 2 bloquea el avance', async () => {
    const user = userEvent.setup()
    render(<RegistrationWizard />)

    await fill(user, PRINCIPAL)
    await user.click(button('Agregar otro participante'))
    await fill(user, extra(1, { rut: '12345678-5' }))
    await user.click(button('Continuar al pago'))

    expect(screen.getByText('Este RUT ya fue ingresado en este registro')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Participante 2 de 2' })).toBeInTheDocument()
  })

  describe('envío a Make', () => {
    async function goToPaymentAndFill(user: UserEvent) {
      await fill(user, PRINCIPAL)
      await user.click(button('Continuar al pago'))
      await user.type(screen.getByLabelText('Nombre de quien hizo el depósito'), 'María Pérez')
      const voucher = new File([new Uint8Array([137, 80, 78, 71])], 'voucher.png', { type: 'image/png' })
      await user.upload(screen.getByLabelText('Comprobante de pago'), voucher)
    }

    it('U-07: envía el JSON a Make y muestra la confirmación', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      vi.stubGlobal('fetch', fetchMock)
      const user = userEvent.setup()
      render(<RegistrationWizard />)

      await goToPaymentAndFill(user)
      await user.click(button('Finalizar inscripción'))

      expect(await screen.findByRole('heading', { name: 'Recibimos tu inscripción' })).toBeInTheDocument()
      expect(screen.getByText(/maria@gmail\.com/)).toBeInTheDocument()

      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
      expect(url).toBe('https://hook.test/abc')
      expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
      expect(JSON.parse(init.body as string)).toEqual({
        amount: 9000,
        depositMadeBy: 'María Pérez',
        voucher: 'data:image/png;base64,iVBORw==',
        participants: [
          {
            nameAndLastName: 'María Pérez',
            rut: '12345678-5',
            age: 35,
            sex: 'femenino',
            phone: '+56912345678',
            email: 'maria@gmail.com',
            needsTransport: true,
            is_contact_principal: true,
          },
        ],
      })
    })

    it('U-08: ante un fallo de red muestra error, conserva los datos y permite reintentar', async () => {
      const fetchMock = vi
        .fn()
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce({ ok: true, status: 200 })
      vi.stubGlobal('fetch', fetchMock)
      const user = userEvent.setup()
      render(<RegistrationWizard />)

      await goToPaymentAndFill(user)
      await user.click(button('Finalizar inscripción'))

      expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos enviar la inscripción/i)
      expect(screen.getByLabelText('Nombre de quien hizo el depósito')).toHaveValue('María Pérez')
      expect(screen.getByText('voucher.png')).toBeInTheDocument()

      await user.click(button('Finalizar inscripción'))
      expect(await screen.findByRole('heading', { name: 'Recibimos tu inscripción' })).toBeInTheDocument()
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('deshabilita el botón mientras se envía', async () => {
      let resolve: (value: unknown) => void = () => {}
      vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise((r) => (resolve = r))))
      const user = userEvent.setup()
      render(<RegistrationWizard />)

      await goToPaymentAndFill(user)
      await user.click(button('Finalizar inscripción'))

      await waitFor(() => expect(button(/enviando/i)).toBeDisabled())
      resolve({ ok: true, status: 200 })
      expect(await screen.findByRole('heading', { name: 'Recibimos tu inscripción' })).toBeInTheDocument()
    })

    it('desde el pago, Anterior vuelve al último participante con sus datos', async () => {
      const user = userEvent.setup()
      render(<RegistrationWizard />)

      await fill(user, PRINCIPAL)
      await user.click(button('Continuar al pago'))
      await user.click(button('Anterior'))

      expect(screen.getByRole('heading', { name: 'Participante 1 de 1' })).toBeInTheDocument()
      expect(screen.getByLabelText('Nombre')).toHaveValue('María')
    })
  })
})
