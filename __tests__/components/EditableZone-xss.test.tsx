import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import EditableZone from '@/components/inline-edit/EditableZone'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'

function rendre(valeur: string) {
  return render(
    <InlineEditProvider page="test-xss" initialZones={{ 'test-xss__xss_zone': valeur }}>
      <EditableZone page="test-xss" zone="xss_zone" fallback="Fallback" />
    </InlineEditProvider>
  )
}

describe('EditableZone - XSS Mitigation', () => {
  it('strips script tags from the injected HTML', () => {
    const maliciousPayload = '<p>Safe Text</p><script>alert("XSS")</script>'
    const { container } = rendre(maliciousPayload)
    const html = container.innerHTML

    // The script should be removed
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('alert("XSS")')
    // Safe text should remain
    expect(html).toContain('Safe Text')
  })

  it('strips malicious event handlers like onerror', () => {
    const maliciousPayload = '<img src="x" onerror="alert(1)" />'
    const { container } = rendre(maliciousPayload)
    const html = container.innerHTML

    // The image tag is allowed, but the onerror handler must be stripped
    expect(html).not.toContain('onerror')
    expect(html).not.toContain('alert(1)')
  })
})
