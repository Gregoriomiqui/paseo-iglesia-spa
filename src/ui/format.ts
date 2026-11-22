const clp = new Intl.NumberFormat('es-CL', { useGrouping: 'always', maximumFractionDigits: 0 })

/** 4500 → "$4.500" */
export function formatCLP(amount: number): string {
  return `$${clp.format(amount)}`
}
