'use client'

import { useState } from 'react'

export interface FAQItem {
  question: string
  answer: string
}

interface FaqSectionProps {
  items: FAQItem[]
  title?: string
  subtitle?: string
  pageSlug?: string
}

export default function FaqSection({ items, title, subtitle, pageSlug }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [openedFaqs, setOpenedFaqs] = useState<Set<number>>(new Set())

  const handleToggle = (index: number) => {
    const isOpening = openIndex !== index
    setOpenIndex(isOpening ? index : null)
    // GA4 — faq_ouverte (event canonique Heldonica)
    if (isOpening && !openedFaqs.has(index)) {
      setOpenedFaqs(prev => new Set([...prev, index]))
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'faq_ouverte', {
          event_category: 'Engagement',
          page: pageSlug || window.location.pathname,
          question_index: index,
          question_preview: items[index].question.substring(0, 50),
        })
      }
    }
  }

  if (!items || items.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-[#f8f6f4]">
      <div className="max-w-3xl mx-auto px-6">
        {title && (
          <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-4 text-center">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-center text-stone-600 mb-12">
            {subtitle}
          </p>
        )}

        <div className="space-y-4">
          {items.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-stone-100 overflow-hidden"
              >
                <button
                  onClick={() => handleToggle(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-stone-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-mahogany pr-4">
                    {item.question}
                  </span>
                  <span 
                    className={`flex-shrink-0 w-8 h-8 rounded-full bg-eucalyptus/10 flex items-center justify-center transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="text-eucalyptus"
                    >
                      <path
                        d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-stone-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}