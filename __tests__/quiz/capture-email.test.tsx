import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Les coquilles du site ne sont pas le sujet : on les neutralise pour isoler
// le seul comportement ajoute — le formulaire apparait au resultat, et il poste
// le profil du quiz comme source.
vi.mock('@/components/Header', () => ({ default: () => null }))
vi.mock('@/components/Footer', () => ({ default: () => null }))
vi.mock('@/components/inline-edit/InlineEditProvider', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useEditableContext: () => ({
    zones: {},
    isEditing: false,
    registerZone: () => {},
    unregisterZone: () => {},
  }),
}))
vi.mock('@/components/inline-edit/EditableZone', () => ({
  default: ({ fallback }: { fallback: string }) => <>{fallback}</>,
}))

import QuizPage from '@/app/quiz/page'

// Le quiz passe a la question suivante dans un setTimeout : on laisse ce delai
// s'ecouler dans act() pour que la mise a jour soit celle du navigateur.
const attendre = (ms = 400) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms))
  })

describe('quiz — capture email au resultat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('affiche le formulaire apres la derniere question et poste le profil', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    global.fetch = fetchMock as unknown as typeof fetch

    const user = userEvent.setup()
    render(<QuizPage />)

    // Cinq fois la premiere option : profil « aventure ».
    for (let i = 0; i < 5; i++) {
      const options = screen.getAllByRole('button')
      await user.click(options[0])
      await attendre()
    }

    expect(screen.getByText("L'Aventurier")).toBeTruthy()

    const champ = screen.getByLabelText('Ton adresse email')
    await user.type(champ, 'couple@example.com')
    await user.click(screen.getByRole('button', { name: 'Recevoir mon profil' }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/newsletter')
    expect(JSON.parse(init.body)).toMatchObject({
      email: 'couple@example.com',
      source: 'quiz-aventure',
      website_url: '',
    })

    expect(await screen.findByText(/C'est envoyé/)).toBeTruthy()
    // Le quiz impose 300 ms entre deux questions : sous charge, la suite
    // complete depasse le delai par defaut de 5 s.
  }, 15_000)

  it('garde le resultat lisible et signale un echec sans le masquer', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    global.fetch = fetchMock as unknown as typeof fetch

    const user = userEvent.setup()
    render(<QuizPage />)

    for (let i = 0; i < 5; i++) {
      const options = screen.getAllByRole('button')
      await user.click(options[0])
      await attendre()
    }

    await user.type(screen.getByLabelText('Ton adresse email'), 'couple@example.com')
    await user.click(screen.getByRole('button', { name: 'Recevoir mon profil' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("L'envoi n'a pas abouti")
    // Le profil reste affiche : l'echec d'envoi ne coute pas le resultat.
    expect(screen.getByText("L'Aventurier")).toBeTruthy()
  }, 15_000)
})
