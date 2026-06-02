import DestinationPage from '../[slug]/DestinationPage'

export { generateMetadata } from '../[slug]/DestinationPage'

export default function ParisPage() {
  return <DestinationPage params={{ slug: 'paris' }} />
}