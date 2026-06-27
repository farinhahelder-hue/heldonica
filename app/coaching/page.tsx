import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Coaching & Mentorat — Monica Schneider | Heldonica',
  description:
    'Coaching exécutif, mentorat et Happiness Design. Accompagnement individuel et en entreprise pour les moments clés de la carrière et de la vie.',
  alternates: { canonical: 'https://www.heldonica.fr/coaching' },
}

const STORY = [
  'Les 10 premières années de ma carrière ont été dédiées au marketing international : développement de produits, de marques, d\'histoires et d\'expériences inoubliables, en Allemagne, en France, au Royaume-Uni et en Europe de l\'Est pour Henkel, LVMH et L\'Oréal.',
  'En 2020, j\'ai mis fin à l\'aventure L\'Oréal et j\'ai exploré de nouvelles vies. Je me suis formée à l\'Executive Coaching. Une des choses qui m\'avait le plus animée avait été le développement des individus et des équipes. À travers cette formation et le début de ma pratique, j\'ai découvert que ce métier était fait pour moi.',
  'Dans le coaching, j\'arrivais à créer un espace où mes clients trouvent le courage de se confronter à leurs limites, à leurs doutes et à leurs vulnérabilité pour réaliser une transformation libératrice qui les rapproche de qui ils sont, de leur puissance et de leur sourire le plus confiant. Être témoin et guide dans cette démarche est un honneur qui m\'anime plus que tout.',
  'Pour enrichir mon approche et retrouver un de mes amours de jeunesse, j\'ai également entrepris un Master de Pratique Philosophique. J\'ai fait mon mémoire sur le bonheur.',
  'Deux grandes conclusions :',
]

const CONCLUSIONS = [
  'Ce n\'est pas le bonheur qui fait la différence mais comment on réagit dans l\'adversité, quand la vie ne va pas comme on veut.',
  'Une discipline ne suffit pas. Il faut comprendre son cerveau (neurosciences), savoir créer son bonheur (psychologie positive), repérer quand son inconscient reprend le dessus (psychologie classique), entraîner le cerveau à réduire le cortisol (méditation) et à challenger ses pensées (pratique philosophique).',
]

const PROGRAMS = [
  {
    name: 'Séance découverte',
    duration: '45 minutes',
    price: 'Gratuit',
    desc: 'Un premier échange sans engagement pour faire connaissance, clarifier votre demande et voir si le coaching est fait pour vous.',
    cta: 'Réserver ma séance',
  },
  {
    name: 'Séance individuelle',
    duration: '1h',
    price: 'Sur devis',
    desc: 'Une séance ponctuelle pour travailler un sujet précis, débloquer une situation ou prendre une décision importante.',
    cta: 'Demander un devis',
  },
  {
    name: 'Programme Prise de Poste',
    duration: '6 séances + 1 point hebdo 30min pendant les 90 premiers jours',
    price: '1 700 € TTC (ou 3×566 €)',
    desc: 'Un programme intensif pour réussir votre prise de poste, gagner en légitimité et installer votre leadership dès les premiers mois.',
    cta: 'Découvrir le programme',
  },
  {
    name: 'Programme Happiness Design',
    duration: '12 séances',
    price: 'Sur mesure',
    desc: 'Un parcours complet pour reprendre les rênes de votre vie et de votre bonheur, au travail et ailleurs. 12 séances pour vous reconstruire une boîte à outils sur mesure.',
    link: '/happiness-design',
    cta: 'Voir le programme',
  },
]

const TESTIMONIALS = [
  {
    text: 'J\'étais le bon élève typique : attendre d\'avoir tout compris et tout structuré avant d\'agir, ce qui me freinait clairement dans mon rôle. Grâce à mes échanges avec Monica, j\'ai compris mes mécanismes limitants et découvert de nouvelles perspectives. Le déclic du "cancre intelligent" m\'a permis de voir mes forces autrement : j\'ose proposer, tester, décider plus vite. Résultat : plus d\'impact, plus de visibilité, et des résultats business concrets.',
    author: 'Thibault',
    role: 'Directeur marketing (tech)',
  },
  {
    text: 'I highly recommend the coaching sessions that Monica Schneider offers. My experience with her has been greatly satisfactory and has allowed me to achieve goals and mindsets that would have been very difficult to accomplish otherwise. She has a vast knowledge of the questioning technique and made every session worth and developmental. Monica\'s coaching style reflects her professionalism and her engaging nature that has allowed me to express myself openly. She provided a psychological safe environment.',
    author: 'Maria',
    role: 'Learning and Development Director, Banking',
  },
  {
    text: 'On a eu un super feedback sur la réunion de présentation que nous avons préparé ensemble. Jérôme (le n+1 de ma cliente) nous a dit : "Champagne !"',
    author: 'Dorothée',
    role: 'Directrice Achats Beauty Retail',
  },
  {
    text: 'I want to thank Monica for her inspiring, relieving, insightful and energizing sessions! She opened up valuable new perspectives on my current situation and helped me get to know myself better. It is amazing, but just in a few sessions I was able to view my situation from a completely new angle, and suddenly see the road to my new self.',
    author: 'David',
    role: 'Governmental Think Thank',
  },
]

