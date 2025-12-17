import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '../components/Shared/Button'

describe('Button Component', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    render(<Button>Primary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gradient-primary')
  })

  it('applies danger variant correctly', () => {
    render(<Button variant="danger">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gradient-danger')
  })

  it('handles click events', async () => {
    let clicked = false
    const handleClick = () => { clicked = true }
    
    render(<Button onClick={handleClick}>Click</Button>)
    
    const button = screen.getByRole('button')
    button.click()
    
    expect(clicked).toBe(true)
  })

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})
