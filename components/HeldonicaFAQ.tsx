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
      <section className="my-12 rounded-sm border border-[#DED5C6] bg-[#FAF7F2] px-6 py-8 md:px-10">
        <h2 className="mb-6 text-xl font-serif font-normal text-mahogany md:text-2xl">
          {title}
        </h2>
        <div className="space-y-4">
          {items.map((item, index) => (
            <details
              key={index}
              className="group rounded-sm border border-[#DED5C6] bg-[#F7F3EC] p-4 transition-colors duration-200"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-charcoal hover:text-eucalyptus">
                <span>{item.question}</span>
                <svg
                  className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-4 text-sm leading-relaxed text-charcoal/70">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}