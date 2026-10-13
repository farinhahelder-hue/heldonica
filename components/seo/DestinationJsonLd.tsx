import Script from 'next/script'
import { buildDestinationSchema } from '@/lib/pillar-schema'

export interface DestinationJsonLdProps {
  /** Nom de la destination (ex. « Madère »). */
  name: string
  /** Description courte / accroche de la destination. */
  description: string
  /** URL canonique de la page destination. */
  url: string
  /** Pays ou région de rattachement. */
  country?: string
}

export default function DestinationJsonLd({
  name,
  description,
  url,
  country,
}: DestinationJsonLdProps) {
  const schema = buildDestinationSchema({ name, description, url, country })

  return (
    <Script
      id={`destination-jsonld-${url}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
