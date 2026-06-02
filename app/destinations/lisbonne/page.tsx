import DestinationPage from '../[slug]/DestinationPage'

export { generateMetadata } from '../[slug]/DestinationPage'

export default function LisbonnePage() {
  return <DestinationPage params={{ slug: 'lisbonne' }} />
}