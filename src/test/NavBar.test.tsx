import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NavBar from '../components/NavBar'

describe('NavBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the logo text', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    )
    expect(screen.getByText(/AutisReality/i)).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    )
    // Use getAllByRole to handle the logo link also matching 'Home'
    const homeLinks = screen.getAllByRole('link', { name: /^Home$/i })
    expect(homeLinks.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('link', { name: /Resources/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Games/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Rewards/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Calm Corner/i })).toBeInTheDocument()
  })

  it('hamburger button toggles aria-expanded', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    )
    const burger = screen.getByRole('button', { name: /open navigation menu/i })
    expect(burger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(burger)
    expect(burger).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows close label when menu is open', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    )
    const burger = screen.getByRole('button', { name: /open navigation menu/i })
    fireEvent.click(burger)
    expect(screen.getByRole('button', { name: /close navigation menu/i })).toBeInTheDocument()
  })
})
