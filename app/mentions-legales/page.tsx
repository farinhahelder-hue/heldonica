import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';

export const metadata: Metadata = {
  title: 'Mentions légales | Heldonica',
  description:
    "Informations légales de l'éditeur, de l'hébergeur et conditions d'utilisation du site Heldonica.",
  alternates: {
    canonical: 'https://www.heldonica.fr/mentions-legales',
  },
};

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

export default function MentionslégalesPage() {
  return (
    <InlineEditProvider page="mentions-legales">
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
              <p>
                <EditableZone page="mentions-legales" zone="editor_info" type="textarea" fallback="Informations légales complémentaires en cours de mise à jour." />
              </p>
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
