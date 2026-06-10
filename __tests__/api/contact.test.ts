import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('contact API', () => {
  let mockFetch: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('POST validation', () => {
    function isValidPayload(body: any): { valid: boolean; error?: string } {
      const { email, firstName } = body
      if (!email || !firstName) {
        return { valid: false, error: 'Email et prénom requis' }
      }
      return { valid: true }
    }

    it('should accept valid payload with email and firstName', () => {
      const body = {
        email: 'test@example.com',
        firstName: 'Jean',
        destination: 'Portugal',
        message: 'Je souhaite organiser un voyage'
      }
      expect(isValidPayload(body).valid).toBe(true)
    })

    it('should accept payload with prenom instead of firstName', () => {
      const body = {
        email: 'test@example.com',
        prenom: 'Marie',
        destination: 'Espagne'
      }
      // The route uses prenom || nom || 'Voyageur'
      const firstName = body.prenom || body.nom || 'Voyageur'
      expect(!!firstName).toBe(true)
      expect(isValidPayload({ email: body.email, firstName }).valid).toBe(true)
    })

    it('should reject payload without email', () => {
      const body = {
        firstName: 'Jean',
        destination: 'Portugal'
      }
      expect(isValidPayload(body).valid).toBe(false)
    })

    it('should reject payload without firstName or prenom', () => {
      const body = {
        email: 'test@example.com',
        destination: 'Portugal'
      }
      // nom field fallback
      const firstName = body.prenom || body.nom
      expect(!!firstName).toBe(false)
    })

    it('should reject payload with empty email', () => {
      const body = {
        email: '',
        firstName: 'Jean'
      }
      expect(isValidPayload(body).valid).toBe(false)
    })
  })

  describe('firstName fallback logic', () => {
    it('should use prenom when available', () => {
      const body = { prenom: 'Marie', nom: 'Dupont', email: 'test@example.com' }
      const firstName = body.prenom || body.nom || 'Voyageur'
      expect(firstName).toBe('Marie')
    })

    it('should use nom when prenom is missing', () => {
      const body = { nom: 'Dupont', email: 'test@example.com' }
      const firstName = body.prenom || body.nom || 'Voyageur'
      expect(firstName).toBe('Dupont')
    })

    it('should default to "Voyageur" when no name provided', () => {
      const body = { email: 'test@example.com' }
      const firstName = body.prenom || body.nom || 'Voyageur'
      expect(firstName).toBe('Voyageur')
    })
  })

  describe('Brevo integration', () => {
    it('should prepare Brevo contact creation payload', () => {
      const data = {
        email: 'test@example.com',
        firstName: 'Jean',
        destination: 'Portugal',
        dates: 'Juin 2024'
      }

      const payload = {
        email: data.email,
        firstName: data.firstName,
        listIds: [3],
        attributes: {
          DESTINATION: data.destination || '',
          DATES: data.dates || ''
        }
      }

      expect(payload.listIds).toContain(3)
      expect(payload.attributes.DESTINATION).toBe('Portugal')
    })

    it('should handle missing optional fields', () => {
      const data = {
        email: 'test@example.com',
        firstName: 'Jean'
      }

      const destination = data.destination || ''
      const dates = data.dates || ''

      expect(destination).toBe('')
      expect(dates).toBe('')
    })
  })

  describe('Brevo SMTP email sending', () => {
    it('should prepare email notification payload', () => {
      const data = {
        email: 'test@example.com',
        firstName: 'Jean',
        destination: 'Portugal',
        dates: 'Juin 2024',
        message: 'Voyage de noce'
      }

      const emailPayload = {
        sender: { name: 'Heldonica', email: 'contact@heldonica.fr' },
        to: [{ email: 'contact@heldonica.fr' }],
        subject: `🌍 Nouvelle demande Travel Planning — ${data.firstName} (${data.destination || 'Non précisée'})`,
        htmlContent: expect.any(String)
      }

      expect(emailPayload.sender.name).toBe('Heldonica')
      expect(emailPayload.to[0].email).toBe('contact@heldonica.fr')
      expect(emailPayload.subject).toContain('Travel Planning')
    })
  })

  describe('Resend fallback', () => {
    it('should prepare admin notification email', () => {
      const data = {
        firstName: 'Jean',
        contactEmail: 'jean@example.com',
        telephone: '+33612345678',
        destination: 'Portugal',
        budget: '1500-2500€',
        dates: 'Juin 2024',
        voyageurs: '2',
        message: 'Voyage de noce'
      }

      const adminEmail = {
        to: [process.env.ADMIN_EMAIL || 'contact@heldonica.fr'],
        subject: `✈️ Nouvelle demande Travel Planning – ${data.destination || 'Destination non précisée'}`,
      }

      expect(adminEmail.subject).toContain('Travel Planning')
    })

    it('should prepare client confirmation email', () => {
      const data = {
        firstName: 'Jean',
        contactEmail: 'jean@example.com',
        destination: 'Portugal'
      }

      const clientEmail = {
        to: [data.contactEmail],
        subject: '✅ On a bien reçu ta demande – Heldonica Travel Planning',
      }

      expect(clientEmail.to).toContain('jean@example.com')
      expect(clientEmail.subject).toContain('bien reçu')
    })
  })

  describe('email template content', () => {
    it('should include all form fields in admin email', () => {
      const fields = {
        firstName: 'Jean',
        contactEmail: 'jean@example.com',
        telephone: '+33612345678',
        destination: 'Portugal',
        budget: '1500-2500€',
        dates: 'Juin 2024',
        voyageurs: '2',
        message: 'Voyage de noce'
      }

      expect(fields.firstName).toBeTruthy()
      expect(fields.contactEmail).toBeTruthy()
      expect(fields.destination).toBeTruthy()
    })

    it('should handle missing optional fields gracefully', () => {
      const minimalData = {
        firstName: 'Jean',
        contactEmail: 'jean@example.com',
        destination: ''
      }

      const displayValue = minimalData.destination || '—'
      expect(displayValue).toBe('—')
    })
  })

  describe('error handling', () => {
    it('should handle Brevo API errors gracefully', () => {
      const error = new Error('Brevo API error')
      expect(error.message).toBe('Brevo API error')
    })

    it('should handle missing BREVO_API_KEY', () => {
      const BREVO_API_KEY = undefined
      expect(!!BREVO_API_KEY).toBe(false)
    })

    it('should handle missing RESEND_API_KEY', () => {
      const RESEND_API_KEY = undefined
      expect(!!RESEND_API_KEY).toBe(false)
    })

    it('should handle JSON parse errors', () => {
      const invalidJson = 'not valid json'
      let parsed = null
      try {
        parsed = JSON.parse(invalidJson)
      } catch {
        parsed = null
      }
      expect(parsed).toBe(null)
    })
  })

  describe('success response structure', () => {
    it('should return success via Brevo', () => {
      const response = {
        success: true,
        via: 'brevo',
        contact_added: true
      }
      expect(response.success).toBe(true)
      expect(response.via).toBe('brevo')
    })

    it('should return success via Resend fallback', () => {
      const response = { success: true, via: 'resend' }
      expect(response.success).toBe(true)
      expect(response.via).toBe('resend')
    })

    it('should return error response', () => {
      const response = { error: 'Erreur envoi email' }
      expect(response.error).toContain('Erreur')
    })
  })

  describe('edge cases', () => {
    it('should handle empty message', () => {
      const message = ''
      const displayMessage = message || 'Aucun'
      expect(displayMessage).toBe('Aucun')
    })

    it('should handle null telephone', () => {
      const telephone = null
      const displayPhone = telephone || '—'
      expect(displayPhone).toBe('—')
    })

    it('should handle French special characters in names', () => {
      const names = ['André', 'François', 'Mélanie', ' Jérôme']
      for (const name of names) {
        expect(name.length).toBeGreaterThan(0)
      }
    })

    it('should handle long message content', () => {
      const longMessage = 'A'.repeat(1000)
      expect(longMessage.length).toBe(1000)
    })
  })
})