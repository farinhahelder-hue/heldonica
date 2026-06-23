/**
 * Carousel slide export utilities (client-side only)
 */
import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { SlideData, HELDONICA_TOKENS } from '@/app/panel-manager/carousel/tokens'

export interface ExportOptions {
  pixelRatio?: number
  filename?: string
  quality?: number
}

const DEFAULT_PIXEL_RATIO = 2
const DEFAULT_QUALITY = 0.95

/**
 * Export a single slide as PNG
 */
export async function exportSlide(
  slideElement: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const { pixelRatio = DEFAULT_PIXEL_RATIO, filename = 'slide.png' } = options

  try {
    const dataUrl = await toPng(slideElement, {
      pixelRatio,
      quality: DEFAULT_QUALITY,
      cacheBust: true,
    })

    // Convert data URL to blob and save
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('Export slide error:', error)
    throw new Error('Échec de l\'export PNG')
  }
}

/**
 * Export all slides as individual PNGs in a ZIP
 */
export async function exportAllSlides(
  slideElements: HTMLElement[],
  baseFilename: string = 'heldonica-slide'
): Promise<void> {
  const zip = new JSZip()
  const folder = zip.folder('slides')

  if (!folder) {
    throw new Error('Impossible de créer le dossier ZIP')
  }

  // Export each slide
  for (let i = 0; i < slideElements.length; i++) {
    const element = slideElements[i]
    const index = i + 1

    try {
      const dataUrl = await toPng(element, {
        pixelRatio: DEFAULT_PIXEL_RATIO,
        quality: DEFAULT_QUALITY,
        cacheBust: true,
      })

      // Convert base64 to blob
      const base64Data = dataUrl.split(',')[1]
      folder.file(`${baseFilename}-${index}.png`, base64Data, { base64: true })
    } catch (error) {
      console.error(`Export slide ${index} error:`, error)
      throw new Error(`Échec de l'export PNG pour la slide ${index}`)
    }
  }

  // Generate and download ZIP
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, `${baseFilename}s.zip`)
}

/**
 * Generate slide HTML for export
 */
export function generateSlideHTML(
  slide: SlideData,
  width: number,
  height: number,
  tokens: typeof HELDONICA_TOKENS
): string {
  const padding = Math.round(width * 0.08)
  const fontSizeTitle = slide.fontSize === 'lg' ? 72 : slide.fontSize === 'sm' ? 48 : 60
  const fontSizeBody = Math.round(width * 0.035)
  const fontSizeCta = Math.round(width * 0.03)

  return `
    <div style="
      width: ${width}px;
      height: ${height}px;
      background-color: ${slide.backgroundColor || tokens.colors.background};
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: ${padding}px;
      box-sizing: border-box;
      font-family: ${tokens.fonts.body};
    ">
      ${slide.title ? `
        <h1 style="
          font-family: ${tokens.fonts.title};
          font-size: ${fontSizeTitle}px;
          color: ${slide.textColor || tokens.colors.text};
          text-align: center;
          margin: 0 0 ${padding}px 0;
          max-width: ${width - padding * 2}px;
        ">${slide.title}</h1>
      ` : ''}
      
      ${slide.content ? `
        <p style="
          font-size: ${fontSizeBody}px;
          color: ${slide.textColor || tokens.colors.text};
          text-align: center;
          margin: 0;
          max-width: ${width - padding * 2}px;
          line-height: 1.4;
        ">${slide.content}</p>
      ` : ''}
      
      ${slide.cta ? `
        <div style="
          margin-top: ${padding}px;
          padding: ${padding / 2}px ${padding}px;
          background-color: ${tokens.colors.primary};
          border-radius: 8px;
        ">
          <span style="
            font-size: ${fontSizeCta}px;
            color: white;
            font-weight: 600;
          ">${slide.cta}</span>
        </div>
      ` : ''}
    </div>
  `
}

/**
 * Export slides as PNG array for bulk operations
 */
export async function exportSlidesAsArray(
  slides: SlideData[],
  aspectRatio: keyof typeof HELDONICA_TOKENS.aspectRatios,
  tokens: typeof HELDONICA_TOKENS
): Promise<string[]> {
  const ratio = tokens.aspectRatios[aspectRatio]
  const width = ratio.width / 2 // Half size for performance
  const height = ratio.height / 2

  const images: string[] = []

  for (const slide of slides) {
    const html = generateSlideHTML(slide, width, height, tokens)
    
    // Create temporary container
    const container = document.createElement('div')
    container.innerHTML = html
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    document.body.appendChild(container)

    try {
      const element = container.firstElementChild as HTMLElement
      const dataUrl = await toPng(element, {
        pixelRatio: 1,
        quality: DEFAULT_QUALITY,
      })
      images.push(dataUrl)
    } finally {
      document.body.removeChild(container)
    }
  }

  return images
}