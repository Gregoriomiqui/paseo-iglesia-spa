const focusRing = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand'

export const inputClass =
  'block w-full rounded-lg border border-field bg-white px-3.5 py-3 text-base text-ink placeholder:text-muted/70 ' +
  'focus:border-brand focus:outline-none focus-visible:ring-3 focus-visible:ring-brand/30 ' +
  'aria-[invalid=true]:border-error aria-[invalid=true]:focus-visible:ring-error/25'

export const primaryButton =
  'inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 font-bold text-white ' +
  'hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-muted ' +
  focusRing

export const secondaryButton =
  'inline-flex min-h-12 items-center justify-center rounded-full border-2 border-brand px-6 font-bold text-brand ' +
  'hover:bg-brand/5 disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent ' +
  focusRing

export const textButton =
  'inline-flex min-h-11 items-center rounded px-1 font-bold text-muted underline-offset-4 hover:text-ink hover:underline ' +
  focusRing

export const dangerTextButton =
  'inline-flex min-h-11 shrink-0 items-center rounded px-1 text-sm font-bold text-error underline-offset-4 hover:underline ' +
  focusRing