const MENTORING_TOPICS = [
  'Comment être visible tout en restant authentique ?',
  'Comment démontrer du leadership et signaler que nous sommes prêts pour la next step ?',
  'Quel plan de communication interne mettre en place pour rebooster l\'engagement ?',
  'Comment naviguer les différences de communication au sein d\'environnements multiculturels ?',
]

export default function CoachingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f5f3ef]">
        {/* Hero */}
        <section className="relative py-28 md:py-36 bg-gradient-to-br from-stone-900 to-stone-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80')] bg-cover bg-center opacity-15" />
          <div className="relative z-10 container max-w-4xl mx-auto px-5 text-center">
            <p className="text-[#C4714A] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Leadership, Coaching & Transformation</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-tight mb-6">
              Deviens qui tu es
            </h1>
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
              Coaching exécutif, mentorat et Happiness Design — pour les moments clés de votre carrière et de votre vie.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <Link href="#programs" className="inline-flex px-8 py-3 bg-[#C4714A] text-white font-semibold rounded-xl hover:bg-[#b05f3a] transition-all text-sm">
                Découvrir mes programmes
              </Link>
              <Link href="#decouverte" className="inline-flex px-8 py-3 border border-stone-400 text-stone-200 font-semibold rounded-xl hover:border-white hover:text-white transition-all text-sm">
                Séance découverte gratuite
              </Link>
            </div>
          </div>
        </section>

        {/* Mon histoire */}
        <section className="py-20 md:py-28">
          <div className="container max-w-4xl mx-auto px-5">
            <p className="text-[#C4714A] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Le parcours</p>
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-2">Deviens qui tu es</h2>
            <div className="w-12 h-0.5 bg-[#C4714A] mt-6 mb-10" />
            <div className="space-y-5 text-stone-600 leading-relaxed text-base md:text-lg">
              {STORY.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <ol className="list-decimal pl-6 space-y-3 mt-4">
                {CONCLUSIONS.map((c, i) => (
                  <li key={i} className="pl-2">{c}</li>
                ))}
              </ol>
              <p className="pt-4">
                Je me suis construit une boîte à outils que j'ai appliquée à ma propre vie au cours des 6 dernières années : <strong>Happiness Design</strong>.
                Je l'ai aussi intégrée dans mes coachings et cela a fait la différence pour mes clients.
              </p>
              <p>
                Aujourd'hui je continue à accompagner des individus ou des entreprises aux moments clés des carrières (promotion et prise de poste, transitions, reconversion), pour booster le sens et l'engagement (conseil en communication interne, team coaching) et même pendant les moments clés du reste de la vie (mariage, séparation, parentalité, deuil, retraite, fin de vie).
              </p>
              <p className="font-medium text-stone-800">
                Ma conviction, ligne directrice dans toutes mes interventions, est simple. Pour chaque nouvelle étape, nous devons entreprendre une transformation en tant qu'individu ou en tant qu'équipe. Je suis à vos côtés avec ma boîte à outils multidisciplinaire pour coller au mieux à votre chemin unique.
              </p>
              <p>
                Je souhaite aussi rendre cette boîte à outils du bonheur — même dans une vie chaotique — accessible au plus grand nombre. Ce projet s'appelle <Link href="/happiness-design" className="text-[#C4714A] underline hover:no-underline">Happiness Design</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* Coaching vs Mentorat */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container max-w-5xl mx-auto px-5">
            <p className="text-[#C4714A] text-xs font-semibold tracking-[0.2em] uppercase mb-3 text-center">Mes coachings et mentorings</p>
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 text-center mb-4">2 approches complémentaires</h2>
            <div className="w-12 h-0.5 bg-[#C4714A] mx-auto mt-6 mb-12" />
            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-[#f5f3ef] rounded-2xl p-8">
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-4">Coaching</h3>
                <p className="text-stone-600 leading-relaxed mb-4">
                  Le coaching est une danse entre le coach et le coaché. À travers les questions du coach, le coaché réfléchit, change de perspective, fait l'expérience de révélations, de aha moments et d'eurêkas ! Il ou elle trouve en soi les meilleures solutions pour avancer sereinement vers son objectif. Le coaché dessine un plan d'action clair et daté. Il ou elle ressort de la séance avec un sentiment de clarté, une énergie renouvelée et souvent un sourire confiant.
                </p>
                <p className="text-stone-500 text-sm italic">
                  Ma pratique de coaching est enrichie, quand la situation s'y prête, par de la philosophie pratique.
                </p>
              </div>
              <div className="bg-[#f5f3ef] rounded-2xl p-8">
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-4">Mentoring</h3>
                <p className="text-stone-600 leading-relaxed mb-4">
                  Je vous offre mes conseils sur une problématique alignée avec mon expertise.
                </p>
                <ul className="space-y-2">
                  {MENTORING_TOPICS.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-stone-600 text-sm">
                      <span className="text-[#C4714A] mt-0.5 shrink-0">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Ma méthode */}
        <section className="py-20 md:py-28">
          <div className="container max-w-4xl mx-auto px-5">
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 text-center mb-2">Ma méthode</h2>
            <div className="w-12 h-0.5 bg-[#C4714A] mx-auto mt-6 mb-10" />
            <p className="text-stone-600 leading-relaxed text-base md:text-lg">
              Je m'appuie sur des techniques classiques d'executive coaching (modèles GROW, Gestalt, Solutions Focused, Co-active…) mais aussi sur des outils rencontrés plus rarement (méditation, philosophie, psychologie, design thinking) pour travailler aussi sur la transformation que vous devez accomplir au plus profond de vous pour réaliser vos objectifs. Pour offrir du recul, de la clarté et de nouvelles perspectives. Vous y voyez plus clair, y compris sur les prochaines actions à mettre en place. Vous ressentez des moments de révélations, d'alignement profonds. Vous vous retrouvez et vous êtes prêt à accélérer avec un élan et une clarté revigorants.
            </p>
          </div>
        </section>

        {/* Programmes */}
        <section id="programs" className="py-20 md:py-28 bg-white">
          <div className="container max-w-5xl mx-auto px-5">
            <p className="text-[#C4714A] text-xs font-semibold tracking-[0.2em] uppercase mb-3 text-center">Coaching</p>
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 text-center mb-4">Mes programmes</h2>
            <div className="w-12 h-0.5 bg-[#C4714A] mx-auto mt-6 mb-12" />
            <div className="grid md:grid-cols-2 gap-6">
              {PROGRAMS.map((p, i) => (
                <div key={i} className="border border-stone-200 rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-serif font-bold text-stone-900">{p.name}</h3>
                    <span className="text-xs text-[#C4714A] font-semibold whitespace-nowrap ml-2">{p.duration}</span>
                  </div>
                  <p className="text-sm text-stone-500 mb-4">{p.price}</p>
                  <p className="text-stone-600 text-sm leading-relaxed mb-6">{p.desc}</p>
                  <div id={i === 0 ? 'decouverte' : undefined}>
                    <Link
                      href={p.link || '#contact'}
                      className="inline-flex px-5 py-2.5 bg-[#C4714A] text-white text-sm font-semibold rounded-xl hover:bg-[#b05f3a] transition-all"
                    >
                      {p.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Organisations */}
        <section className="py-20 md:py-28">
          <div className="container max-w-4xl mx-auto px-5">
            <p className="text-[#C4714A] text-xs font-semibold tracking-[0.2em] uppercase mb-3 text-center">Organisations</p>
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 text-center mb-4">Accompagnement des entreprises</h2>
            <div className="w-12 h-0.5 bg-[#C4714A] mx-auto mt-6 mb-10" />
            <p className="text-stone-600 leading-relaxed text-base md:text-lg text-center max-w-3xl mx-auto mb-8">
              Coaching de dirigeants, ateliers de cohésion, accompagnement du changement et séminaires sur mesure.
              Quand une équipe perd de sa cohérence, les résultats s'en ressentiront toujours. Je travaille avec les dirigeants et les organisations pour remettre de l'alignement — entre les personnes, entre les objectifs et les moyens, entre ce qu'on dit et ce qu'on fait, ou tout simplement pour rebooster l'engagement et l'élan commun.
            </p>
            <div className="text-center">
              <Link href="#contact" className="inline-flex px-8 py-3 border border-stone-300 text-stone-700 font-semibold rounded-xl hover:border-[#C4714A] hover:text-[#C4714A] transition-all text-sm">
                Me contacter pour un accompagnement sur mesure
              </Link>
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container max-w-4xl mx-auto px-5">
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 text-center mb-2">Ils me recommandent</h2>
            <div className="w-12 h-0.5 bg-[#C4714A] mx-auto mt-6 mb-12" />
            <div className="grid md:grid-cols-2 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-[#f5f3ef] rounded-2xl p-6">
                  <p className="text-stone-600 text-sm leading-relaxed italic mb-4">&ldquo;{t.text}&rdquo;</p>
                  <p className="text-sm font-semibold text-stone-900">{t.author}</p>
                  <p className="text-xs text-stone-400">{t.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Contact */}
        <section id="contact" className="py-20 md:py-28 bg-gradient-to-br from-stone-900 to-stone-800 text-white">
          <div className="container max-w-3xl mx-auto px-5 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-light leading-tight mb-6">
              Prêt à entamer votre transformation ?
            </h2>
            <p className="text-stone-300 mb-8 max-w-xl mx-auto">
              Réservez votre séance découverte de 45 minutes — sans engagement. On fait le point sur votre situation et on voit si le coaching est fait pour vous.
            </p>
            <Link
              href="mailto:monica@heldonica.fr"
              className="inline-flex px-10 py-4 bg-[#C4714A] text-white font-semibold rounded-xl hover:bg-[#b05f3a] transition-all text-lg"
            >
              Réserver ma séance découverte gratuite
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
