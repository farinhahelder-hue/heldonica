'use client'

import { useState, useRef, useEffect } from 'react'
import { HELDONICA_TOKENS, SlideData, PROMPT_TEMPLATES } from './tokens'

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

const QUICK_PROMPTS = [
  { icon: '🌍', label: 'Destinations', prompts: PROMPT_TEMPLATES.destinations },
  { icon: '💡', label: 'Conseils', prompts: PROMPT_TEMPLATES.tips },
  { icon: '💑', label: 'Romantique', prompts: PROMPT_TEMPLATES.romantic },
]

export default function AIChatPanel({ onSlidesGenerated, isGenerating, setIsGenerating }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Bienvenue ! Je suis votre assistant Carrousel Heldonica ✨

Je crée des carrousels Instagram personnalisés avec le style slow travel et éco-luxe de la marque.

💡 Tips :
• Précisez le nombre de slides (ex: "5 slides")
• Mentionnez une destination (ex: Portugal, Madère)
• Utilisez les exemples rapides ci-dessous`
    }
  ])
  const [input, setInput] = useState('')
  const [slideCount, setSlideCount] = useState(5)
  const [showTemplates, setShowTemplates] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent, prompt?: string) => {
    e.preventDefault()
    const userPrompt = prompt || input.trim()
    if (!userPrompt || isGenerating) return

    setInput('')
    setShowTemplates(false)
    setMessages(prev => [...prev, { role: 'user', content: userPrompt }])
    setIsGenerating(true)

    try {
      const res = await fetch('/api/cms/carousel-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          slideCount,
          brand: 'heldonica',
          style: HELDONICA_TOKENS.style,
        })
      })

      const data = await res.json()

      if (data.slides && data.slides.length > 0) {
        const responseContent = `J’ai généré ${data.slides.length} slides pour "${data.meta.prompt}"

Chaque slide utilise une couleur différente de la palette Heldonica. Vous pouvez les réorganiser dans le filmstrip ou modifier chaque slide.`

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: responseContent,
          slides: data.slides
        }])
        onSlidesGenerated(data.slides)
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error || "Je n’ai pas pu générer de carrousel. Essayez une description plus précise."
        }])
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Une erreur technique s’est produite. Veuillez réessayer."
      }])
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-200 bg-gradient-to-r from-[#6b2a1a] to-[#4a7c59]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white text-sm">🤖 Assistant Carrousel IA</h3>
            <p className="text-xs text-white/80">Génération en langage naturel</p>
          </div>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-2 py-1 text-xs bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            {showTemplates ? 'Masquer' : 'Afficher'} tips
          </button>
        </div>
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
                  <div className="flex gap-1 flex-wrap">
                    {msg.slides.slice(0, 5).map((slide, si) => (
                      <span key={si} className="px-2 py-1 bg-white/50 rounded text-xs">
                        {slide.title.substring(0, 20)}
                      </span>
                    ))}
                    {msg.slides.length > 5 && (
                      <span className="px-2 py-1 bg-white/50 rounded text-xs">
                        +{msg.slides.length - 5}
                      </span>
                    )}
                  </div>
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

      {/* Quick templates */}
      {showTemplates && (
        <div className="px-4 py-2 border-t border-stone-100 bg-stone-50">
          <p className="text-xs text-stone-500 mb-2">Exemples rapides :</p>
          <div className="space-y-1">
            {QUICK_PROMPTS.map((category, ci) => (
              <details key={ci} className="group">
                <summary className="text-xs px-2 py-1 cursor-pointer hover:bg-stone-100 rounded flex items-center gap-1">
                  <span>{category.icon}</span>
                  <span className="text-stone-600">{category.label}</span>
                  <span className="ml-auto text-stone-400 group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className="pl-4 mt-1 space-y-1">
                  {category.prompts.slice(0, 2).map((p, pi) => (
                    <button
                      key={pi}
                      onClick={(e) => handleSubmit(e, p.replace('{n}', '5').replace('{destination}', 'Madère').replace('{activity}', 'randonnée').replace('{topic}', 'slow travel'))}
                      className="block w-full text-left text-xs px-2 py-1 bg-white rounded hover:bg-stone-100 text-stone-500 truncate"
                    >
                      {p.split('{')[0]}...
                    </button>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Slide count selector */}
      <div className="px-4 py-2 border-t border-stone-100 bg-stone-50 flex items-center gap-3">
        <span className="text-xs text-stone-500">Slides :</span>
        <input
          type="range"
          min="1"
          max="10"
          value={slideCount}
          onChange={(e) => setSlideCount(parseInt(e.target.value))}
          className="flex-1 h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-xs font-medium text-stone-700 w-6">{slideCount}</span>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-stone-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: Crée un carrousel sur Madère..."
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
