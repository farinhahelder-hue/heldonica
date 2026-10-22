import { describe, it, expect } from 'vitest'
import {
  ADDRESS_BOOK,
  ADDRESS_CATEGORIES,
  ADDRESS_DESTINATIONS,
  countAddressEntries,
  getAddressCategory,
  getAddressCountsByCategory,
  getAddressCountsByDestination,
  getAddressDestination,
  getAddressDestinations,
  getAddressEntriesByDestination,
  getAddressEntry,
  isAddressCategory,
} from '@/lib/address-book'
import { FORBIDDEN_WORDS } from '@/lib/brand-voice'

describe("carnet d'adresses", () => {
  it('a au moins une fiche et des destinations', () => {
    expect(countAddressEntries()).toBeGreaterThan(0)
    expect(getAddressDestinations().length).toBeGreaterThan(0)
  })

  it('a des identifiants uniques par destination', () => {
    const keys = ADDRESS_BOOK.map((entry) => `${entry.destination}/${entry.slug}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('ne référence que des destinations déclarées', () => {
    const known = new Set(ADDRESS_DESTINATIONS.map((destination) => destination.slug))
    for (const entry of ADDRESS_BOOK) {
      expect(known.has(entry.destination)).toBe(true)
      expect(getAddressDestination(entry.destination)).toBeDefined()
    }
  })

  it('chaque destination déclarée a au moins une fiche', () => {
    for (const destination of ADDRESS_DESTINATIONS) {
      expect(getAddressEntriesByDestination(destination.slug).length).toBeGreaterThan(0)
    }
  })

  it('chaque fiche est complète et garde sa source', () => {
    for (const entry of ADDRESS_BOOK) {
      expect(entry.name.trim().length).toBeGreaterThan(0)
      expect(entry.city.trim().length).toBeGreaterThan(0)
      expect(entry.lived.trim().length).toBeGreaterThan(20)
      expect(entry.sourceId.trim().length).toBeGreaterThan(0)
      expect(isAddressCategory(entry.category)).toBe(true)
      expect(getAddressCategory(entry.category)).toBeDefined()
    }
  })

  it('les compteurs suivent le contenu', () => {
    expect(countAddressEntries()).toBe(ADDRESS_BOOK.length)
    const byDestination = getAddressDestinations()
    const counts = getAddressCountsByDestination()
    const totalByDestination = byDestination.reduce((total, destination) => {
      const destinationCount = getAddressEntriesByDestination(destination.slug).length
      expect(counts[destination.slug]).toBe(destinationCount)
      return total + destinationCount
    }, 0)
    expect(totalByDestination).toBe(ADDRESS_BOOK.length)
  })

  it('les compteurs par catégorie couvrent toutes les envies', () => {
    const counts = getAddressCountsByCategory()
    const total = ADDRESS_CATEGORIES.reduce((sum, category) => sum + counts[category.key], 0)
    expect(total).toBe(ADDRESS_BOOK.length)
  })

  it('retrouve une fiche par destination et slug', () => {
    const first = ADDRESS_BOOK[0]
    expect(getAddressEntry(first.destination, first.slug)).toEqual(first)
    expect(getAddressEntry(first.destination, 'slug-inexistant')).toBeUndefined()
  })

  it("n'emploie aucun mot banni par la charte", () => {
    const fields = ADDRESS_BOOK.flatMap((entry) => [
      entry.name,
      entry.lived,
      entry.pitfall ?? '',
      entry.sensory ?? '',
    ])
    for (const text of fields) {
      const lower = text.toLowerCase()
      for (const word of FORBIDDEN_WORDS) {
        expect(lower.includes(word), `« ${word} » trouvé dans : ${text}`).toBe(false)
      }
    }
  })
})
