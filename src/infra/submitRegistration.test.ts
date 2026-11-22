import { afterEach, describe, expect, it, vi } from 'vitest'
import type { MakePayload } from '../domain/types'
import { fileToDataUrl } from './fileToDataUrl'
import { submitRegistration } from './submitRegistration'

const PAYLOAD: MakePayload = { amount: 9000, depositMadeBy: 'María', voucher: 'data:image/png;base64,AA==', participants: [] }

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('submitRegistration', () => {
  it('hace POST JSON a VITE_MAKE_WEBHOOK_URL', async () => {
    vi.stubEnv('VITE_MAKE_WEBHOOK_URL', 'https://hook.test/abc')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchMock)

    await submitRegistration(PAYLOAD)

    expect(fetchMock).toHaveBeenCalledWith('https://hook.test/abc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(PAYLOAD),
    })
  })

  it('lanza error ante una respuesta que no es 2xx', async () => {
    vi.stubEnv('VITE_MAKE_WEBHOOK_URL', 'https://hook.test/abc')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    await expect(submitRegistration(PAYLOAD)).rejects.toThrow('500')
  })

  it('lanza error si falta la URL del webhook', async () => {
    vi.stubEnv('VITE_MAKE_WEBHOOK_URL', '')
    vi.stubGlobal('fetch', vi.fn())

    await expect(submitRegistration(PAYLOAD)).rejects.toThrow('VITE_MAKE_WEBHOOK_URL')
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('fileToDataUrl', () => {
  it('convierte una imagen a data URL base64 con su tipo', async () => {
    const file = new File([new Uint8Array([137, 80, 78, 71])], 'v.png', { type: 'image/png' })
    await expect(fileToDataUrl(file)).resolves.toBe('data:image/png;base64,iVBORw==')
  })
})
