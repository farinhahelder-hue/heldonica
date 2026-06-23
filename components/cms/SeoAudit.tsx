'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface AuditIssue {
  type: 'error' | 'warning' | 'info'
  page: string
  message: string
  fix?: string
}

export default function SeoAudit({ data, onSave }: any) {
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState<AuditIssue[]>([])
  const [lastScan, setLastScan] = useState<string | null>(null)

  const runAudit = async () => {
    setScanning(true)
    setResults([])
    
    const issues: AuditIssue[] = []
    
    // Simulate scanning existing content
    // In production, this would query Supabase
    
    // Check site settings
    if (!data?.site?.title) {
      issues.push({
        type: 'error',
        page: '🏠 Site Settings',
        message: 'Titre du site manquant',
        fix: 'Ajouter un titre dans Paramètres du Site'
      })
    }
    
    if (!data?.site?.description) {
      issues.push({
        type: 'error',
        page: '🏠 Site Settings',
        message: 'Meta description manquante',
        fix: 'Ajouter une description dans Paramètres du Site'
      })
    }
    
    if (!data?.site?.ogImage) {
      issues.push({
        type: 'warning',
        page: '🏠 Site Settings',
        message: 'Image OG par défaut manquante',
        fix: 'Ajouter une image OG dans SEO Settings'
      })
    }
    
    if (!data?.site?.metaKeywords) {
      issues.push({
        type: 'info',
        page: '🏠 Site Settings',
        message: 'Mots-clés SEO non configurés',
        fix: 'Ajouter des mots-clés dans SEO Settings'
      })
    }
    
    // Check pages
    const pages = data?.pages || []
    pages.forEach((page: any) => {
      // Validate page structure
      if (!page.slug) {
        issues.push({
          type: 'error',
          page: page.name || 'Page',
          message: 'Slug manquant',
          fix: 'Ajouter un slug'
        })
      }
      
      // Check sections for images without alt
      const sections = page.sections || []
      sections.forEach((section: any, idx: number) => {
        if (section.type === 'image' && !section.alt) {
          issues.push({
            type: 'warning',
            page: `${page.name} (section ${idx + 1})`,
            message: 'Image sans texte alternatif',
            fix: 'Ajouter alt="..." à l\'image'
          })
        }
        
        if ((section.type === 'hero' || section.type === 'gallery') && section.image) {
          // Assume no alt if not set
        }
        
        if (section.type === 'video' && !section.videoUrl) {
          issues.push({
            type: 'warning',
            page: `${page.name} (section ${idx + 1})`,
            message: 'Section vidéo sans URL',
            fix: 'Ajouter une URL ou uploader une vidéo'
          })
        }
      })
    })
    
    // Check blog posts
    const posts = data?.posts || []
    posts.forEach((post: any) => {
      if (!post.title) {
        issues.push({
          type: 'error',
          page: '📝 Blog',
          message: 'Article sans titre',
          fix: 'Ajouter un titre'
        })
      }
      
      if (!post.slug) {
        issues.push({
          type: 'error',
          page: '📝 Blog',
          message: 'Article sans slug/URL',
          fix: 'Générer un slug automatique'
        })
      }
      
      if (!post.excerpt && post.content?.length > 500) {
        issues.push({
          type: 'info',
          page: `📝 ${post.title?.slice(0, 30)}...`,
          message: 'Pas de résumé (excerpt)',
          fix: 'Ajouter un excerpt pour SEO et listes'
        })
      }
      
      // Check for images in content
      if (post.content && !post.content.includes('alt=')) {
        issues.push({
          type: 'warning',
          page: `📝 ${post.title?.slice(0, 30)}...`,
          message: 'Images sans texte alt',
          fix: 'Ajouter alt="description" aux images'
        })
      }
    })
    
    // Check destinations
    const destinations = data?.destinations || []
    destinations.forEach((dest: any) => {
      if (!dest.highlights || dest.highlights.length === 0) {
        issues.push({
          type: 'info',
          page: `📍 ${dest.name || 'Destination'}`,
          message: 'Pas de points forts listés',
          fix: 'Ajouter des highlights'
        })
      }
    })
    
    // Simulate scan delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Add overall score if issues found
    if (issues.length === 0) {
      issues.push({
        type: 'info',
        page: '✅',
        message: 'Audit SEO terminé - Aucune erreur trouvée !',
        fix: undefined
      })
    }
    
    setResults(issues)
    setLastScan(new Date().toLocaleString('fr-FR'))
    setScanning(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-bold text-mahogany">
          🔍 Analyse SEO
        </h2>
        <Button 
          onClick={runAudit} 
          disabled={scanning}
          variant="outline"
        >
          {scanning ? '⏳ Analyse en cours...' : '▶️ Lancer l\'audit'}
        </Button>
      </div>

      {lastScan && (
        <p className="text-sm text-gray-500 mb-4">
          Dernier audit: {lastScan}
        </p>
      )}

      {results.length === 0 && !scanning && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">🔍</p>
          <p>Cliquez "Lancer l’audit" pour analyser votre contenu</p>
          <p className="text-sm mt-2">Détecte: titres, descriptions, images, liens...</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          {/* Summary */}
          <div className="flex gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {results.filter(r => r.type === 'error').length}
              </p>
              <p className="text-xs text-gray-500">Erreurs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">
                {results.filter(r => r.type === 'warning').length}
              </p>
              <p className="text-xs text-gray-500">Avertissements</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {results.filter(r => r.type === 'info').length}
              </p>
              <p className="text-xs text-gray-500">Suggestions</p>
            </div>
          </div>

          {/* Issues list */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {results.map((issue, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  issue.type === 'error' 
                    ? 'border-red-500 bg-red-50' 
                    : issue.type === 'warning'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    {issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{issue.page}</p>
                    <p className="text-gray-700">{issue.message}</p>
                    {issue.fix && (
                      <p className="text-xs text-green-600 mt-1">
                        → {issue.fix}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}