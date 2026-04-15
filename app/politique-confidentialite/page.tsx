import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Politique de confidentialite',
  description:
    "Politique de confidentialite et traitement des donnees personnelles du site Heldonica.",
  alternates: {
    canonical: 'https://heldonica.fr/politique-confidentialite',
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

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <Header />
      <Breadcrumb />
      <main className="bg-white">
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-xs uppercase tracking-[0.16em] text-eucalyptus font-semibold mb-3">
              Donnees personnelles
            </p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-mahogany mb-5">
              Politique de confidentialite
            </h1>
            <p className="text-lg text-charcoal/80">
              Cette page detaille la collecte, l'usage et la conservation de vos donnees sur
              heldonica.fr.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6 space-y-12">
            <PrivacySection title="Donnees collectees">
              <p>
                Selon votre usage du site, Heldonica peut collecter les categories de donnees
                suivantes :
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Donnees d'identification : nom, prenom, email, telephone.</li>
                <li>Donnees de projet : informations fournies via les formulaires de voyage.</li>
                <li>Donnees techniques : adresse IP, type d'appareil, navigateur, logs.</li>
                <li>
                  Donnees marketing : interactions newsletter, consentement cookies, campagnes.
                </li>
              </ul>
            </PrivacySection>

            <PrivacySection title="Finalites du traitement">
              <p>Les donnees sont traitees pour :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Repondre a vos demandes de contact et de travel planning.</li>
                <li>Executer une prestation (accompagnement voyage, suivi client).</li>
                <li>Envoyer des contenus newsletter si vous y avez consenti.</li>
                <li>Mesurer l'audience et ameliorer le site apres consentement cookies.</li>
                <li>Respecter les obligations legales et comptables applicables.</li>
              </ul>
            </PrivacySection>

            <PrivacySection title="Bases legales">
              <ul className="list-disc list-inside space-y-2">
                <li>Execution precontractuelle ou contractuelle (demandes et prestations).</li>
                <li>Consentement (cookies non essentiels, communications marketing).</li>
                <li>Interet legitime (securite, prevention de fraude, maintenance).</li>
                <li>Obligation legale (conservation comptable et fiscale).</li>
              </ul>
            </PrivacySection>

            <PrivacySection title="Duree de conservation">
              <ul className="list-disc list-inside space-y-2">
                <li>Demandes de contact : jusqu'a 24 mois apres le dernier echange.</li>
                <li>Donnees clients : pendant la relation puis conservation legale obligatoire.</li>
                <li>Donnees newsletter : jusqu'au retrait du consentement.</li>
                <li>Logs techniques : duree courte de securite et de diagnostic.</li>
              </ul>
            </PrivacySection>

            <PrivacySection title="Destinataires et sous-traitants">
              <p>
                Les donnees peuvent etre traitees par des prestataires techniques selectionnes pour
                l'hebergement, la base de donnees, l'emailing, l'analytics et le paiement.
              </p>
              <p>
                Exemples d'outils utilises : Vercel, Supabase, Brevo, Google Analytics (si consenti)
                et Stripe (lors de l'activation paiement).
              </p>
            </PrivacySection>

            <PrivacySection title="Vos droits RGPD">
              <p>Conformement au RGPD, vous pouvez demander :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>L'acces a vos donnees personnelles.</li>
                <li>La rectification de donnees inexactes.</li>
                <li>L'effacement de vos donnees, sous reserve des obligations legales.</li>
                <li>La limitation ou l'opposition a certains traitements.</li>
                <li>La portabilite des donnees lorsque applicable.</li>
                <li>Le retrait de votre consentement a tout moment.</li>
              </ul>
            </PrivacySection>

            <PrivacySection title="Cookies et consentement">
              <p>
                Les cookies strictement necessaires au fonctionnement du site sont actives par
                defaut. Les cookies de mesure d'audience ou marketing sont conditionnes a votre
                consentement explicite en France.
              </p>
              <p>
                Vous pouvez modifier votre choix a tout moment depuis le bandeau cookies lors de vos
                prochaines visites.
              </p>
            </PrivacySection>

            <PrivacySection title="Contact">
              <p>
                Pour exercer vos droits ou poser une question relative a vos donnees, contactez-nous
                a{' '}
                <a
                  href="mailto:info@heldonica.fr"
                  className="text-eucalyptus hover:text-teal transition"
                >
                  info@heldonica.fr
                </a>
                .
              </p>
            </PrivacySection>

            <p className="text-sm text-charcoal/60 text-center">
              Derniere mise a jour : 15 avril 2026
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
