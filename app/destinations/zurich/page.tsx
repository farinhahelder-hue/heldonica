import DestinationPage from '../[slug]/DestinationPage'

export { generateMetadata } from '../[slug]/DestinationPage'

export default function ZurichPage() {
  return <DestinationPage params={{ slug: 'zurich' }} />
}