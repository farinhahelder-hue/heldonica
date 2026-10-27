import LogoGenerator from '@/components/admin/LogoGenerator'
import IconPackExplorer from '@/components/admin/IconPackExplorer'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Identité Visuelle, Logo & Icônes — Admin Heldonica',
  description: 'Générateur de logo vectoriel, personnalisation typographique et catalogue d’icônes pour le CMS Heldonica.',
}

export default function AdminBrandingPage() {
  return (
    <div className="space-y-10">
      {/* Générateur de Logo & Sceaux */}
      <section>
        <LogoGenerator />
      </section>

      {/* Explorateur de Pack d'Icônes */}
      <section>
        <IconPackExplorer />
      </section>
    </div>
  )
}
