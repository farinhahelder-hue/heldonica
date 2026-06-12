'use client'

import { useState, useRef, useEffect } from 'react'
import { HELDONICA_TOKENS, SlideData } from './tokens'

interface Message {
  role: 'user' | 'assistant'
  content: string
  slides?: SlideData[]
}

interface AIChatPanelProps {
  onSlidesGenerated: (slides: SlideData[]) => void
  isGenerating: boolean
  setIsGenerating: (v: boolean) => void
}

const EXAMPLE_PROMPTS = [
  "Crée un carrousel 5 slides sur les meilleurs spots slow travel au Portugal",
  "Génère un carrousel 8 slides sur l'éco-luxe en Normandie",
  "5 slides sur les destinations romantiques hors sentiers battus",
  "Carrousel 6 slides : itinéraire slow travel en Grèce",
]

export default function AIChatPanel({ onSlidesGenerated, isGenerating, setIsGenerating }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Bonjour ! Je suis votre assistant Carrousel Heldonica. \n\nJe peux générer des carrousels Instagram personnalisés avec le style slow travel et éco-luxe de la marque.\n\nTapez votre idée ou choisissez un exemple ci-dessous.`
    }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent, prompt?: string) => {
    e.preventDefault()
    const userPrompt = prompt || input.trim()
    if (!userPrompt || isGenerating) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userPrompt }])
    setIsGenerating(true)

    try {
      const res = await fetch('/api/cms/carousel-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          brand: 'heldonica',
          style: HELDONICA_TOKENS.style,
        })
      })

      const data = await res.json()

      if (data.slides && data.slides.length > 0) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `J'ai généré ${data.slides.length} slides pour votre carrousel ! Vous pouvez les réorganiser dans le filmstrip ou les modifier.`,
          slides: data.slides
        }])
        onSlidesGenerated(data.slides)
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error || "Je n'ai pas pu générer de carrousel. Essayez une description plus précise."
        }])
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Une erreur technique s'est produite. Veuillez réessayer."
      }])
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-200 bg-gradient-to-r from-[#6b2a1a] to-[#4a7c59]">
        <h3 className="font-semibold text-white text-sm">💬 Assistant Carrousel IA</h3>
        <p className="text-xs text-white/80">Générez des carrousels en langage naturel</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-[#6b2a1a] text-white rounded-br-md'
                : 'bg-stone-100 text-stone-800 rounded-bl-md'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.slides && msg.slides.length > 0 && (
                <div className="mt-3 pt-3 border-t border-stone-200/30">
                  <span className="text-xs opacity-75">{msg.slides.length} slides générées</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-stone-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Example prompts */}
      <div className="px-4 py-2 border-t border-stone-100">
        <p className="text-xs text-stone-500 mb-2">Exemples :</p>
        <div className="flex flex-wrap gap-1">
          {EXAMPLE_PROMPTS.slice(0, 2).map((p, i) => (
            <button
              key={i}
              onClick={(e) => handleSubmit(e, p)}
              className="text-xs px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-600 transition-colors"
            >
              {p.substring(0, 30)}...
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-stone-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Décrivez votre carrousel..."
            className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2a1a]/30 focus:border-[#6b2a1a]"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !input.trim()}
            className="px-4 py-2 bg-[#6b2a1a] text-white text-sm font-medium rounded-xl hover:bg-[#6b2a1a]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? '...' : '→'}
          </button>
        </div>
      </form>
    </div>
  )
}