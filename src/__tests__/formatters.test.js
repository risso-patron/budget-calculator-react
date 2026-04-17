
import { formatCurrency, formatDate } from '../utils/formatters'

describe('formatCurrency', () => {
  it('formats positive numbers — includes the amount', () => {
    const result = formatCurrency(1234.56)
    expect(result).toContain('1,234.56')
  })

  it('formats negative numbers — includes minus and amount', () => {
    const result = formatCurrency(-500.00)
    expect(result).toContain('500')
    expect(result).toMatch(/-/)
  })

  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })

  it('handles very large numbers', () => {
    const result = formatCurrency(1000000)
    expect(result).toContain('1,000,000')
  })

  it('handles decimal precision (rounds correctly)', () => {
    const result = formatCurrency(99.999)
    expect(result).toContain('100')
  })

  it('returns fallback for non-number input', () => {
    expect(formatCurrency('abc')).toBe('$0.00')
    expect(formatCurrency(NaN)).toBe('$0.00')
    expect(formatCurrency(undefined)).toBe('$0.00')
  })
})

describe('formatDate', () => {
  it('formats a valid date string — returns non-empty string', () => {
    const result = formatDate('2024-01-15')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
    expect(result).not.toBe('Fecha inválida')
  })

  it('handles Date objects', () => {
    const date = new Date('2024-01-15')
    const result = formatDate(date)
    expect(result).not.toBe('Fecha inválida')
    expect(typeof result).toBe('string')
  })

  it('handles invalid date string', () => {
    expect(formatDate('invalid')).toBe('Fecha inválida')
  })

  it('handles null', () => {
    expect(formatDate(null)).toBe('Fecha inválida')
  })

  it('handles undefined', () => {
    expect(formatDate(undefined)).toBe('Fecha inválida')
  })
})
