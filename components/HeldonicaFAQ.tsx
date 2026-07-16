import { FAQJsonLd } from './JsonLd'

interface FAQItem {
  question: string
  answer: string
}

interface HeldonicaFAQProps {
  items: FAQItem[]
  title?: string
}

/**
 * Composant FAQ structuré pour les articles de type "Guides Pratiques"
 * Inclut le JSON-LD FAQPage pour le référencement
 */
export default function HeldonicaFAQ({ items, title = 'Questions fréquentes' }: HeldonicaFAQProps) {
  if (!items || items.length === 0) return null

  return (
    <>
      <FAQJsonLd questions={items} />
      <section className="my-12 rounded-[2rem] border border-stone-200 bg-stone-50 px-6 py-8 md:px-10">
        <h2 className="mb-6 text-xl font-serif font-light text-stone-900 md:text-2xl">
          {title}
        </h2>
        <div className="space-y-4">
          {items.map((item, index) => (
            <details
              key={index}
              className="group rounded-xl border border-stone-200 bg-white p-4 transition-all duration-200"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-stone-800 hover:text-eucalyptus">
                <span>{item.question}</span>
                <svg
                  className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-4 text-sm leading-relaxed text-stone-600">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}