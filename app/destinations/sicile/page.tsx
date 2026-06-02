import DestinationPage from '../[slug]/DestinationPage'

export { generateMetadata } from '../[slug]/DestinationPage'

export default function SicilePage({ params }: { params: { slug: string } }) {
  return <DestinationPage params={{ slug: 'sicile' }} />
}