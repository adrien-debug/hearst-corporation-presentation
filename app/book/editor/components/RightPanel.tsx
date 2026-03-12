'use client'
import { useEditorStore } from '../lib/store'
import { AVAILABLE_IMAGES } from '../lib/constants'
import type { EditorTab } from '../lib/types'
import { LayoutGrid, Type as TypeIcon, Palette, FileStack, FolderOpen, Download, Layers } from 'lucide-react'

const TABS: { id: EditorTab; label: string; icon: React.ElementType }[] = [
  { id: 'slides', label: 'Slides', icon: LayoutGrid }, { id: 'typography', label: 'Typo', icon: TypeIcon },
  { id: 'colors', label: 'Couleurs', icon: Palette }, { id: 'backgrounds', label: 'Fonds', icon: Layers },
  { id: 'templates', label: 'Templates', icon: FileStack }, { id: 'assets', label: 'Assets', icon: FolderOpen },
  { id: 'export', label: 'Export', icon: Download },
]

export default function RightPanel() {
  const { activeTab, setActiveTab } = useEditorStore()
  return (
    <div className="w-72 flex-shrink-0 bg-white border-l border-hearst-200 flex flex-col h-full">
      <div className="border-b border-hearst-100 px-1 py-1 flex flex-wrap gap-0.5">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1 px-2 py-1.5 rounded text-[10px] font-medium transition-colors ${activeTab === t.id ? 'bg-accent/15 text-black' : 'text-hearst-400 hover:text-hearst-600 hover:bg-hearst-50'}`}>
            <t.icon className="w-3 h-3" />{t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto"><PanelContent tab={activeTab} /></div>
    </div>
  )
}

function PanelContent({ tab }: { tab: EditorTab }) {
  switch (tab) {
    case 'slides': return <SlidePropertiesPanel />
    default: return <div className="p-4 text-center text-xs text-hearst-400">Panneau {tab}</div>
  }
}

function SlidePropertiesPanel() {
  const { presentation, selectedSlideId, updateSlideName, updateSlideNotes, moveSlide, deleteSlide, duplicateSlide, updateSlideBackgroundImage } = useEditorStore()
  const selectedSlide = presentation.slides.find(s => s.id === selectedSlideId)
  if (!selectedSlide) return <div className="p-4 text-center"><p className="text-xs text-hearst-400">Sélectionnez une slide</p></div>
  return (
    <div className="p-3 space-y-4">
      <div><label className="text-[10px] font-semibold text-hearst-500 uppercase tracking-wider">Nom</label>
        <input type="text" value={selectedSlide.name} onChange={e => updateSlideName(selectedSlide.id, e.target.value)} className="w-full mt-1 px-2 py-1.5 rounded border border-hearst-200 text-xs focus:outline-none focus:ring-1 focus:ring-accent/40" /></div>
      {(selectedSlide.type === 'image' || selectedSlide.type === 'custom-image' || selectedSlide.type === 'full-image-overlay') && (
        <div><label className="text-[10px] font-semibold text-hearst-500 uppercase tracking-wider">Image de fond</label>
          <div className="grid grid-cols-3 gap-1 mt-1 max-h-32 overflow-y-auto">
            {AVAILABLE_IMAGES.map(img => (<button key={img} onClick={() => updateSlideBackgroundImage(selectedSlide.id, img)} className={`rounded overflow-hidden aspect-video ${selectedSlide.backgroundImage === img ? 'ring-2 ring-accent' : 'opacity-60 hover:opacity-100'}`}><img src={`/images/book/${img}`} alt="" className="w-full h-full object-cover" /></button>))}
          </div></div>
      )}
      <div><label className="text-[10px] font-semibold text-hearst-500 uppercase tracking-wider">Notes</label>
        <textarea value={selectedSlide.notes || ''} onChange={e => updateSlideNotes(selectedSlide.id, e.target.value)} rows={3} placeholder="Notes..." className="w-full mt-1 px-2 py-1.5 rounded border border-hearst-200 text-xs focus:outline-none focus:ring-1 focus:ring-accent/40 resize-none" /></div>
      <div className="flex gap-1.5">
        <button onClick={() => moveSlide(selectedSlide.id, -1)} className="flex-1 text-[10px] py-1.5 rounded border border-hearst-200 text-hearst-600 hover:bg-hearst-50">← Avant</button>
        <button onClick={() => moveSlide(selectedSlide.id, 1)} className="flex-1 text-[10px] py-1.5 rounded border border-hearst-200 text-hearst-600 hover:bg-hearst-50">Après →</button>
      </div>
      <button onClick={() => duplicateSlide(selectedSlide.id)} className="w-full text-[10px] py-1.5 rounded border border-hearst-200 text-hearst-600 hover:bg-hearst-50">Dupliquer</button>
      {!selectedSlide.locked && <button onClick={() => deleteSlide(selectedSlide.id)} className="w-full text-[10px] py-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50">Supprimer</button>}
    </div>
  )
}
