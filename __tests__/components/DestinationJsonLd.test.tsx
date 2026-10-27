import { render } from '@testing-library/react'
import DestinationJsonLd from '@/components/seo/DestinationJsonLd'
import { describe, it, expect } from 'vitest'

describe('DestinationJsonLd', () => {
  it('renders valid JSON-LD with required E-E-A-T author and base properties', () => {
    const { container } = render(
      <DestinationJsonLd
        name="Madère"
        description="Une île portugaise slow travel."
        url="https://www.heldonica.fr/destinations/madere"
      />
    )

    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).toBeInTheDocument()

    const json = JSON.parse(script!.innerHTML)

    expect(json['@context']).toBe('https://schema.org')
    expect(json['@type']).toEqual(['TouristDestination', 'TouristTrip', 'Place'])
    expect(json.name).toBe('Madère')
    expect(json.description).toBe('Une île portugaise slow travel.')
    expect(json.url).toBe('https://www.heldonica.fr/destinations/madere')
    
    // E-E-A-T
    expect(json.author).toBeDefined()
    expect(json.author['@type']).toBe('Organization')
    expect(json.author.name).toBe('Heldonica')
    expect(json.author.url).toBe('https://www.heldonica.fr')
  })

  it('includes geo coordinates when provided', () => {
    const { container } = render(
      <DestinationJsonLd
        name="Suisse"
        description="Montagnes et lacs."
        url="https://www.heldonica.fr/destinations/suisse"
        latitude={46.8182}
        longitude={8.2275}
      />
    )

    const script = container.querySelector('script[type="application/ld+json"]')
    const json = JSON.parse(script!.innerHTML)

    expect(json.geo).toBeDefined()
    expect(json.geo['@type']).toBe('GeoCoordinates')
    expect(json.geo.latitude).toBe(46.8182)
    expect(json.geo.longitude).toBe(8.2275)
  })

  it('includes address when country or region is provided', () => {
    const { container } = render(
      <DestinationJsonLd
        name="Corse"
        description="L'île de beauté."
        url="https://www.heldonica.fr/destinations/corse"
        country="France"
        region="Corse"
      />
    )

    const script = container.querySelector('script[type="application/ld+json"]')
    const json = JSON.parse(script!.innerHTML)

    expect(json.address).toBeDefined()
    expect(json.address['@type']).toBe('PostalAddress')
    expect(json.address.addressCountry).toBe('France')
    expect(json.address.addressRegion).toBe('Corse')
  })

  it('escapes special characters safely in JSON.stringify', () => {
    const maliciousDesc = 'Test "quotes" and <script>alert("XSS")</script> \ slashes'
    const { container } = render(
      <DestinationJsonLd
        name="Hacking Land"
        description={maliciousDesc}
        url="https://www.heldonica.fr/destinations/hack"
      />
    )

    const script = container.querySelector('script[type="application/ld+json"]')
    
    // Test that the raw HTML contains the escaped less-than character, preventing XSS breakouts
    expect(script!.innerHTML).toContain('\\u003cscript>alert(\\"XSS\\")\\u003c/script>')
  })
})
