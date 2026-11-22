import { useState, type KeyboardEvent } from 'react'
import { getEmailSuggestions } from '../domain/emailSuggestions'
import { inputClass } from '../ui/styles'

interface EmailAutocompleteInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  required?: boolean
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

export function EmailAutocompleteInput({ id, value, onChange, onBlur, required, ...aria }: EmailAutocompleteInputProps) {
  const [dismissed, setDismissed] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const listId = `${id}-suggestions`
  const suggestions = getEmailSuggestions(value)
  const expanded = !dismissed && suggestions.length > 0

  function select(suggestion: string) {
    onChange(suggestion)
    setDismissed(true)
    setActiveIndex(-1)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!expanded) return
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((i) => (i + 1) % suggestions.length)
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
        break
      case 'Enter':
        if (activeIndex >= 0) {
          event.preventDefault()
          select(suggestions[activeIndex])
        }
        break
      case 'Escape':
        event.preventDefault()
        setDismissed(true)
        setActiveIndex(-1)
        break
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined}
        aria-activedescendant={expanded && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        required={required}
        value={value}
        placeholder="nombre@correo.com"
        className={inputClass}
        onChange={(event) => {
          onChange(event.target.value)
          setDismissed(false)
          setActiveIndex(-1)
        }}
        onFocus={() => setDismissed(false)}
        onBlur={() => {
          setDismissed(true)
          onBlur?.()
        }}
        onKeyDown={handleKeyDown}
        {...aria}
      />
      {expanded && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-10 mt-1 max-h-64 overflow-auto rounded-lg border border-field bg-white py-1 shadow-lg"
        >
          {suggestions.map((suggestion, index) => {
            const at = suggestion.indexOf('@')
            return (
              <li
                key={suggestion}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className="cursor-pointer px-3.5 py-2.5 hover:bg-mist aria-selected:bg-brand/10"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(suggestion)}
              >
                <span className="text-muted">{suggestion.slice(0, at + 1)}</span>
                <span className="font-bold">{suggestion.slice(at + 1)}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
