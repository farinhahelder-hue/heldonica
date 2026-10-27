import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AgentTaskGiver from '@/components/admin/AgentTaskGiver'

describe('AgentTaskGiver', () => {
  it('renders target selector with Google Jules, Gemini, Groq, and Brain Local', () => {
    render(<AgentTaskGiver />)

    expect(screen.getByText(/Donneur de Tâches IA & Pilotage Jules/i)).toBeInTheDocument()
    expect(screen.getByText('Google Jules')).toBeInTheDocument()
    expect(screen.getByText('Gemini 2.5 Flash')).toBeInTheDocument()
    expect(screen.getByText('Groq (GPT-OSS-120B)')).toBeInTheDocument()
    expect(screen.getByText('Heldonica Brain Local')).toBeInTheDocument()
  })

  it('pre-fills prompt when clicking a task preset', () => {
    render(<AgentTaskGiver />)

    const presetBtn = screen.getByText('Audit SEO Géo & Schema.org')
    fireEvent.click(presetBtn)

    expect(screen.getByDisplayValue(/Analyse les signaux SEO et Schema.org/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue(/Audit sémantique et géo-balisage/i)).toBeInTheDocument()
  })

  it('toggles GitHub branch field when target is Jules', () => {
    render(<AgentTaskGiver />)

    expect(screen.getByText(/Branche GitHub de départ/i)).toBeInTheDocument()

    const geminiBtn = screen.getByText('Gemini 2.5 Flash')
    fireEvent.click(geminiBtn)

    expect(screen.queryByText(/Branche GitHub de départ/i)).not.toBeInTheDocument()
  })
})
