import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente | Heldonica',
  description:
    "Conditions générales de vente des services de travel planning sur mesure Heldonica. Conception d'itinéraires personnalisés écoresponsables en Europe.",
  alternates: {
    canonical: 'https://www.heldonica.fr/conditions-generales-de-vente',
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
    <section className="mb-8">
      <h2 className="text-2xl font-serif text-primary mb-4">{title}</h2>
      <div className="prose prose-stone max-w-none">{children}</div>
    </section>
  );
}

export default function CGVPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Conditions Générales de Vente', href: '/conditions-generales-de-vente' },
            ]}
          />

          <h1 className="text-4xl font-serif text-primary mt-6 mb-2">
            Conditions Générales de Vente
          </h1>
          <p className="text-muted mb-8">
            <em>Dernière mise à jour : 19 juin 2026</em>
          </p>

          <LegalSection title="1. Identité de l'éditeur">
            <p>
              <strong>Heldonica</strong><br />
              Siège social : Paris, France<br />
              Email : <a href="mailto:contact@heldonica.fr" className="text-accent hover:underline">
                contact@heldonica.fr
              </a><br />
              Site web : <a href="https://www.heldonica.fr" className="text-accent hover:underline">
                www.heldonica.fr
              </a>
            </p>
          </LegalSection>

          <LegalSection title="2. Objet et champ d'application">
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles
              entre Heldonica et tout client (« le Client ») souhaitant bénéficier des services de
              travel planning sur mesure décrits à l'article 3.
            </p>
            <p>
              Ces CGV s'appliquent à tous les devis et prestations réalisés par Heldonica. Le fait de
              solliciter une prestation implique l'acceptation sans réserve des présentes CGV.
            </p>
          </LegalSection>

          <LegalSection title="3. Description des services">
            <p>Heldonica propose les services suivants :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Travel Planning sur mesure</strong> : conception personnalisée d'itinéraires
                de voyage écoresponsables, incluant recommandations d'hébergements, transports,
                activités et restaurants sélectionnés pour leur authenticité.
              </li>
              <li>
                <strong>Conseil en voyage slow travel</strong> : accompagnement pour des voyages
                axés sur l'immersion locale, le respect de l'environnement et les expériences
                hors des sentiers battus.
              </li>
              <li>
                <strong>Carnets de voyage</strong> : documentation écrite et photographique
                de voyages personnalisés.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="4. Processus de commande">
            <p>
              Le Client contacte Heldonica via le formulaire de demande sur{' '}
              <a href="/travel-planning" className="text-accent hover:underline">
                /travel-planning
              </a>{' '}
              ou par email. Un échange préliminaire permet de cerner les attentes,
              le budget et les dates souhaitées.
            </p>
            <p>
              Heldonica établit ensuite un devis détaillé reprenant le périmètre de la prestation,
              les délais et le tarif convenu.
            </p>
          </LegalSection>

          <LegalSection title="5. Tarification et modalités de paiement">
            <p>
              <strong>Devis gratuit :</strong> Une estimation budgétaire indicative est fournie
              gratuitement sur demande initiale.
            </p>
            <p>
              <strong>Prestation de travel planning :</strong> Le tarif est fixé dans le devis
              accepté. Les prix sont exprimés en euros (€) et incluent la TVA applicable.
            </p>
            <p>
              <strong>Modalités de paiement :</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acompte de 30% à la commande, avant le début de la prestation.</li>
              <li>Solde de 70% à la livraison de l'itinéraire final.</li>
              <li>Paiement par virement bancaire (coordonnées transmises avec la facture).</li>
            </ul>
            <p>
              En cas de prestations additionnelles non prévues dans le devis initial,
              un nouveau devis sera soumis pour validation.
            </p>
          </LegalSection>

          <LegalSection title="6. Délais de livraison">
            <p>
              Le délai de livraison de l'itinéraire personnalisé est indiqué dans le devis accepté,
              généralement compris entre 5 et 15 jours ouvrés selon la complexité de la demande
              et la disponibilité du Client pour les échanges de validation.
            </p>
            <p>
              Ce délai court à compter de la réception de l'acompte et de toutes les informations
              nécessaires au démarrage de la prestation.
            </p>
          </LegalSection>

          <LegalSection title="7. Droit de rétractation">
            <p>
              Conformément à l'article L.221-18 du Code de la consommation, le Client dispose
              d'un droit de rétractation de 14 jours calendaires à compter de l'acceptation du devis
              pour tout contrat conclu à distance.
            </p>
            <p>
              <strong>Exception :</strong> Le droit de rétractation ne s'applique pas lorsque la
              prestation a été pleinement exécutée avant la fin du délai de rétractation avec
              l'accord exprès du Client, ou lorsque la prestation est fournie avant la fin du délai
              de 14 jours à la demande explicite du Client.
            </p>
            <p>
              Pour exercer ce droit, le Client doit envoyer une déclaration dénuée d'ambiguïté
              (email à{' '}
              <a href="mailto:contact@heldonica.fr" className="text-accent hover:underline">
                contact@heldonica.fr
              </a>
              ). En cas d'exercice valide, l'acompte versé sera remboursé dans un délai de 14 jours.
            </p>
          </LegalSection>

          <LegalSection title="8. Annulation et modification">
            <p>
              <strong>Annulation par le Client :</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Avant le début de la prestation : remboursement intégral de l'acompte.</li>
              <li>En cours de prestation : facturation au prorata du travail effectué.</li>
            </ul>
            <p>
              <strong>Annulation par Heldonica :</strong> En cas d'impossibilité de fournir le
              service convenu, Heldonica s'engage à en informer le Client dans les plus brefs
              délais et à proposer une solution de remplacement ou un remboursement intégral.
            </p>
            <p>
              <strong>Modifications :</strong> Toute modification du périmètre initial doit faire
              l'objet d'un accord écrit (email ou message) entre les deux parties.
            </p>
          </LegalSection>

          <LegalSection title="9. Obligations du Client">
            <p>Le Client s'engage à :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fournir des informations exactes et complètes pour la bonne exécution de la prestation.</li>
              <li>Répondre dans un délai raisonnable aux demandes de clarification.</li>
              <li>Respecter les délais de validation convenus.</li>
              <li>Effectuer lui-même les réservations suggérées (vol, hébergement, activités).</li>
            </ul>
          </LegalSection>

          <LegalSection title="10. Responsabilité">
            <p>
              Heldonica fournit des recommandations basées sur son expertise et ses recherches.
              Les prestations de travel planning constituent un service de conseil personnalisé
              et non un forfait touristique au sens du Code du tourisme.
            </p>
            <p>
              Heldonica ne saurait être tenue responsable des modifications de prix, annulations
              ou indisponibilités intervenant de la part des prestataires tiers (compagnies aériennes,
              hébergements, transports, activités) non réservés par Heldonica.
            </p>
            <p>
              Les suggestions d'itinéraire n'engagent pas Heldonica quant aux conditions météo,
              événements exceptionnels ou tout autre événement échappant à son contrôle.
            </p>
          </LegalSection>

          <LegalSection title="11. Propriété intellectuelle">
            <p>
              Les itinéraires personnalisés, contenus et recommandations fournis par Heldonica
              sont destinés à l'usage personnel du Client. Toute reproduction, distribution ou
              utilisation commerciale est interdite sans accord écrit préalable.
            </p>
            <p>
              Les contenus du site heldonica.fr (textes, photos, éléments graphiques) sont protégés
              par le droit d'auteur. Toute reproduction non autorisée est interdite.
            </p>
          </LegalSection>

          <LegalSection title="12. Protection des données personnelles">
            <p>
              Les données personnelles collectées dans le cadre des prestations sont traitées
              conformément à la politique de confidentialité du site :{' '}
              <a href="/politique-confidentialite" className="text-accent hover:underline">
                /politique-confidentialite
              </a>
              .
            </p>
            <p>
              Ces données sont utilisées uniquement pour l'exécution de la prestation commandée
              et ne sont pas transmises à des tiers sans consentement.
            </p>
          </LegalSection>

          <LegalSection title="13. Médiation et litiges">
            <p>
              En cas de contestation, le Client peut contacter Heldonica à l'adresse
              <a href="mailto:contact@heldonica.fr" className="text-accent hover:underline">
                {' '}contact@heldonica.fr
              </a>{' '}
              pour rechercher une solution à l'amiable.
            </p>
            <p>
              Conformément aux dispositions du Code de la consommation relatives à la médiation,
              le Client peut, en cas de litige, recourir gratuitement au service de médiation
              de la Commission européenne accessible à l'adresse :{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              .
            </p>
            <p>
              En l'absence de résolution amiable, le litige sera soumis aux tribunaux français
              compétents.
            </p>
          </LegalSection>

          <LegalSection title="14. Acceptation des CGV">
            <p>
              Le fait de valider une commande ou d'accepter un devis implique l'acceptation
              entière et sans réserve des présentes Conditions Générales de Vente.
            </p>
            <p>
              Heldonica se réserve le droit de modifier les présentes CGV à tout moment.
              Les nouvelles conditions s'appliqueront aux nouvelles commandes uniquement.
            </p>
          </LegalSection>
        </div>
      </main>
      <Footer />
    </>
  );
}
