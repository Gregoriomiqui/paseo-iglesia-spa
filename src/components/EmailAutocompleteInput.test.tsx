import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { EmailAutocompleteInput } from './EmailAutocompleteInput'

function Harness() {
  const [value, setValue] = useState('')
  return (
    <>
      <label htmlFor="email">Correo</label>
      <EmailAutocompleteInput id="email" value={value} onChange={setValue} />
    </>
  )
}

describe('EmailAutocompleteInput', () => {
  it('U-05: al escribir "juan@" despliega dominios; el clic completa y cierra', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const input = screen.getByRole('combobox', { name: 'Correo' })

    await user.type(input, 'juan@')
    const options = screen.getAllByRole('option')
    expect(options.map((o) => o.textContent)).toContain('juan@gmail.com')
    expect(options.map((o) => o.textContent)).toContain('juan@yahoo.com')

    await user.click(screen.getByRole('option', { name: 'juan@yahoo.com' }))
    expect(input).toHaveValue('juan@yahoo.com')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveFocus()
  })

  it('no muestra lista sin @', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.type(screen.getByRole('combobox'), 'juan')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('permite elegir con flechas + Enter', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const input = screen.getByRole('combobox')

    await user.type(input, 'ana@')
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(screen.getByRole('option', { name: 'ana@hotmail.com' })).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Enter}')
    expect(input).toHaveValue('ana@hotmail.com')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('ArrowUp desde el inicio va a la última opción', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.type(screen.getByRole('combobox'), 'ana@')
    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('option', { name: 'ana@live.com' })).toHaveAttribute('aria-selected', 'true')
  })

  it('Escape cierra la lista sin cambiar el valor', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const input = screen.getByRole('combobox')

    await user.type(input, 'ana@g')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveValue('ana@g')
  })
})
