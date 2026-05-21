'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ExportItem {
  type: 'blog' | 'destination' | 'page' | 'settings'
  count: number
}

export default function ExportData({ data, onSave }: any) {
  const [exporting, setExporting] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [csvUrl, setCsvUrl] = useState<string | null>(null)

  const getCounts = (): ExportItem[] => {
    const items: ExportItem[] = [
      { type: 'blog', count: data?.posts?.length || 0 },
      { type: 'destination', count: data?.destinations?.length || 0 },
      { type: 'page', count: data?.pages?.length || 0 },
    ]
    return items
  }

  const exportJson = () => {
    setExporting(true)
    
    // Build export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      siteSettings: data?.site || {},
      blogPosts: data?.posts || [],
      destinations: data?.destinations || [],
      pages: data?.pages || [],
    }
    
    // Create blob and download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    setDownloadUrl(url)
    setExporting(false)
  }

  const exportCsv = () => {
    setExporting(true)
    
    // Flatten blog posts for CSV
    const rows = [['title', 'slug', 'category', 'published', 'created', 'excerpt']]
    
    const posts = data?.posts || []
    posts.forEach((post: any) => {
      rows.push([
        post.title || '',
        post.slug || '',
        post.category || '',
        post.published ? 'yes' : 'no',
        post.createdAt || '',
        (post.excerpt || '').replace(/"/g, '""'), // Escape quotes
      ])
    })
    
    const csvContent = rows.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    setCsvUrl(url)
    setExporting(false)
  }

  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        
        // Validate structure
        if (imported.version && imported.exportedAt) {
          alert(`Import confirmé!\n- ${imported.blogPosts?.length || 0} articles\n- ${imported.destinations?.length || 0} destinations`)
          
          // Here you'd merge with existing data
          if (onSave) {
            onSave({
              ...data,
              site: imported.siteSettings || data?.site,
              posts: imported.blogPosts || data?.posts,
              destinations: imported.destinations || data?.destinations,
              pages: imported.pages || data?.pages,
            })
          }
        } else {
          alert('Format de fichier non reconnu')
        }
      } catch (err) {
        alert('Erreur lecture fichier')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">
        📤 Export & Import
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {getCounts().map(item => (
          <div key={item.type} className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-mahogany">{item.count}</p>
            <p className="text-sm text-gray-500 capitalize">{item.type}s</p>
          </div>
        ))}
      </div>

      {/* Export options */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <Button 
            onClick={exportJson}
            disabled={exporting}
            className="flex-1"
          >
            📥 Export JSON
          </Button>
          <Button 
            onClick={exportCsv}
            disabled={exporting}
            variant="outline"
            className="flex-1"
          >
            📊 Export CSV
          </Button>
        </div>

        {/* Download links */}
        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`heldonica-export-${new Date().toISOString().split('T')[0]}.json`}
            className="block text-center text-green-600 text-sm hover:underline"
            onClick={() => setDownloadUrl(null)}
          >
            ⬇️ Télécharger JSON
          </a>
        )}
        
        {csvUrl && (
          <a
            href={csvUrl}
            download={`heldonica-blog-${new Date().toISOString().split('T')[0]}.csv`}
            className="block text-center text-green-600 text-sm hover:underline"
            onClick={() => setCsvUrl(null)}
          >
            ⬇️ Télécharger CSV
          </a>
        )}

        {/* Import */}
        <div className="border-t pt-4 mt-4">
          <h3 className="font-bold text-mahogany mb-3">Importer</h3>
          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={importJson}
              className="hidden"
              id="import-json"
            />
            <label
              htmlFor="import-json"
              className="block text-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-eucalyptus"
            >
              📤 Importer un fichier JSON de sauvegarde
            </label>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Remplace le contenu existant (à utiliser avec précaution)
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Exportez régulièrement pour sauvegarder votre contenu. 
          Utile pour migrer ou en cas de problème.
        </p>
      </div>
    </div>
  );
}