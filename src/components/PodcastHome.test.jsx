import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PodcastHome from './PodcastHome'

describe('PodcastHome', () => {
  it('renders podcast title', () => {
    render(<PodcastHome />)
    expect(screen.getByText(/Fine Print of the Future/i)).toBeInTheDocument()
  })
})
