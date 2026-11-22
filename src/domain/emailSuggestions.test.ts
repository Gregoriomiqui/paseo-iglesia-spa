import { describe, expect, it } from 'vitest'
import { DEFAULT_EMAIL_DOMAINS, getEmailSuggestions } from './emailSuggestions'

describe('getEmailSuggestions', () => {
  it('A-01: sin @ → []', () => {
    expect(getEmailSuggestions('jose')).toEqual([])
  })

  it('A-02: recién escrito el @ → todos los dominios', () => {
    expect(getEmailSuggestions('jose@')).toEqual(DEFAULT_EMAIL_DOMAINS.map((d) => `jose@${d}`))
    expect(DEFAULT_EMAIL_DOMAINS).toEqual([
      'gmail.com',
      'hotmail.com',
      'outlook.com',
      'yahoo.com',
      'icloud.com',
      'live.com',
    ])
  })

  it('A-03: filtra por prefijo después del @', () => {
    expect(getEmailSuggestions('jose@ya')).toEqual(['jose@yahoo.com'])
    expect(getEmailSuggestions('jose@gmail.co')).toEqual(['jose@gmail.com'])
  })

  it('A-04: dominio ya completo → []', () => {
    expect(getEmailSuggestions('jose@gmail.com')).toEqual([])
  })

  it('A-05: no distingue mayúsculas y conserva la parte local', () => {
    expect(getEmailSuggestions('JOSE@GM')).toEqual(['JOSE@gmail.com'])
    expect(getEmailSuggestions('jose@GMAIL.COM')).toEqual([])
  })

  it('sin coincidencias → []', () => {
    expect(getEmailSuggestions('jose@empresa')).toEqual([])
  })

  it('acepta dominios personalizados', () => {
    expect(getEmailSuggestions('jose@', ['iglesia.cl'])).toEqual(['jose@iglesia.cl'])
  })
})
