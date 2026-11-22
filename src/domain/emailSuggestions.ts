export const DEFAULT_EMAIL_DOMAINS: readonly string[] = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'icloud.com',
  'live.com',
]

/**
 * Sugerencias de correo a partir del texto después del `@`.
 * No distingue mayúsculas; conserva la parte local tal como se escribió.
 */
export function getEmailSuggestions(input: string, domains: readonly string[] = DEFAULT_EMAIL_DOMAINS): string[] {
  const at = input.indexOf('@')
  if (at === -1) return []

  const local = input.slice(0, at)
  const typed = input.slice(at + 1).toLowerCase()
  if (domains.some((d) => d.toLowerCase() === typed)) return []

  return domains.filter((d) => d.toLowerCase().startsWith(typed)).map((d) => `${local}@${d}`)
}
