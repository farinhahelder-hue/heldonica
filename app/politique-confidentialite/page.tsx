import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';

export const metadata: Metadata = {
  title: 'Politique de confidentialité | Heldonica',
  description:
    "Politique de confidentialité et traitement des données personnelles du site Heldonica.",
  alternates: {
    canonical: 'https://www.heldonica.fr/politique-confidentialite',
  },
};

function PrivacySection({
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

export default function politiqueconfidentialitePage() {
  return (
    <InlineEditProvider page="politique-confidentialite">
      <Header />
      <Breadcrumb />
      <main className="bg-white">
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-xs uppercase tracking-[0.16em] text-eucalyptus font-semibold mb-3">
              <EditableZone page="politique-confidentialite" zone="hero_badge" fallback="données personnelles" />
            </p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-mahogany mb-5">
              <EditableZone page="politique-confidentialite" zone="hero_title" fallback="Politique de confidentialité" />
            </h1>
            <p className="text-lg text-charcoal/80">
              <EditableZone page="politique-confidentialite" zone="hero_subtitle" type="textarea" fallback="Cette page détaille la collecte, l'usage et la conservation de vos données sur heldonica.fr." />
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6 space-y-12">
            <PrivacySection title="Données collectées">
              <p>
                Selon votre usage du site, Heldonica peut collecter les catégories de données
                suivantes :
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><EditableZone page="politique-confidentialite" zone="data_1" fallback="données d'identification : nom, prénom, email, téléphone." /></li>
                <li><EditableZone page="politique-confidentialite" zone="data_2" fallback="données de projet : informations fournies via les formulaires de voyage." /></li>
                <li><EditableZone page="politique-confidentialite" zone="data_3" fallback="données techniques : adresse IP, type d'appareil, navigateur, logs." /></li>
                <li><EditableZone page="politique-confidentialite" zone="data_4" fallback="données marketing : interactions newsletter, consentement cookies, campagnes." /></li>
              </ul>
            </PrivacySection>

            <PrivacySection title="Finalités du traitement">
              <p>Les données sont traitées pour :</p>
              <ul className="list-disc list-inside space-y-2">
                <li><EditableZone page="politique-confidentialite" zone="purpose_1" fallback="Répondre à vos demandes de contact et de travel planning." /></li>
                <li><EditableZone page="politique-confidentialite" zone="purpose_2" fallback="Exécuter une prestation (accompagnement voyage, suivi client)." /></li>
                <li><EditableZone page="politique-confidentialite" zone="purpose_3" fallback="Envoyer des contenus newsletter si vous y avez consenti." /></li>
                <li><EditableZone page="politique-confidentialite" zone="purpose_4" fallback="Mesurer l'audience et améliorer le site après consentement cookies." /></li>
                <li><EditableZone page="politique-confidentialite" zone="purpose_5" fallback="Respecter les obligations légales et comptables applicables." /></li>
              </ul>
            </PrivacySection>

            <PrivacySection title="Bases légales">
              <ul className="list-disc list-inside space-y-2">
                <li><EditableZone page="politique-confidentialite" zone="legal_1" fallback="Exécution précontractuelle ou contractuelle (demandes et prestations)." /></li>
                <li><EditableZone page="politique-confidentialite" zone="legal_2" fallback="Consentement (cookies non essentiels, communications marketing)." /></li>
                <li><EditableZone page="politique-confidentialite" zone="legal_3" fallback="Intérêt légitime (sécurité, prévention de fraude, maintenance)." /></li>
                <li><EditableZone page="politique-confidentialite" zone="legal_4" fallback="Obligation légale (conservation comptable et fiscale)." /></li>
              </ul>
            </PrivacySection>

            <PrivacySection title="Durée de conservation">
              <ul className="list-disc list-inside space-y-2">
                <li><EditableZone page="politique-confidentialite" zone="retention_1" fallback="Demandes de contact : jusqu'à 24 mois après le dernier échange." /></li>
                <li><EditableZone page="politique-confidentialite" zone="retention_2" fallback="Données clients : pendant la relation puis conservation légale obligatoire." /></li>
                <li><EditableZone page="politique-confidentialite" zone="retention_3" fallback="Données newsletter : jusqu'au retrait du consentement." /></li>
                <li><EditableZone page="politique-confidentialite" zone="retention_4" fallback="Logs techniques : durée courte de sécurité et de diagnostic." /></li>
              </ul>
            </PrivacySection>

            <PrivacySection title="Destinataires et sous-traitants">
              <p>
                Les données peuvent être traitées par des prestataires techniques sélectionnés pour
                l'hébergement, la base de données, l'emailing, l'analytics et le paiement.
              </p>
              <p>
                <EditableZone page="politique-confidentialite" zone="tools_text" type="textarea" fallback="Exemples d'outils utilisés : Vercel, Supabase, Brevo, Google Analytics (si consenti) et Stripe (lors de l'activation paiement)." />
              </p>
            </PrivacySection>

            <PrivacySection title="Vos droits RGPD">
              <p>Conformément au RGPD, vous pouvez demander :</p>
              <ul className="list-disc list-inside space-y-2">
                <li><EditableZone page="politique-confidentialite" zone="rights_1" fallback="L'accès à vos données personnelles." /></li>
                <li><EditableZone page="politique-confidentialite" zone="rights_2" fallback="La rectification de données inexactes." /></li>
                <li><EditableZone page="politique-confidentialite" zone="rights_3" fallback="L'effacement de vos données, sous réserve des obligations légales." /></li>
                <li><EditableZone page="politique-confidentialite" zone="rights_4" fallback="La limitation ou l'opposition à certains traitements." /></li>
                <li><EditableZone page="politique-confidentialite" zone="rights_5" fallback="La portabilité des données lorsque applicable." /></li>
                <li><EditableZone page="politique-confidentialite" zone="rights_6" fallback="Le retrait de votre consentement à tout moment." /></li>
              </ul>
            </PrivacySection>

            <PrivacySection title="Cookies et consentement">
              <EditableZone page="politique-confidentialite" zone="cookies_text_1" type="textarea" fallback="Les cookies strictement nécessaires au fonctionnement du site sont actifs par défaut. Les cookies de mesure d'audience ou marketing sont conditionnés à votre consentement explicite en France."
                className="block"
              />
              <p>
                <EditableZone page="politique-confidentialite" zone="cookies_text_2" type="textarea" fallback="Vous pouvez modifier votre choix à tout moment depuis le bandeau cookies lors de vos prochaines visites." />
              </p>
            </PrivacySection>

            <PrivacySection title="Contact">
              <p>
                Pour exercer vos droits ou poser une question relative à vos données, contactez-nous
                à{' '}
                <a
                  href="mailto:contact@heldonica.fr"
                  className="text-eucalyptus hover:text-teal transition"
                >
                  contact@heldonica.fr
                </a>
                .
              </p>
            </PrivacySection>

            <p className="text-sm text-charcoal/60 text-center">
              <EditableZone page="politique-confidentialite" zone="last_update" fallback="Dernière mise à jour : 15 avril 2026" />
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  );
}
