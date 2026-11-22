import type { MakePayload } from '../domain/types'

/** POST JSON al webhook de Make. Lanza error si falla la red o la respuesta no es 2xx. */
export async function submitRegistration(
  payload: MakePayload,
  url: string | undefined = import.meta.env.VITE_MAKE_WEBHOOK_URL,
): Promise<void> {
  if (!url) throw new Error('Falta configurar VITE_MAKE_WEBHOOK_URL')

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`El webhook de Make respondió ${response.status}`)
}
