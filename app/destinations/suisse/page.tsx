import DestinationPage from '../[slug]/DestinationPage'

export { generateMetadata } from '../[slug]/DestinationPage'

export default function SuissePage() {
  return <DestinationPage params={{ slug: 'suisse' }} />
}