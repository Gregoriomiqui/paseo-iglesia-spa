import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EventInfoBanner } from './EventInfoBanner'

describe('EventInfoBanner', () => {
  it('U-01: muestra las tarifas y las 4 reglas de transporte', () => {
    render(<EventInfoBanner />)

    const fares = screen.getByRole('region', { name: 'Valores por persona' })
    expect(within(fares).getByText('0 a 5 años')).toBeInTheDocument()
    expect(within(fares).getByText('$0')).toBeInTheDocument()
    expect(within(fares).getByText('6 a 10 años')).toBeInTheDocument()
    expect(within(fares).getByText('$4.500')).toBeInTheDocument()
    expect(within(fares).getByText('11 años o más')).toBeInTheDocument()
    expect(within(fares).getByText('$9.000')).toBeInTheDocument()

    const transport = screen.getByRole('region', { name: 'Buses de acercamiento' })
    const rules = within(transport).getAllByRole('listitem')
    expect(rules).toHaveLength(4)
    expect(transport).toHaveTextContent(/menores de 2 años viajan en brazos/i)
    expect(transport).toHaveTextContent(/salida única desde la iglesia/i)
    expect(transport).toHaveTextContent(/la hora de salida se avisará/i)
    expect(transport).toHaveTextContent(/la única parada es la iglesia/i)
  })
})
