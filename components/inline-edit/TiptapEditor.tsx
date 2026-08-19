'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export default function TiptapEditor({ 
  value, 
  onChange,
  className = ''
}: { 
  value: string
  onChange: (html: string) => void
  className?: string
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm focus:outline-none max-w-none ${className}`,
      },
    },
  })

  return (
    <div className="bg-white border border-stone-200 rounded-md shadow-sm">
      <div className="border-b border-stone-200 p-1 flex flex-wrap gap-1 bg-stone-50 rounded-t-md">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`px-2 py-1 text-sm rounded hover:bg-stone-200 font-bold ${editor?.isActive('bold') ? 'bg-stone-200' : ''}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-sm rounded hover:bg-stone-200 italic ${editor?.isActive('italic') ? 'bg-stone-200' : ''}`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 text-sm rounded hover:bg-stone-200 ${editor?.isActive('bulletList') ? 'bg-stone-200' : ''}`}
        >
          • Liste
        </button>
      </div>
      <div className="p-2 min-h-[100px] max-h-[300px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
