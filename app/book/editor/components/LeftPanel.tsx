'use client'
import { useState } from 'react'
import { Plus, Lock, GripVertical, Copy, Trash2 } from 'lucide-react'
import { useEditorStore } from '../lib/store'
import { SLIDE_TYPE_LABELS } from '../lib/constants'
import type { SlideType } from '../lib/types'

const NEW_SLIDE_TYPES: { type: SlideType; label: string }[] = [
  { type: 'blank', label: 'Vierge' }, { type: 'cover', label: 'Couverture' }, { type: 'hero', label: 'Hero' },
  { type: 'content', label: 'Contenu' }, { type: 'image', label: 'Image' }, { type: 'two-column-text', label: '2 Colonnes' },
  { type: 'three-column', label: '3 Colonnes' }, { type: 'full-image-overlay', label: 'Image Overlay' },
  { type: 'quote', label: 'Citation' }, { type: 'timeline', label: 'Timeline' }, { type: 'comparison', label: 'Comparaison' },
  { type: 'team', label: 'Équipe' }, { type: 'pricing', label: 'Tarifs' }, { type: 'contact', label: 'Contact' },
]

export default function LeftPanel() {
  const { presentation, selectedSlideId, selectSlide, reorderSlides, addSlide, deleteSlide, duplicateSlide } = useEditorStore()
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [contextSlide, setContextSlide] = useState<string | null>(null)

  return (
    <div className="w-52 flex-shrink-0 bg-white border-r border-hearst-200 flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-hearst-100 flex items-center justify-between">
        <span className="text-[10px] font-mono text-hearst-400 uppercase tracking-wider">Slides ({presentation.slides.length})</span>
        <div className="relative">
          <button onClick={() => setShowAddMenu(!showAddMenu)} className="p-1 rounded hover:bg-accent/10 text-hearst-500 hover:text-accent transition-colors"><Plus className="w-4 h-4" /></button>
          {showAddMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-hearst-200 z-50 max-h-64 overflow-y-auto">
              {NEW_SLIDE_TYPES.map(t => (<button key={t.type} onClick={() => { addSlide(t.type, selectedSlideId || undefined); setShowAddMenu(false) }} className="w-full text-left px-3 py-1.5 text-xs text-hearst-600 hover:bg-accent/10 hover:text-black transition-colors">{t.label}</button>))}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1.5">
        {presentation.slides.map((sl, idx) => (
          <div key={sl.id} draggable={!sl.locked} onDragStart={() => setDragIdx(idx)} onDragOver={e => e.preventDefault()}
            onDrop={() => { if (dragIdx !== null && dragIdx !== idx) reorderSlides(dragIdx, idx); setDragIdx(null) }}
            onClick={() => selectSlide(sl.id)}
            onContextMenu={e => { e.preventDefault(); setContextSlide(contextSlide === sl.id ? null : sl.id) }}
            className={`group mx-1.5 mb-1 rounded-lg cursor-pointer transition-all duration-100 ${selectedSlideId === sl.id ? 'ring-2 ring-accent ring-offset-1' : 'hover:bg-hearst-50'}`}>
            <div className="flex items-start gap-1.5 p-1.5">
              <div className="pt-1 opacity-0 group-hover:opacity-40 transition-opacity">{!sl.locked && <GripVertical className="w-3 h-3 text-hearst-400" />}</div>
              <div className="flex-1 min-w-0">
                <div className="aspect-video rounded overflow-hidden relative border border-hearst-100">
                  {sl.backgroundImage ? <img src={`/images/book/${sl.backgroundImage}`} alt="" className="w-full h-full object-cover" />
                    : <div className={`w-full h-full flex items-center justify-center ${sl.type === 'content' || sl.type === 'cover' || sl.type === 'blank' ? 'bg-white' : 'bg-black'}`}>
                      {(sl.type === 'hero' || sl.type === 'cover') && <img src="/images/hearst-logo-green.svg" alt="" className="w-5 h-auto opacity-20" />}
                      {sl.type === 'content' && <div className="px-2 w-full"><div className="h-0.5 w-5 bg-accent rounded mb-1" /><div className="h-0.5 w-full bg-hearst-100 rounded mb-0.5" /><div className="h-0.5 w-2/3 bg-hearst-100 rounded" /></div>}
                    </div>}
                  <div className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[7px] font-mono px-1 rounded">{String(idx + 1).padStart(2, '0')}</div>
                  {sl.locked && <div className="absolute top-0.5 right-0.5"><Lock className="w-2.5 h-2.5 text-white/60" /></div>}
                </div>
                <p className="text-[8px] font-mono text-hearst-400 mt-0.5 truncate">{SLIDE_TYPE_LABELS[sl.type] || sl.type}</p>
                <p className="text-[9px] font-semibold text-hearst-700 truncate leading-tight">{sl.name}</p>
              </div>
            </div>
            {contextSlide === sl.id && (
              <div className="mx-2 mb-1.5 flex gap-1">
                <button onClick={e => { e.stopPropagation(); duplicateSlide(sl.id); setContextSlide(null) }} className="flex-1 flex items-center justify-center gap-1 text-[9px] py-1 rounded border border-hearst-200 text-hearst-500 hover:bg-hearst-50"><Copy className="w-2.5 h-2.5" /> Dup</button>
                {!sl.locked && <button onClick={e => { e.stopPropagation(); deleteSlide(sl.id); setContextSlide(null) }} className="flex-1 flex items-center justify-center gap-1 text-[9px] py-1 rounded border border-red-200 text-red-500 hover:bg-red-50"><Trash2 className="w-2.5 h-2.5" /> Suppr</button>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
