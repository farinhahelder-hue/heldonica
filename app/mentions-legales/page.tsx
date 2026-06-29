import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Mentions légales | Heldonica',
  description:
    "Informations légales de l’éditeur, de l’hébergeur et conditions d’utilisation du site Heldonica.",
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
    <>
      <Header />
      <Breadcrumb />
      <main className="bg-white">
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-xs uppercase tracking-[0.16em] text-eucalyptus font-semibold mb-3">
              Cadre légal
            </p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-mahogany mb-5">
              Mentions légales
            </h1>
            <p className="text-lg text-charcoal/80">
              Informations légales du site heldonica.fr, de son éditeur et de son hébergeur.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6 space-y-12">
            <div className="rounded-2xl border border-mahogany/20 bg-cloud-dancer/50 p-6 text-charcoal">
              <p className="text-sm text-charcoal/60">
                Dernière mise à jour : 16 avril 2026
              </p>
            </div>

            <LegalSection title="Identité de l’éditeur">
              <p>
                <strong>Nom commercial :</strong> Heldonica
              </p>
              <p>
                Informations légales complémentaires en cours de mise à jour.
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
                <strong>Société :</strong> Vercel Inc.
              </p>
              <p>
                <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA
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
              <p>
                L’ensemble des contenus presents sur heldonica.fr (textes, visuels, videos,
                elements graphiques, structure et code) est protege par le droit de la propriete
                intellectuelle.
              </p>
              <p>
                Toute reproduction, diffusion, adaptation ou exploitation, totale ou partielle,
                sans autorisation préalable écrite de Heldonica est interdite.
              </p>
              <p>
                <strong>Credits photo :</strong> Heldonica et banques d’images sous licence.
              </p>
            </LegalSection>

            <LegalSection title="Limitation de responsabilite">
              <p>
                Heldonica s’efforce de fournir des informations fiables et a jour, sans garantie
                d’exhaustivité ou d’absence d’erreur.
              </p>
              <p>
                Heldonica ne pourra etre tenue responsable des dommages directs ou indirects lies a
                l’utilisation du site, a l’indisponibilité temporaire du service ou a l’usage
                d’informations externes referencees.
              </p>
              <p>
                Les liens sortants sont fournis a titre informatif et n’emportent pas validation de
                leur contenu.
              </p>
            </LegalSection>

            <LegalSection title="Contact légal">
              <p>
                Pour toute demande légale ou RGPD, vous pouvez nous écrire a{' '}
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
                <strong>&copy; Heldonica 2026</strong> - Tous droits reserves.
              </p>
            </LegalSection>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
