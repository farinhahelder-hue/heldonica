'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';

interface RedirectRule {
  id: string
  from: string
  to: string
  type: '301' | '302'
  active: boolean
}

export default function RedirectManager({ data, onSave }: any) {
  const [redirects, setRedirects] = useState<RedirectRule[]>(
    data?.redirects || [
      { id: '1', from: '/anccien', to: '/nouveau', type: '301', active: true }
    ]
  )
  const [newFrom, setNewFrom] = useState('')
  const [newTo, setNewTo] = useState('')
  const [newType, setNewType] = useState<'301' | '302'>('301')

  const addRedirect = () => {
    if (!newFrom || !newTo) return
    
    // Normalize paths
    let from = newFrom.startsWith('/') ? newFrom : '/' + newFrom
    let to = newTo.startsWith('/') ? newTo : '/' + newTo
    
    setRedirects([
      ...redirects,
      {
        id: Date.now().toString(),
        from,
        to,
        type: newType,
        active: true
      }
    ])
    
    setNewFrom('')
    setNewTo('')
  }

  const removeRedirect = (id: string) => {
    setRedirects(redirects.filter(r => r.id !== id))
  }

  const toggleRedirect = (id: string) => {
    setRedirects(redirects.map(r => 
      r.id === id ? { ...r, active: !r.active } : r
    ))
  }

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...data,
        redirects
      })
    }
  }

  // Export for .htaccess or Next.js config
  const generateHtaccess = () => {
    const rules = redirects
      .filter(r => r.active)
      .map(r => `Redirect ${r.type} ${r.from} ${r.to}`)
      .join('\n')
    
    const blob = new Blob([rules], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '.htaccess'
    a.click()
  }

  const generateNextJs = () => {
    const config = redirects
      .filter(r => r.active)
      .map(r => ({
        source: r.from,
        destination: r.to,
        statusCode: parseInt(r.type)
      }))
    
    const json = JSON.stringify(config, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'redirects.json'
    a.click()
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">
        🔄 Redirects Manager
      </h2>

      {/* Add new */}
      <div className="p-4 bg-gray-50 rounded-lg mb-6">
        <h3 className="font-bold text-mahogany mb-3">Ajouter une redirection</h3>
        <div className="grid grid-cols-4 gap-2">
          <Input
            value={newFrom}
            onChange={(e) => setNewFrom(e.target.value)}
            placeholder="/ancien-url"
            className="col-span-1"
          />
          <span className="text-center self-center">→</span>
          <Input
            value={newTo}
            onChange={(e) => setNewTo(e.target.value)}
            placeholder="/nouveau-url"
            className="col-span-1"
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as '301' | '302')}
            className="px-2 border rounded"
          >
            <option value="301">301 Permanent</option>
            <option value="302">302 Temporary</option>
          </select>
        </div>
        <Button onClick={addRedirect} className="mt-3 w-full">
          + Ajouter
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2 mb-6">
        {redirects.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Aucune redirection configurée
          </p>
        ) : (
          redirects.map(redirect => (
            <div 
              key={redirect.id} 
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                redirect.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-50'
              }`}
            >
              <span className={`text-xs px-2 py-1 rounded font-mono ${
                redirect.type === '301' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {redirect.type}
              </span>
              <span className="flex-1 font-mono text-sm">{redirect.from}</span>
              <span className="text-gray-400">→</span>
              <span className="flex-1 font-mono text-sm">{redirect.to}</span>
              <button
                onClick={() => toggleRedirect(redirect.id)}
                className="text-sm"
                title={redirect.active ? 'Désactiver' : 'Activer'}
              >
                {redirect.active ? '👁️' : '👁️‍🗨️'}
              </button>
              <button
                onClick={() => removeRedirect(redirect.id)}
                className="text-red-500 text-sm"
                title="Supprimer"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {/* Save */}
      <div className="flex gap-4 mb-6">
        <Button onClick={handleSave} className="flex-1">
          💾 Sauvegarder
        </Button>
      </div>

      {/* Export */}
      <div className="border-t pt-4">
        <h3 className="font-bold text-mahogany mb-3">Exporter</h3>
        <div className="flex gap-2">
          <Button onClick={generateHtaccess} variant="outline" size="sm">
            📄 .htaccess
          </Button>
          <Button onClick={generateNextJs} variant="outline" size="sm">
            📄 redirects.json
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Compatible Apache (.htaccess) ou Next.js (redirects config)
        </p>
      </div>
    </div>
  );
}