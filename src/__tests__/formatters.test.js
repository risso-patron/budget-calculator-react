import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate } from '../utils/formatters'

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats negative numbers correctly', () => {
    expect(formatCurrency(-500.00)).toBe('-$500.00')
  })

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('handles very large numbers', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00')
  })

  it('handles decimal precision', () => {
    expect(formatCurrency(99.999)).toBe('$100.00')
  })
})

describe('formatDate', () => {
  it('formats date string correctly', () => {
    const result = formatDate('2024-01-15')
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
  })

  it('handles Date objects', () => {
    const date = new Date('2024-01-15')
    const result = formatDate(date)
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
  })

  it('handles invalid dates gracefully', () => {
    expect(formatDate('invalid')).toBe('Fecha inválida')
  })

  it('handles null/undefined', () => {
    expect(formatDate(null)).toBe('Fecha inválida')
    expect(formatDate(undefined)).toBe('Fecha inválida')
  })
})
