import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const useCases = [
  {
    title: 'Répondre plus vite sans sonner faux',
    description:
      'Avis, mails pré-arrivée, réponses récurrentes : l’IA peut aider à gagner du temps, à condition de garder votre voix et votre niveau de détail.',
  },
  {
    title: 'Mieux lire ce que disent les clients',
    description:
      'Synthèses d’avis, signaux faibles, irritants qui reviennent : on l’utilise pour voir plus clair, pas pour remplacer votre lecture du terrain.',
  },
  {
    title: 'Soulager l’équipe sur le répétitif',
    description:
      'Checklists, briefs, premiers jets, mise en forme d’informations : les bons usages sont souvent les moins spectaculaires, mais les plus utiles.',
  },
];

const principles = [
  {
    title: 'L’IA ne remplace pas votre instinct',
    description:
      'Elle l’alimente. Elle met de l’ordre, fait ressortir des motifs, accélère certaines tâches. Mais la décision et le ton vous appartiennent.',
  },
  {
    title: 'On part d’un irritant réel',
    description:
      'Pas d’outil parce qu’il est à la mode. On commence par ce qui vous fait perdre du temps, de la clarté ou de l’énergie aujourd’hui.',
  },
  {
    title: 'On garde l’humain au contact',
    description:
      'L’automatisation sert l’expérience quand elle enlève du bruit. Pas quand elle remplace la présence ou l’attention.',
  },
];

const tools = [
  {
    title: 'Bench d’outils utiles',
    description:
      'Rédaction assistée, synthèse d’avis, structuration de procédures, veille locale, extraction de signaux : on choisit selon vos usages réels.',
  },
  {
    title: 'Mise en place progressive',
    description:
      'On préfère un ou deux usages tenus dans le temps à une stack entière que personne n’ouvre après trois semaines.',
  },
  {
    title: 'Formation légère, adoption durable',
    description:
      'L’outil doit être compris vite, repris par l’équipe et rester utile même quand la saison accélère.',
  },
];

export const metadata: Metadata = {
  title: 'IA hôtellerie | Heldonica',
  description:
    'L’IA ne remplace pas votre instinct. Elle lui donne des données. Usages concrets pour hôtels indépendants, sans jargon ni effet de mode.',
  alternates: {
    canonical: 'https://heldonica.fr/ai-hotellerie',
  },
};

export default function AIHotelleriePage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-28">
          <div className="container">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              IA hôtellerie
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6 max-w-4xl">
              L’IA ne remplace pas votre instinct.
              <span className="block italic text-eucalyptus">Elle lui donne des données.</span>
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed mb-8">
              On utilise ces outils nous-mêmes. Pour nos voyages, pour nos clients. On partage ce qui marche vraiment — pas ce qui fait bien dans une présentation.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="px-7 py-3 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors"
              >
                Prendre rendez-vous →
              </Link>
              <Link
                href="#outils"
                className="px-7 py-3 rounded-lg border border-eucalyptus text-eucalyptus font-semibold hover:bg-eucalyptus/5 transition-colors"
              >
                Voir les outils →
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-10">Ce qu’on en fait vraiment</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {useCases.map((item) => (
                <article key={item.title} className="rounded-2xl border border-stone-200 p-6 shadow-sm">
                  <h3 className="text-2xl font-serif text-mahogany mb-3">{item.title}</h3>
                  <p className="text-charcoal/80 leading-relaxed">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="outils" className="bg-cloud-dancer section-spacing">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-10">Les bons outils, à la bonne place</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {tools.map((item) => (
                <article key={item.title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                  <h3 className="text-2xl font-serif text-mahogany mb-3">{item.title}</h3>
                  <p className="text-charcoal/80 leading-relaxed">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-10">Notre ligne</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {principles.map((item) => (
                <article key={item.title} className="rounded-2xl border border-stone-200 p-6">
                  <h3 className="text-xl font-serif text-mahogany mb-3">{item.title}</h3>
                  <p className="text-charcoal/80 leading-relaxed text-sm">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-mahogany text-white py-24 md:py-28">
          <div className="container max-w-3xl text-center">
            <p className="text-cloud-dancer uppercase tracking-[0.2em] text-xs font-semibold mb-4">
              Besoin d’y voir clair ?
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-6">
              On peut vous aider à choisir
              <br />
              <em>ce qui vaut vraiment la peine.</em>
            </h2>
            <p className="text-white/75 leading-relaxed mb-8">
              Pas une stack. Pas un effet waouh. Juste des usages qui font gagner du temps, clarifient le travail et tiennent quand la saison devient dense.
            </p>
            <Link
              href="/contact"
              className="inline-flex px-7 py-3 rounded-lg bg-white text-mahogany font-semibold hover:bg-cloud-dancer transition-colors"
            >
              Prendre rendez-vous →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
