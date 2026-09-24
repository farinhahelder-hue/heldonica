import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import { getPageZones } from '@/lib/cms-zones'
import EditableZone from '@/components/inline-edit/EditableZone';
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
  title: 'Mentions légales | Heldonica',
  description:
    "Informations légales de l'éditeur, de l'hébergeur et conditions d'utilisation du site Heldonica.",
  alternates: {
    canonical: 'https://www.heldonica.fr/mentions-legales',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('mentions-legales', metadata)
}


function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-serif font-bold text-mahogany">{title}</h2>
      <div className="space-y-3 text-charcoal">{children}</div>
    </section>
  );
}

/**
 * Mentions d'identification exigées de l'éditeur par la LCEN (art. 6-III) et
 * l'article R123-237 du Code de commerce.
 *
 * Jusqu'ici, tout cela tenait dans une seule zone de texte libre `editor_info`,
 * dont la valeur affichée était « Informations légales complémentaires en cours
 * de mise à jour ». Une zone libre ne dit pas ce qui manque ; une liste de
 * mentions nommées, si.
 *
 * Chaque ligne n'est rendue que si elle est renseignée dans le CMS : une
 * mention vide disparaît au lieu d'afficher un libellé sans valeur.
 */
const EDITOR_LEGAL_FIELDS: { zone: string; label: string }[] = [
  { zone: 'editor_legal_form', label: 'Forme juridique' },
  { zone: 'editor_capital', label: 'Capital social' },
  { zone: 'editor_address', label: 'Adresse du siège social' },
  { zone: 'editor_siren', label: 'SIREN' },
  { zone: 'editor_siret', label: 'SIRET' },
  { zone: 'editor_rcs', label: 'RCS' },
  { zone: 'editor_vat', label: 'TVA intracommunautaire' },
  { zone: 'editor_phone', label: 'Téléphone' },
  { zone: 'editor_publication_director', label: 'Directeur de la publication' },
];

export default async function MentionslégalesPage() {
  const zones = await getPageZones('mentions-legales')
  return (
    <InlineEditProvider page="mentions-legales" initialZones={zones}>
      <Header />
      <Breadcrumb />
      <main className="bg-white">
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-xs uppercase tracking-[0.16em] text-eucalyptus font-semibold mb-3">
              <EditableZone page="mentions-legales" zone="hero_badge" fallback="Cadre légal" />
            </p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-mahogany mb-5">
              <EditableZone page="mentions-legales" zone="hero_title" fallback="Mentions légales" />
            </h1>
            <p className="text-lg text-charcoal/80">
              <EditableZone page="mentions-legales" zone="hero_subtitle" fallback="Informations légales du site heldonica.fr, de son éditeur et de son hébergeur." />
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6 space-y-12">
            <div className="rounded-2xl border border-mahogany/20 bg-cloud-dancer/50 p-6 text-charcoal">
              <p className="text-sm text-charcoal/60">
                <EditableZone page="mentions-legales" zone="last_update" fallback="Dernière mise à jour : 16 avril 2026" />
              </p>
            </div>

            <LegalSection title="Identité de l'éditeur">
              <p>
                <strong>Nom commercial :</strong> <EditableZone page="mentions-legales" zone="editor_name" fallback="Heldonica" />
              </p>

              {EDITOR_LEGAL_FIELDS.map((field) => {
                const value = zones[`mentions-legales__${field.zone}`]?.trim()
                if (!value) return null
                return (
                  <p key={field.zone}>
                    <strong>{field.label} :</strong>{' '}
                    <EditableZone page="mentions-legales" zone={field.zone} fallback={value} />
                  </p>
                )
              })}

              {/* Tant qu'aucune mention structurée n'est renseignée, on continue
                  d'afficher la zone de texte libre historique — sinon la section
                  se réduirait au seul nom commercial. */}
              {!EDITOR_LEGAL_FIELDS.some((f) => zones[`mentions-legales__${f.zone}`]?.trim()) && (
                <p>
                  <EditableZone page="mentions-legales" zone="editor_info" type="textarea" fallback="Informations légales complémentaires en cours de mise à jour." />
                </p>
              )}
              <p>
                <strong>Email de contact :</strong>{' '}
                <a
                  href="mailto:contact@heldonica.fr"
                  className="text-eucalyptus hover:text-teal transition"
                >
                  contact@heldonica.fr
                </a>
              </p>
            </LegalSection>

            <LegalSection title="Hébergeur">
              <p>
                <strong>Société :</strong> <EditableZone page="mentions-legales" zone="host_name" fallback="Vercel Inc." />
              </p>
              <p>
                <strong>Adresse :</strong> <EditableZone page="mentions-legales" zone="host_address" fallback="340 S Lemon Ave #4133, Walnut, CA 91789, USA" />
              </p>
              <p>
                <strong>Site web :</strong>{' '}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-eucalyptus hover:text-teal transition"
                >
                  https://vercel.com
                </a>
              </p>
            </LegalSection>

            <LegalSection title="Propriété intellectuelle">
              <EditableZone page="mentions-legales" zone="intellectual_property_text" type="textarea" fallback="L'ensemble des contenus présents sur heldonica.fr (textes, visuels, vidéos, éléments graphiques, structure et code) est protégé par le droit de la propriété intellectuelle. Toute reproduction, diffusion, adaptation ou exploitation, totale ou partielle, sans autorisation préalable écrite de Heldonica est interdite."
                className="block"
              />
              <p>
                <strong>Credits photo :</strong> <EditableZone page="mentions-legales" zone="photo_credits" fallback="Heldonica et banques d'images sous licence." />
              </p>
            </LegalSection>

            <LegalSection title="Limitation de responsabilité">
              <EditableZone page="mentions-legales" zone="liability_text" type="textarea" fallback="Heldonica s'efforce de fournir des informations fiables et à jour, sans garantie d'exhaustivité ou d'absence d'erreur. Heldonica ne pourra être tenue responsable des dommages directs ou indirects liés à l'utilisation du site, à l'indisponibilité temporaire du service ou à l'usage d'informations externes référencées. Les liens sortants sont fournis à titre informatif et n'emportent pas validation de leur contenu."
                className="block"
              />
            </LegalSection>

            <LegalSection title="Contact légal">
              <p>
                Pour toute demande légale ou RGPD, vous pouvez nous écrire à{' '}
                <a
                  href="mailto:contact@heldonica.fr"
                  className="text-eucalyptus hover:text-teal transition"
                >
                  contact@heldonica.fr
                </a>
                .
              </p>
            </LegalSection>

            <LegalSection title="Copyright">
              <p>
                <strong>&copy; Heldonica 2026</strong> <EditableZone page="mentions-legales" zone="copyright_text" fallback="- Tous droits reserves." />
              </p>
            </LegalSection>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  );
}
