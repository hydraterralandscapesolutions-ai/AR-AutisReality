import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Resources, { RESOURCES } from '../pages/Resources'

describe('Resources page', () => {
  it('renders the page heading', () => {
    render(<MemoryRouter><Resources /></MemoryRouter>)
    expect(screen.getByText(/Parent Resources/i)).toBeInTheDocument()
  })

  it('renders all resource cards', () => {
    render(<MemoryRouter><Resources /></MemoryRouter>)
    RESOURCES.forEach(resource => {
      expect(screen.getByText(resource.title)).toBeInTheDocument()
    })
  })

  it('renders exactly 5 resource cards', () => {
    render(<MemoryRouter><Resources /></MemoryRouter>)
    // articles use role="listitem" to be part of the list,
    // so query by listitem and filter to the card items
    const listitems = screen.getAllByRole('listitem')
    expect(listitems).toHaveLength(5)
  })

  it('each card has a Learn More link', () => {
    render(<MemoryRouter><Resources /></MemoryRouter>)
    const learnMoreLinks = screen.getAllByRole('link', { name: /learn more/i })
    expect(learnMoreLinks.length).toBeGreaterThanOrEqual(5)
  })

  it('renders resource tags', () => {
    render(<MemoryRouter><Resources /></MemoryRouter>)
    expect(screen.getByText('Foundational')).toBeInTheDocument()
    expect(screen.getByText('Communication')).toBeInTheDocument()
    expect(screen.getByText('Sensory')).toBeInTheDocument()
  })
})
