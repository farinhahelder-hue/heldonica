import Header from '@/components/Header'
import HeroVideo from '@/components/HeroVideo'
import Pillars from '@/components/Pillars'
import Services from '@/components/Services'
import Destinations from '@/components/Destinations'
import Blog from '@/components/Blog'
import Newsletter from '@/components/Newsletter'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <HeroVideo />
      <Pillars />
      <Services />
      <Destinations />
      <Blog />
      <Newsletter />
      <Footer />
    </>
  )
}
