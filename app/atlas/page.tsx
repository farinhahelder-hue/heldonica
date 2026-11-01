import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DynamicAtlas from '@/components/DynamicAtlas'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Atlas Cartographique — Heldonica Slow Travel',
  description:
    'L\'Atlas vivant des routes, tracés GPX, hébergements vérifiés et pépites isolées arpentées par le duo Heldonica à Madère, au Monténégro, en Roumanie, en Suisse et au Portugal.',
  openGraph: {
    title: 'Atlas Cartographique — Heldonica Slow Travel',
    description:
      'L\'Atlas vivant des routes, tracés GPX, hébergements vérifiés et pépites isolées arpentées par le duo Heldonica.',
    url: 'https://www.heldonica.fr/atlas',
  },
}

export default function AtlasPage() {
  return (
    <>
      <Header />
      <main className="w-full min-h-screen bg-[#FAF9F5] pt-14">
        <DynamicAtlas />
      </main>
      <Footer />
    </>
  )
}
