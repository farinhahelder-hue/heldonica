import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata = {
  title: 'Mentions Légales | Heldonica',
  description: 'Mentions légales, conditions d\'utilisation et politique de confidentialité de Heldonica.',
};

export default function MentionsLegales() {
  return (
    <>
      <Header />
      <Breadcrumb />
      <main className="bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-mahogany mb-6">
              Mentions Légales
            </h1>
            <p className="text-xl text-charcoal">
              Informations légales et conditions d'utilisation du site Heldonica
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6 space-y-12">
            {/* Éditeur du site */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-mahogany mb-4">Éditeur du site</h2>
              <div className="bg-cloud-dancer p-6 rounded-lg space-y-2 text-charcoal">
                <p className="font-semibold">Heldonica - Curated Escapes</p>
                <p>Email : info@heldonica.fr</p>
                <p>Pays : France</p>
                <p>
                  <strong>Responsable de publication :</strong> Helder Farinha
                </p>
              </div>
            </div>

            {/* Hébergement */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-mahogany mb-4">Hébergement</h2>
              <div className="bg-cloud-dancer p-6 rounded-lg space-y-2 text-charcoal">
                <p className="font-semibold">Vercel Inc.</p>
                <p>340 S Lemon Ave, Walnut, CA 91789, USA</p>
                <p>
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-eucalyptus hover:text-teal transition"
                  >
                    www.vercel.com
                  </a>
                </p>
              </div>
            </div>

            {/* Propriété intellectuelle */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-mahogany mb-4">
                Propriété Intellectuelle
              </h2>
              <div className="space-y-4 text-charcoal">
                <p>
                  L'ensemble du contenu du site Heldonica (textes, images, vidéos, logos, etc.) est protégé par les lois sur la propriété intellectuelle. Tous les droits sont réservés.
                </p>
                <p>
                  <strong>Droits d'auteur :</strong> © 2026 Heldonica - Curated Escapes. Tous droits réservés.
                </p>
                <p>
                  Toute reproduction, représentation, modification ou adaptation, en tout ou partie, du contenu du site, sans autorisation préalable écrite, est strictement interdite.
                </p>
                <p>
                  <strong>Crédits photos :</strong> Les photographies publiées sur ce site sont la propriété de Heldonica. Leur utilisation sans autorisation est interdite.
                </p>
              </div>
            </div>

            {/* Conditions d'utilisation */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-mahogany mb-4">
                Conditions d'Utilisation
              </h2>
              <div className="space-y-4 text-charcoal">
                <p>
                  L'accès et l'utilisation du site Heldonica sont soumis aux conditions énoncées ci-après. En accédant au site, vous acceptez ces conditions.
                </p>
                <h3 className="text-xl font-semibold text-mahogany mt-4">Utilisation autorisée</h3>
                <p>
                  Vous pouvez consulter, télécharger et imprimer le contenu du site à titre personnel et non commercial. Toute autre utilisation est interdite sans autorisation préalable.
                </p>
                <h3 className="text-xl font-semibold text-mahogany mt-4">Interdictions</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Reproduire, modifier ou adapter le contenu</li>
                  <li>Utiliser le site à des fins commerciales sans autorisation</li>
                  <li>Accéder au site par des moyens automatisés (bots, scrapers)</li>
                  <li>Transmettre des virus ou codes malveillants</li>
                  <li>Harceler ou menacer d'autres utilisateurs</li>
                  <li>Violer les lois applicables</li>
                </ul>
              </div>
            </div>

            {/* Politique de confidentialité */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-mahogany mb-4">
                Politique de Confidentialité
              </h2>
              <div className="space-y-4 text-charcoal">
                <h3 className="text-xl font-semibold text-mahogany mt-4">Données collectées</h3>
                <p>
                  Heldonica collecte les données suivantes :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Informations de navigation (adresse IP, pages visitées)</li>
                  <li>Données de formulaire (nom, email, message)</li>
                  <li>Cookies et technologies similaires</li>
                </ul>

                <h3 className="text-xl font-semibold text-mahogany mt-4">Utilisation des données</h3>
                <p>
                  Les données sont utilisées pour :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Améliorer l'expérience utilisateur</li>
                  <li>Répondre aux demandes de contact</li>
                  <li>Analyser le trafic du site</li>
                  <li>Respecter les obligations légales</li>
                </ul>

                <h3 className="text-xl font-semibold text-mahogany mt-4">Droits RGPD</h3>
                <p>
                  Conformément au RGPD, vous avez le droit de :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Accéder à vos données personnelles</li>
                  <li>Demander la rectification de vos données</li>
                  <li>Demander l'effacement de vos données</li>
                  <li>Vous opposer au traitement de vos données</li>
                  <li>Demander la portabilité de vos données</li>
                </ul>
                <p className="mt-4">
                  Pour exercer ces droits, contactez-nous à : <strong>info@heldonica.fr</strong>
                </p>
              </div>
            </div>

            {/* Limitation de responsabilité */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-mahogany mb-4">
                Limitation de Responsabilité
              </h2>
              <div className="space-y-4 text-charcoal">
                <p>
                  Heldonica s'efforce de maintenir le site à jour et sans erreurs. Cependant, nous ne garantissons pas l'exactitude, la complétude ou l'actualité du contenu.
                </p>
                <p>
                  Heldonica ne peut être tenue responsable des dommages directs ou indirects résultant de l'utilisation du site ou de l'impossibilité d'accéder au site.
                </p>
                <p>
                  Les liens externes fournis à titre informatif ne constituent pas une approbation du contenu de ces sites.
                </p>
              </div>
            </div>

            {/* Cookies */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-mahogany mb-4">Cookies</h2>
              <div className="space-y-4 text-charcoal">
                <p>
                  Le site Heldonica utilise des cookies pour améliorer votre expérience de navigation. Vous pouvez contrôler l'utilisation des cookies via les paramètres de votre navigateur.
                </p>
                <p>
                  En continuant à utiliser le site, vous consentez à l'utilisation de cookies conformément à cette politique.
                </p>
              </div>
            </div>

            {/* Modifications */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-mahogany mb-4">Modifications</h2>
              <div className="space-y-4 text-charcoal">
                <p>
                  Heldonica se réserve le droit de modifier ces mentions légales à tout moment. Les modifications entrent en vigueur dès leur publication sur le site.
                </p>
                <p>
                  Nous vous recommandons de consulter régulièrement cette page pour rester informé des modifications.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-cloud-dancer p-8 rounded-lg">
              <h2 className="text-2xl font-serif font-bold text-mahogany mb-4">Questions ?</h2>
              <p className="text-charcoal mb-4">
                Si vous avez des questions concernant ces mentions légales, veuillez nous contacter :
              </p>
              <div className="space-y-2 text-charcoal">
                <p>
                  <strong>Email :</strong>{' '}
                  <a href="mailto:info@heldonica.fr" className="text-eucalyptus hover:text-teal transition">
                    info@heldonica.fr
                  </a>
                </p>
                <p>
                  <strong>Pays :</strong> France
                </p>
              </div>
            </div>

            {/* Last Update */}
            <p className="text-sm text-gray-500 text-center">
              Dernière mise à jour : Mars 2026
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
