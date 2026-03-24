import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'heldonica',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-03-24',
  useCdn: true,
})

const builder = imageUrlBuilder(client)

export const urlFor = (source: any) => builder.image(source)

export default client
