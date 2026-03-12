'use client'
import Link from 'next/link'
import { Undo2, Redo2, Save, Download, Eye, Moon, Sun, Keyboard, ChevronDown } from 'lucide-react'
import { useEditorStore } from '../lib/store'

export default function TopToolbar() {
  const { presentation, darkMode, presentations, isPresentationListOpen, toggleDarkMode, toggleShortcuts, togglePresentationList, save, flash, loadPresentation, createPresentation, duplicatePresentation, deletePresentation, setViewMode, setActiveTab } = useEditorStore()
  const { undo, redo, pastStates, futureStates } = useEditorStore.temporal.getState()
  return (
    <header className={`sticky top-0 z-50 border-b ${darkMode ? 'bg-[#0a0a0a] border-[#222]' : 'bg-black border-hearst-800'}`}>
      <div className="max-w-[1920px] mx-auto px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/images/hearst-logo-green.svg" alt="Hearst" className="w-7 h-auto" />
          <div className="relative">
            <button onClick={togglePresentationList} className="flex items-center gap-1.5 group">
              <div>
                <h1 className="text-white font-display font-bold text-sm leading-tight group-hover:text-accent transition-colors">{presentation.name}</h1>
                <p className="text-hearst-500 text-[10px] font-mono tracking-wider">{presentation.slides.length} slides · {presentation.dimensions.aspectRatio}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-hearst-500 group-hover:text-white transition-colors" />
            </button>
            {isPresentationListOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-hearst-200 overflow-hidden z-[60]">
                <div className="p-2 border-b border-hearst-100">
                  <button onClick={() => { const name = prompt('Nom du nouveau document :'); if (name?.trim()) { createPresentation(name.trim()); togglePresentationList() } }} className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-accent/10 text-black">+ Nouvelle présentation</button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {presentations.map(p => (
                    <div key={p.id} className={`flex items-center justify-between px-3 py-2 hover:bg-hearst-50 cursor-pointer ${p.id === presentation.id ? 'bg-accent/10' : ''}`}>
                      <div className="flex-1 min-w-0" onClick={() => { loadPresentation(p.id); togglePresentationList() }}>
                        <p className="text-xs font-semibold text-black truncate">{p.name}</p>
                        <p className="text-[9px] text-hearst-400 font-mono">{p.slides.length} slides · {new Date(p.updatedAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => duplicatePresentation(p.id)} className="text-[9px] px-1.5 py-0.5 rounded border border-hearst-200 text-hearst-500 hover:bg-hearst-100">Dup</button>
                        {presentations.length > 1 && <button onClick={() => deletePresentation(p.id)} className="text-[9px] px-1.5 py-0.5 rounded border border-red-200 text-red-500 hover:bg-red-50">×</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => undo()} disabled={pastStates.length === 0} className="p-1.5 rounded text-hearst-400 hover:text-white disabled:opacity-30 transition-colors" title="Annuler (Ctrl+Z)"><Undo2 className="w-4 h-4" /></button>
          <button onClick={() => redo()} disabled={futureStates.length === 0} className="p-1.5 rounded text-hearst-400 hover:text-white disabled:opacity-30 transition-colors" title="Rétablir (Ctrl+Y)"><Redo2 className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-hearst-700 mx-1" />
          <button onClick={() => { save(); flash('Sauvegardé') }} className="p-1.5 rounded text-hearst-400 hover:text-white transition-colors" title="Sauvegarder (Ctrl+S)"><Save className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setActiveTab('export')} className="flex items-center gap-1 text-[10px] font-mono text-hearst-400 hover:text-white px-2 py-1 rounded border border-hearst-700 hover:border-hearst-500 transition-colors"><Download className="w-3 h-3" />Export</button>
          <button onClick={toggleDarkMode} className="p-1.5 rounded text-hearst-400 hover:text-white transition-colors" title="Mode sombre">{darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
          <button onClick={toggleShortcuts} className="p-1.5 rounded text-hearst-400 hover:text-white transition-colors" title="Raccourcis (?)"><Keyboard className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('present')} className="flex items-center gap-1 text-[10px] font-mono bg-accent text-black px-3 py-1 rounded font-bold hover:bg-accent-light transition-colors"><Eye className="w-3 h-3" />Présenter</button>
          <Link href="/book" className="text-[10px] font-mono text-hearst-400 hover:text-white px-2 py-1 rounded border border-hearst-700 hover:border-hearst-500 transition-colors">Viewer →</Link>
        </div>
      </div>
    </header>
  )
}
