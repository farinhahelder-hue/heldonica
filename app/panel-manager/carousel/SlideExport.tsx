'use client'

import { useState, useCallback } from 'react'
import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { SlideData, HELDONICA_TOKENS, AspectRatio } from './tokens'

interface SlideExportProps {
  slides: SlideData[]
  aspectRatio: AspectRatio
  brandOverlay: boolean
  title: string
  /** Légende et mots-clés, pour l'envoi vers la file Instagram. */
  legende?: string
  motsCles?: string[]
}

export default function SlideExport({
  slides, aspectRatio, brandOverlay, title, legende, motsCles,
}: SlideExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [envoi, setEnvoi] = useState<string | null>(null)

  const ratio = HELDONICA_TOKENS.aspectRatios[aspectRatio]
  const tokens = HELDONICA_TOKENS.colors

  const generateSlideHTML = useCallback((slide: SlideData, targetWidth: number, targetHeight: number): string => {
    const padding = Math.round(targetWidth * 0.08)
    const fontSizeTitle = slide.fontSize === 'lg' ? 72 : slide.fontSize === 'sm' ? 48 : 60
    const fontSizeBody = Math.round(targetWidth * 0.035)
    const fontSizeCta = Math.round(targetWidth * 0.03)
    
    return `
      <div style="
        width: ${targetWidth}px;
        height: ${targetHeight}px;
        background-color: ${slide.backgroundColor || tokens.background};
        position: relative;
        overflow: hidden;
        font-family: 'Inter', -apple-system, sans-serif;
      ">
        ${slide.image ? `
          <div style="
            position: absolute;
            inset: 0;
            background-image: url('${slide.image}');
            background-size: cover;
            background-position: center;
          ">
            <div style="
              position: absolute;
              inset: 0;
              background-color: ${tokens.primary}30;
            "></div>
          </div>
        ` : ''}
        <div style="
          position: absolute;
          inset: 0;
          padding: ${padding}px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        ">
          <h1 style="
            font-family: 'Playfair Display', Georgia, serif;
            font-size: ${fontSizeTitle}px;
            font-weight: bold;
            color: ${slide.textColor || tokens.text};
            margin: 0 0 ${padding}px 0;
            line-height: 1.2;
            max-width: 90%;
            position: relative;
            z-index: 1;
          ">${slide.title}</h1>
          <p style="
            font-size: ${fontSizeBody}px;
            color: ${slide.textColor || tokens.text};
            opacity: 0.9;
            margin: 0;
            max-width: 85%;
            line-height: 1.6;
            position: relative;
            z-index: 1;
          ">${slide.content}</p>
          ${slide.cta ? `
            <button style="
              margin-top: ${padding * 0.75}px;
              padding: ${padding * 0.25}px ${padding * 0.625}px;
              background-color: ${tokens.primary};
              color: white;
              font-size: ${fontSizeCta}px;
              font-weight: 600;
              border: none;
              border-radius: ${padding * 0.25}px;
              position: relative;
              z-index: 1;
            ">${slide.cta}</button>
          ` : ''}
        </div>
        ${brandOverlay ? `
          <div style="
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: ${padding * 0.3}px;
            background-color: ${tokens.primary};
            display: flex;
            justify-content: center;
            align-items: center;
          ">
            <span style="
              color: white;
              font-size: ${fontSizeCta * 0.8}px;
              font-weight: 500;
              letter-spacing: 2px;
              text-transform: uppercase;
            ">✦ Heldonica</span>
          </div>
        ` : ''}
      </div>
    `
  }, [tokens, brandOverlay])

  const exportSingleSlide = async (slide: SlideData, targetRatio: AspectRatio): Promise<Blob | null> => {
    const targetDim = HELDONICA_TOKENS.aspectRatios[targetRatio]
    
    // Create temporary container
    const container = document.createElement('div')
    container.innerHTML = generateSlideHTML(slide, targetDim.width, targetDim.height)
    const slideEl = container.firstElementChild as HTMLElement
    
    if (!slideEl) return null
    
    container.style.cssText = 'position: fixed; left: -9999px; top: 0; width: 1px; height: 1px; overflow: hidden;'
    document.body.appendChild(container)
    
    try {
      const dataUrl = await toPng(slideEl, {
        width: targetDim.width,
        height: targetDim.height,
        pixelRatio: 1,
        quality: 1,
      })
      
      const response = await fetch(dataUrl)
      return await response.blob()
    } catch (err) {
      console.error('Export error:', err)
      return null
    } finally {
      document.body.removeChild(container)
    }
  }

  const handleExportSingle = async () => {
    if (slides.length === 0) return
    
    setIsExporting(true)
    setProgress(0)
    setError(null)
    
    try {
      const blob = await exportSingleSlide(slides[0], aspectRatio)
      
      if (blob) {
        const index = slides[0].title ? slides[0].title.substring(0, 20).replace(/[^a-z0-9]/gi, '_') : 'slide_1'
        saveAs(blob, `${title || 'carousel'}_${index}.png`)
      } else {
        setError('Échec de la génération PNG')
      }
    } catch (err) {
      setError('Erreur lors de l\'export')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportAll = async () => {
    if (slides.length === 0) return
    
    setIsExporting(true)
    setProgress(0)
    setError(null)
    
    const zip = new JSZip()
    
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]
      setProgress(Math.round((i / slides.length) * 100))
      
      const blob = await exportSingleSlide(slide, aspectRatio)
      
      if (blob) {
        const index = String(i + 1).padStart(2, '0')
        const filename = slide.title 
          ? `${index}_${slide.title.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}.png`
          : `slide_${index}.png`
        zip.file(filename, blob)
      }
    }
    
    setProgress(90)
    
    try {
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${title || 'carousel'}_${slides.length}slides.zip`)
      setProgress(100)
    } catch (err) {
      setError('Échec de la création du ZIP')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportAllDimensions = async () => {
    if (slides.length === 0) return
    
    setIsExporting(true)
    setProgress(0)
    setError(null)
    
    const zip = new JSZip()
    const ratios: AspectRatio[] = ['square', 'portrait', 'story']
    
    for (let r = 0; r < ratios.length; r++) {
      const ratio = ratios[r]
      const folder = zip.folder(HELDONICA_TOKENS.aspectRatios[ratio].label.replace('/', '_'))!
      
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i]
        const totalProgress = ((r * slides.length + i) / (ratios.length * slides.length)) * 100
        setProgress(Math.round(totalProgress))
        
        const blob = await exportSingleSlide(slide, ratio)
        
        if (blob) {
          const index = String(i + 1).padStart(2, '0')
          folder.file(`slide_${index}.png`, blob)
        }
      }
    }
    
    try {
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${title || 'carousel'}_all_dimensions.zip`)
      setProgress(100)
    } catch (err) {
      setError('Échec de la création du ZIP')
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Dépose le carrousel dans la file Instagram, en brouillon.
   *
   * Jusqu'ici l'éditeur s'arrêtait à un ZIP : les images atterrissaient dans le
   * dossier de téléchargement, et il fallait les reprendre à la main dans
   * l'application Instagram. Le carrousel rejoint maintenant la même file que
   * les brouillons envoyés depuis le téléphone.
   *
   * Rien n'est publié : l'entrée arrive en `draft`, comme tout le reste.
   */
  const envoyerVersInstagram = async () => {
    if (slides.length < 2) {
      setEnvoi('Un carrousel Instagram demande au moins deux diapositives.')
      return
    }

    setIsExporting(true)
    setEnvoi(null)
    setError(null)
    setProgress(0)

    try {
      // 1. Rendu de chaque diapositive.
      const images: Blob[] = []
      for (let i = 0; i < slides.length; i++) {
        setProgress(Math.round((i / slides.length) * 60))
        const blob = await exportSingleSlide(slides[i], aspectRatio)
        if (!blob) {
          setEnvoi(`La diapositive ${i + 1} n'a pas pu être rendue. Envoi interrompu.`)
          return
        }
        images.push(blob)
      }

      // 2. URL de dépôt signées : les octets vont au stockage sans passer par
      //    une fonction serveur, dont la requête plafonne à 4,5 Mo.
      setProgress(65)
      const noms = images.map((_, i) => `carrousel-${String(i + 1).padStart(2, '0')}.png`)
      const resUrls = await fetch('/api/cms/mobile-publish/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fichiers: noms, dossier: 'carrousels' }),
      })
      if (!resUrls.ok) {
        setEnvoi(
          resUrls.status === 401
            ? 'Session expirée : reconnecte-toi au panneau.'
            : "Le dépôt des images a été refusé."
        )
        return
      }
      const { cibles } = await resUrls.json()

      // 3. Dépôt.
      const urls: string[] = []
      for (let i = 0; i < cibles.length; i++) {
        setProgress(65 + Math.round((i / cibles.length) * 25))
        const dep = await fetch(cibles[i].signedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'image/png' },
          body: images[i],
        })
        if (!dep.ok) {
          setEnvoi(`Le dépôt de l'image ${i + 1} a échoué. Envoi interrompu.`)
          return
        }
        urls.push(cibles[i].url)
      }

      // 4. Entrée dans la file, en brouillon.
      setProgress(95)
      const texte = [legende, (motsCles || []).join(' ')].filter(Boolean).join('\n\n')
      const resFile = await fetch('/api/instagram/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: urls[0],
          caption: texte.slice(0, 2200),
          hashtags: motsCles || [],
          // Sans le type et la liste complète, la file ne verrait que la
          // première diapositive.
          metadata: { type: 'CAROUSEL', children: urls, titre: title || null },
        }),
      })
      if (!resFile.ok) {
        setEnvoi("Les images sont déposées, mais l'entrée dans la file a été refusée.")
        return
      }

      setProgress(100)
      setEnvoi(
        `Carrousel de ${urls.length} images déposé en brouillon. ` +
        'Retrouve-le dans Instagram → Posts programmés.'
      )
    } catch {
      setEnvoi("Envoi impossible : réseau injoignable.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4">
      <h3 className="font-semibold text-stone-800 text-sm mb-3">📥 Export PNG</h3>

      <button
        onClick={envoyerVersInstagram}
        disabled={isExporting || slides.length < 2}
        className="w-full mb-3 px-4 py-2.5 text-sm font-medium bg-[#6b2a1a] text-white rounded-xl hover:bg-[#6b2a1a]/90 disabled:opacity-50 transition-colors"
      >
        📤 Envoyer vers Instagram (brouillon)
      </button>

      {envoi && (
        <p className="mb-3 text-xs text-stone-600 bg-stone-50 rounded-lg p-2">{envoi}</p>
      )}
      
      <div className="space-y-3">
        <div className="text-xs text-stone-500 bg-stone-50 rounded-lg p-2">
          <span className="font-medium">Format actuel:</span> {ratio.label} ({ratio.width}×{ratio.height}px)
        </div>
        
        <button
          onClick={handleExportSingle}
          disabled={isExporting || slides.length === 0}
          className="w-full px-4 py-2 text-sm bg-stone-100 hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
        >
          📷 Exporter slide active
        </button>
        
        <button
          onClick={handleExportAll}
          disabled={isExporting || slides.length === 0}
          className="w-full px-4 py-2 text-sm bg-[#6b2a1a] text-white hover:bg-[#6b2a1a]/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
        >
          📦 Exporter tout ({slides.length} PNGs)
        </button>
        
        <button
          onClick={handleExportAllDimensions}
          disabled={isExporting || slides.length === 0}
          className="w-full px-4 py-2 text-sm border border-[#83C5BE] text-[#83C5BE] hover:bg-[#83C5BE]/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
        >
          🌍 Exporter 3 dimensions (ZIP)
        </button>
        
        {isExporting && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-stone-500 mb-1">
              <span>Export en cours...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#4a7c59] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-xs text-red-500 bg-red-50 rounded-lg p-2">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}