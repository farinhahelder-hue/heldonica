'use client';

import { useState, useCallback, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { GripVertical, Plus, Trash2, Bold, Italic, Link, Type, ImageIcon, Quote, List, ListOrdered, Minus, Info, Lightbulb, Video } from 'lucide-react';

// ===== Types =====
export type BlockType = 'paragraph' | 'h2' | 'h3' | 'quote' | 'bullet' | 'numbered' | 'image' | 'hr' | 'info' | 'astuce' | 'embed' | 'html-legacy';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  meta?: Record<string, string>; // alt text, embed url, focal point, etc.
}

export interface BlockEditorProps {
  value: string; // HTML string
  onChange: (html: string) => void;
  placeholder?: string;
}

// ===== Helpers =====
const generateId = () => Math.random().toString(36).slice(2, 11);

const htmlToBlocks = (html: string): Block[] => {
  if (!html || !html.trim()) return [{ id: generateId(), type: 'paragraph', content: '' }];
  
  // Check if legacy HTML (no recognized block structure)
  if (!html.includes('<p>') && !html.includes('<h2>') && !html.includes('<h3>') && 
      !html.includes('<blockquote>') && !html.includes('<ul>') && !html.includes('<ol>')) {
    return [{ id: generateId(), type: 'html-legacy', content: html }];
  }

  const blocks: Block[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const children = doc.querySelector('div')?.children;
  
  if (!children) return [{ id: generateId(), type: 'paragraph', content: html }];

  Array.from(children).forEach(el => {
    const tag = el.tagName.toLowerCase();
    const content = el.innerHTML;
    
    switch (tag) {
      case 'h2':
        blocks.push({ id: generateId(), type: 'h2', content });
        break;
      case 'h3':
        blocks.push({ id: generateId(), type: 'h3', content });
        break;
      case 'blockquote':
        blocks.push({ id: generateId(), type: 'quote', content });
        break;
      case 'ul':
        blocks.push({ id: generateId(), type: 'bullet', content });
        break;
      case 'ol':
        blocks.push({ id: generateId(), type: 'numbered', content });
        break;
      case 'hr':
        blocks.push({ id: generateId(), type: 'hr', content: '' });
        break;
      case 'img':
        blocks.push({
          id: generateId(), type: 'image',
          content: el.getAttribute('src') || '',
          meta: { alt: el.getAttribute('alt') || '' }
        });
        break;
      case 'iframe':
        blocks.push({
          id: generateId(), type: 'embed',
          content: el.getAttribute('src') || '',
          meta: { type: 'iframe' }
        });
        break;
      case 'div':
        if (content.includes('info-box')) {
          blocks.push({ id: generateId(), type: 'info', content: el.textContent || '' });
        } else if (content.includes('astuce')) {
          blocks.push({ id: generateId(), type: 'astuce', content: el.textContent || '' });
        } else {
          blocks.push({ id: generateId(), type: 'paragraph', content });
        }
        break;
      default:
        if (content.trim()) {
          blocks.push({ id: generateId(), type: 'paragraph', content });
        }
    }
  });

  return blocks.length > 0 ? blocks : [{ id: generateId(), type: 'paragraph', content: '' }];
};

const blocksToHtml = (blocks: Block[]): string => {
  return blocks.map(block => {
    switch (block.type) {
      case 'h2': return `<h2>${block.content}</h2>`;
      case 'h3': return `<h3>${block.content}</h3>`;
      case 'quote': return `<blockquote><p>${block.content}</p></blockquote>`;
      case 'bullet': return `<ul>${block.content.split('</li>').filter(l => l.includes('<li>')).map(l => l.replace(/<[^>]*>/g, '')).map(l => `<li>${l}</li>`).join('')}</ul>`;
      case 'numbered': return `<ol>${block.content.split('</li>').filter(l => l.includes('<li>')).map(l => l.replace(/<[^>]*>/g, '')).map(l => `<li>${l}</li>`).join('')}</ol>`;
      case 'image': return block.content ? `<figure><img src="${block.content}" alt="${block.meta?.alt || ''}" style="width:100%;border-radius:0.75rem;" />${block.meta?.alt ? `<figcaption>${block.meta.alt}</figcaption>` : ''}</figure>` : '';
      case 'hr': return '<hr style="border:none;border-top:1px solid #e8e0d8;margin:2rem 0;" />';
      case 'info': return `<div class="info-box" style="background:#e6f4f4;border-left:4px solid #01696f;padding:1rem 1.5rem;border-radius:0.5rem;margin:1rem 0;"><p style="margin:0;color:#004d52;">${block.content}</p></div>`;
      case 'astuce': return `<div class="astuce-box" style="background:#fdf3f1;border-left:4px solid #6b2a1a;padding:1rem 1.5rem;border-radius:0.5rem;margin:1rem 0;"><p style="margin:0;color:#4a1c12;"><strong>💡 Astuce terrain :</strong> ${block.content}</p></div>`;
      case 'embed': return block.content ? `<div style="aspect-ratio:16/9;margin:1rem 0;"><iframe src="${block.content}" style="width:100%;height:100%;border:none;border-radius:0.75rem;" allowfullscreen /></div>` : '';
      case 'html-legacy': return `<div class="legacy-content" data-legacy="true" style="background:#fff3cd;padding:1rem;border-radius:0.5rem;margin:1rem 0;">${block.content}</div>`;
      default: return block.content ? `<p>${block.content}</p>` : '';
    }
  }).join('\n');
};

// ===== Block Commands Menu =====
const BLOCK_COMMANDS = [
  { type: 'paragraph' as BlockType, label: 'Paragraphe', description: 'Texte courant', icon: Type },
  { type: 'h2' as BlockType, label: 'Titre H2', description: 'Grand titre de section', icon: Type },
  { type: 'h3' as BlockType, label: 'Titre H3', description: 'Sous-titre', icon: Type },
  { type: 'quote' as BlockType, label: 'Citation', description: 'Blockquote stylée', icon: Quote },
  { type: 'bullet' as BlockType, label: 'Liste à puces', description: 'Liste non numérotée', icon: List },
  { type: 'numbered' as BlockType, label: 'Liste numérotée', description: 'Liste ordonnée', icon: ListOrdered },
  { type: 'image' as BlockType, label: 'Image', description: 'Upload ou URL', icon: ImageIcon },
  { type: 'hr' as BlockType, label: 'Séparateur', description: 'Ligne horizontale', icon: Minus },
  { type: 'info' as BlockType, label: 'Info box', description: 'Encadré teal #01696f', icon: Info },
  { type: 'astuce' as BlockType, label: 'Astuce terrain', description: 'Encadré bordeaux #6b2a1a', icon: Lightbulb },
  { type: 'embed' as BlockType, label: 'Embed', description: 'Vidéo YouTube/Vimeo', icon: Video },
];

// ===== Main Component =====
export default function BlockEditor({ value, onChange, placeholder = 'Commencez à écrire ou tapez "/" pour les commandes…' }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(() => htmlToBlocks(value));
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCommandMenu, setShowCommandMenu] = useState<{ blockId: string; filter: string } | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Sync blocks to parent on change
  useEffect(() => {
    const html = blocksToHtml(blocks);
    if (html !== value) {
      onChange(html);
    }
  }, [blocks, value, onChange]);

  // Update a block's content
  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  // Add new block after current
  const addBlockAfter = useCallback((afterId: string, type: BlockType = 'paragraph') => {
    const newBlock: Block = { id: generateId(), type, content: '' };
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === afterId);
      const next = [...prev];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    setFocusedId(newBlock.id);
    setShowCommandMenu(null);
  }, []);

  // Delete block and focus previous
  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === 0 && prev.length === 1) {
        // Replace with empty paragraph instead of deleting last block
        return [{ id: generateId(), type: 'paragraph', content: '' }];
      }
      const next = prev.filter(b => b.id !== id);
      if (idx > 0) {
        setTimeout(() => setFocusedId(next[idx - 1].id), 0);
      }
      return next;
    });
  }, []);

  // Handle key events
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>, block: Block) => {
    const isFocused = focusedId === block.id;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlockAfter(block.id, 'paragraph');
    }

    if (e.key === 'Backspace' && !block.content && blocks.length > 1) {
      e.preventDefault();
      deleteBlock(block.id);
    }

    // "/" command trigger
    if (e.key === '/' && !block.content && isFocused) {
      e.preventDefault();
      setShowCommandMenu({ blockId: block.id, filter: '' });
    }

    // Shift+Click for multi-select (handled via mousedown)
    if (e.key === 'Escape') {
      setShowCommandMenu(null);
      setSelectedIds(new Set());
    }
  }, [focusedId, blocks.length, addBlockAfter, deleteBlock]);

  // Handle block click for selection
  const handleBlockMouseDown = useCallback((e: React.MouseEvent, blockId: string) => {
    if (e.shiftKey) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(blockId)) next.delete(blockId);
        else next.add(blockId);
        return next;
      });
    } else {
      setSelectedIds(new Set([blockId]));
    }
  }, []);

  // Filter commands
  const filteredCommands = showCommandMenu
    ? BLOCK_COMMANDS.filter(c => 
        c.label.toLowerCase().includes(showCommandMenu.filter.toLowerCase()) ||
        c.type.includes(showCommandMenu.filter.toLowerCase())
      )
    : BLOCK_COMMANDS;

  // Delete selected blocks
  const deleteSelectedBlocks = useCallback(() => {
    if (selectedIds.size === 0) return;
    setBlocks(prev => {
      let next = prev.filter(b => !selectedIds.has(b.id));
      if (next.length === 0) next = [{ id: generateId(), type: 'paragraph', content: '' }];
      return next;
    });
    setSelectedIds(new Set());
  }, [selectedIds]);

  // Render block content editor
  const renderBlockContent = (block: Block) => {
    const isSelected = selectedIds.has(block.id);
    
    switch (block.type) {
      case 'h2':
        return (
          <input
            ref={el => { inputRefs.current[block.id] = el; }}
            value={block.content}
            onChange={(e: ChangeEvent<HTMLInputElement>) => updateBlock(block.id, { content: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, block)}
            onFocus={() => setFocusedId(block.id)}
            placeholder="Titre H2"
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', fontFamily: 'DM Sans, system-ui',
              padding: '0.25rem 0'
            }}
          />
        );
      case 'h3':
        return (
          <input
            ref={el => { inputRefs.current[block.id] = el; }}
            value={block.content}
            onChange={(e: ChangeEvent<HTMLInputElement>) => updateBlock(block.id, { content: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, block)}
            onFocus={() => setFocusedId(block.id)}
            placeholder="Titre H3"
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              fontSize: '1.25rem', fontWeight: 600, color: '#333', fontFamily: 'DM Sans, system-ui',
              padding: '0.25rem 0'
            }}
          />
        );
      case 'quote':
        return (
          <div style={{ borderLeft: '3px solid #6b2a1a', paddingLeft: '1rem', fontStyle: 'italic', color: '#555' }}>
            <input
              ref={el => { inputRefs.current[block.id] = el; }}
              value={block.content}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateBlock(block.id, { content: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, block)}
              onFocus={() => setFocusedId(block.id)}
              placeholder="Citation…"
              style={{
                width: '100%', border: 'none', outline: 'none', background: 'transparent',
                fontSize: '1rem', fontStyle: 'italic', color: '#555', fontFamily: 'DM Sans, system-ui',
                padding: '0.25rem 0'
              }}
            />
          </div>
        );
      case 'hr':
        return <hr style={{ border: 'none', borderTop: '1px solid #e8e0d8', margin: '1rem 0', cursor: 'pointer' }} 
          onClick={() => { updateBlock(block.id, { type: 'paragraph', content: '' }); setFocusedId(block.id); }} />;
      case 'image':
        return (
          <div>
            {block.content ? (
              <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                <img src={block.content} alt={block.meta?.alt || ''} style={{ maxWidth: '100%', borderRadius: '0.75rem' }} />
                <button
                  onClick={() => updateBlock(block.id, { content: '', meta: {} })}
                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >✕</button>
              </div>
            ) : (
              <div style={{ background: '#f8f6f4', border: '2px dashed #e8e0d8', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', cursor: 'pointer' }}>
                <ImageIcon size={32} color="#888" style={{ marginBottom: '0.5rem' }} />
                <p style={{ color: '#888', marginBottom: '0.5rem' }}>Cliquez pour ajouter une URL d'image</p>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateBlock(block.id, { content: e.target.value })}
                  style={{ width: '100%', maxWidth: '300px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.5rem', fontSize: '0.9rem' }}
                />
              </div>
            )}
            {block.content && (
              <input
                type="text"
                value={block.meta?.alt || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateBlock(block.id, { meta: { ...block.meta, alt: e.target.value } })}
                placeholder="Texte alternatif (SEO)"
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', border: '1px solid #e8e0d8', borderRadius: '0.5rem', fontSize: '0.85rem' }}
              />
            )}
          </div>
        );
      case 'info':
        return (
          <div style={{ background: '#e6f4f4', borderLeft: '4px solid #01696f', padding: '1rem 1.5rem', borderRadius: '0.5rem' }}>
            <p style={{ margin: 0, color: '#004d52', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>ℹ️ Info</p>
            <input
              ref={el => { inputRefs.current[block.id] = el; }}
              value={block.content}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateBlock(block.id, { content: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, block)}
              onFocus={() => setFocusedId(block.id)}
              placeholder="Contenu de la box info…"
              style={{
                width: '100%', border: 'none', outline: 'none', background: 'transparent',
                fontSize: '0.95rem', color: '#004d52', fontFamily: 'DM Sans, system-ui'
              }}
            />
          </div>
        );
      case 'astuce':
        return (
          <div style={{ background: '#fdf3f1', borderLeft: '4px solid #6b2a1a', padding: '1rem 1.5rem', borderRadius: '0.5rem' }}>
            <p style={{ margin: 0, color: '#4a1c12', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>💡 Astuce terrain</p>
            <input
              ref={el => { inputRefs.current[block.id] = el; }}
              value={block.content}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateBlock(block.id, { content: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, block)}
              onFocus={() => setFocusedId(block.id)}
              placeholder="Conseil d'initié…"
              style={{
                width: '100%', border: 'none', outline: 'none', background: 'transparent',
                fontSize: '0.95rem', color: '#4a1c12', fontFamily: 'DM Sans, system-ui'
              }}
            />
          </div>
        );
      case 'embed':
        return (
          <div>
            {block.content ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '0.75rem', background: '#000' }}>
                <iframe src={block.content} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen />
              </div>
            ) : (
              <div style={{ background: '#f8f6f4', border: '1px solid #e8e0d8', borderRadius: '0.5rem', padding: '1rem' }}>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Collez l'URL YouTube ou Vimeo :</p>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    let url = e.target.value;
                    // Convert YouTube watch URL to embed URL
                    if (url.includes('youtube.com/watch')) {
                      const videoId = new URL(url).searchParams.get('v');
                      if (videoId) url = `https://www.youtube.com/embed/${videoId}`;
                    }
                    // Convert youtu.be URL
                    if (url.includes('youtu.be/')) {
                      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                      if (videoId) url = `https://www.youtube.com/embed/${videoId}`;
                    }
                    updateBlock(block.id, { content: url });
                  }}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.5rem', fontSize: '0.9rem' }}
                />
              </div>
            )}
          </div>
        );
      case 'html-legacy':
        return (
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '0.5rem', padding: '1rem' }}>
            <p style={{ color: '#856404', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>⚠️ Contenu importé — cliquez pour éditer bloc par bloc</p>
            <button
              onClick={() => {
                const converted = htmlToBlocks(block.content.replace(/<[^>]*>/g, ' ').trim());
                setBlocks(prev => {
                  const idx = prev.findIndex(b => b.id === block.id);
                  const next = [...prev];
                  next.splice(idx, 1, ...converted.map(c => ({ ...c, id: generateId() })));
                  return next;
                });
              }}
              style={{ background: '#ffc107', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.3rem', cursor: 'pointer', fontWeight: 600 }}
            >Convertir en blocs</button>
          </div>
        );
      default:
        return (
          <input
            ref={el => { inputRefs.current[block.id] = el; }}
            value={block.content}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              updateBlock(block.id, { content: e.target.value });
              // Show command menu on "/"
              if (e.target.value.endsWith('/')) {
                setShowCommandMenu({ blockId: block.id, filter: '' });
              }
            }}
            onKeyDown={(e) => handleKeyDown(e, block)}
            onFocus={() => setFocusedId(block.id)}
            placeholder={placeholder}
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              fontSize: '1rem', color: '#333', lineHeight: 1.7, fontFamily: 'DM Sans, system-ui',
              padding: '0.25rem 0'
            }}
          />
        );
    }
  };

  // Auto-focus when new block added
  useEffect(() => {
    if (focusedId && inputRefs.current[focusedId]) {
      inputRefs.current[focusedId]?.focus();
    }
  }, [focusedId]);

  return (
    <div 
      ref={editorRef}
      style={{ 
        fontFamily: 'DM Sans, system-ui, sans-serif',
        background: 'white',
        borderRadius: '1rem',
        border: '1px solid #e8e0d8',
        overflow: 'hidden'
      }}
    >
      {/* Toolbar for selected blocks */}
      {selectedIds.size > 0 && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: '#f5f3ef', borderBottom: '1px solid #e8e0d8',
          padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          <span style={{ fontSize: '0.85rem', color: '#6b2a1a', fontWeight: 600 }}>
            {selectedIds.size} bloc(s) sélectionné(s)
          </span>
          <button
            onClick={deleteSelectedBlocks}
            style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Trash2 size={14} /> Supprimer
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            style={{ background: '#e8e0d5', color: '#333', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Annuler
          </button>
        </div>
      )}

      {/* Blocks */}
      <div style={{ padding: '1rem' }}>
        {blocks.map((block, index) => (
          <div
            key={block.id}
            onMouseDown={(e) => handleBlockMouseDown(e, block.id)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
              marginBottom: block.type === 'hr' ? '0' : '0.5rem',
              background: selectedIds.has(block.id) ? 'rgba(107, 42, 26, 0.05)' : 'transparent',
              borderRadius: '0.5rem',
              transition: 'background 0.15s'
            }}
          >
            {/* Drag handle */}
            <div
              draggable
              onDragStart={() => setDraggedId(block.id)}
              onDragEnd={() => setDraggedId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedId && draggedId !== block.id) {
                  setBlocks(prev => {
                    const from = prev.findIndex(b => b.id === draggedId);
                    const to = prev.findIndex(b => b.id === block.id);
                    const next = [...prev];
                    const [moved] = next.splice(from, 1);
                    next.splice(to, 0, moved);
                    return next;
                  });
                }
                setDraggedId(null);
              }}
              style={{ 
                cursor: 'grab', color: '#ccc', paddingTop: '0.4rem', flexShrink: 0,
                opacity: draggedId === block.id ? 0.5 : 1
              }}
              title="Glisser pour réordonner"
            >
              <GripVertical size={16} />
            </div>

            {/* Block content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {renderBlockContent(block)}
            </div>

            {/* Add block button */}
            {focusedId === block.id && index === blocks.length - 1 && (
              <button
                onClick={() => addBlockAfter(block.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#ccc', paddingTop: '0.4rem', flexShrink: 0
                }}
                title="Ajouter un bloc"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Command menu ("/" popup) */}
      {showCommandMenu && (
        <div style={{
          position: 'absolute', zIndex: 20,
          background: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 20px rgba(0,0,0,.15)',
          border: '1px solid #e8e0d8', padding: '0.5rem', minWidth: '280px', maxHeight: '320px', overflowY: 'auto'
        }}>
          <input
            autoFocus
            value={showCommandMenu.filter}
            onChange={(e) => setShowCommandMenu({ ...showCommandMenu, filter: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowCommandMenu(null);
            }}
            placeholder="Filtrer…"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e8e0d8', borderRadius: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}
          />
          {filteredCommands.map(cmd => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.type}
                onClick={() => {
                  updateBlock(showCommandMenu.blockId, { type: cmd.type, content: '' });
                  if (cmd.type !== 'image' && cmd.type !== 'embed' && cmd.type !== 'hr') {
                    setFocusedId(showCommandMenu.blockId);
                  }
                  setShowCommandMenu(null);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  width: '100%', padding: '0.6rem', border: 'none', background: 'none',
                  cursor: 'pointer', textAlign: 'left', borderRadius: '0.5rem',
                  transition: 'background 0.15s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8f6f4'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <Icon size={18} color="#6b2a1a" />
                <div>
                  <div style={{ fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>{cmd.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>{cmd.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}