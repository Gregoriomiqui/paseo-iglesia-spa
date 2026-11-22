import type { ReactNode } from 'react'

export interface FieldA11yProps {
  id: string
  'aria-invalid': boolean
  'aria-describedby'?: string
}

interface FieldProps {
  id: string
  label: string
  optional?: boolean
  hint?: string
  error?: string
  children: (a11y: FieldA11yProps) => ReactNode
}

export function Field({ id, label, optional, hint, error, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold">
        {label}
        {optional && <span className="font-normal text-muted"> (opcional)</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {error && (
        <p id={errorId} className="text-sm font-bold text-error">
          {error}
        </p>
      )}
    </div>
  )
}

interface RadioGroupProps<T extends string> {
  name: string
  legend: string
  options: { value: T; label: string }[]
  value: T | ''
  onChange: (value: T) => void
  error?: string
}

export function RadioGroup<T extends string>({ name, legend, options, value, onChange, error }: RadioGroupProps<T>) {
  const errorId = `${name}-error`

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="mb-1.5 font-bold">{legend}</legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={
              'flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border bg-white px-4 ' +
              'has-checked:border-brand has-checked:bg-brand/8 has-checked:font-bold ' +
              'has-focus-visible:ring-3 has-focus-visible:ring-brand/30 ' +
              (error ? 'border-error' : 'border-field')
            }
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="size-5 accent-brand"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-bold text-error">
          {error}
        </p>
      )}
    </fieldset>
  )
}
