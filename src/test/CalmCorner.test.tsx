import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import CalmCorner from '../pages/CalmCorner'
import { MemoryRouter } from 'react-router-dom'

function renderCalmCorner() {
  return render(
    <MemoryRouter>
      <CalmCorner />
    </MemoryRouter>
  )
}

describe('Calm Corner – breathing cycle', () => {
  it('renders the breathing section heading', () => {
    renderCalmCorner()
    expect(screen.getByRole('heading', { name: /Breathing Exercise/i })).toBeInTheDocument()
  })

  it('shows Start Breathing button initially', () => {
    renderCalmCorner()
    expect(screen.getByRole('button', { name: /start breathing/i })).toBeInTheDocument()
  })

  it('transitions to inhale phase after starting', async () => {
    vi.useFakeTimers()
    renderCalmCorner()
    const startBtn = screen.getByRole('button', { name: /start breathing/i })

    await act(async () => {
      fireEvent.click(startBtn)
    })

    // After start the phase text should appear
    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    // Stop button should now be visible
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('shows Stop button when breathing is running', async () => {
    renderCalmCorner()
    const startBtn = screen.getByRole('button', { name: /start breathing/i })
    await act(async () => { fireEvent.click(startBtn) })
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
  })

  it('returns to idle when Stop is clicked', async () => {
    renderCalmCorner()
    const startBtn = screen.getByRole('button', { name: /start breathing/i })
    await act(async () => { fireEvent.click(startBtn) })
    const stopBtn = screen.getByRole('button', { name: /stop/i })
    await act(async () => { fireEvent.click(stopBtn) })
    expect(screen.getByRole('button', { name: /start breathing/i })).toBeInTheDocument()
  })

  it('renders mood check-in section', () => {
    renderCalmCorner()
    expect(screen.getByRole('heading', { name: /Mood Check-In/i })).toBeInTheDocument()
  })

  it('logs a mood when a mood button is clicked', async () => {
    renderCalmCorner()
    const happyBtn = screen.getByRole('button', { name: /log mood: happy/i })
    await act(async () => { fireEvent.click(happyBtn) })
    expect(screen.getByText(/Recent check-ins/i)).toBeInTheDocument()
  })
})
