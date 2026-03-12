'use client'

import { useEffect, useCallback } from 'react'
import { useEditorStore } from './lib/store'
import { loadAllFonts } from './lib/constants'
import TopToolbar from './components/TopToolbar'
import LeftPanel from './components/LeftPanel'
import Canvas from './components/Canvas'
import RightPanel from './components/RightPanel'
import BottomToolbar from './components/BottomToolbar'

export default function EditorPage() {
  const { init, isLoading, viewMode, setViewMode, darkMode, showShortcuts, toggleShortcuts, toast,
    presentation, selectedSlideId, selectSlide, save, flash, deleteSlide, duplicateSlide, moveSlide,
    setZoom, zoom, selectedElementId, deleteElement } = useEditorStore()
  const { undo, redo } = useEditorStore.temporal.getState()

  useEffect(() => { init(); loadAllFonts() }, [init])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (viewMode === 'present') {
      if (e.key === 'Escape') { setViewMode('edit'); return }
      const slides = presentation.slides
      const idx = slides.findIndex(s => s.id === selectedSlideId)
      if (e.key === 'ArrowRight' || e.key === ' ') { if (idx < slides.length - 1) selectSlide(slides[idx + 1].id) }
      if (e.key === 'ArrowLeft') { if (idx > 0) selectSlide(slides[idx - 1].id) }
      return
    }
    if (showShortcuts && e.key === 'Escape') { toggleShortcuts(); return }
    const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable
    if (isInput) return
    const ctrl = e.ctrlKey || e.metaKey
    if (ctrl && e.key === 's') { e.preventDefault(); save(); flash('Sauvegardé') }
    if (ctrl && e.key === 'z') { e.preventDefault(); undo() }
    if (ctrl && e.key === 'y') { e.preventDefault(); redo() }
    if (ctrl && e.key === 'd') { e.preventDefault(); if (selectedSlideId) duplicateSlide(selectedSlideId) }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedElementId && selectedSlideId) { deleteElement(selectedSlideId, selectedElementId) }
      else if (selectedSlideId) { deleteSlide(selectedSlideId) }
    }
    if (e.key === 'ArrowUp' && selectedSlideId) { e.preventDefault(); moveSlide(selectedSlideId, -1) }
    if (e.key === 'ArrowDown' && selectedSlideId) { e.preventDefault(); moveSlide(selectedSlideId, 1) }
    if (e.key === ' ' && !ctrl) { e.preventDefault(); setViewMode('present') }
    if (e.key === '=' || e.key === '+') { e.preventDefault(); setZoom(zoom + 10) }
    if (e.key === '-') { e.preventDefault(); setZoom(zoom - 10) }
    if (e.key === '?') toggleShortcuts()
    if (e.key === 'Escape') { setViewMode('edit') }
  }, [viewMode, selectedSlideId, selectedElementId, showShortcuts, presentation, zoom, save, flash, undo, redo, duplicateSlide, deleteSlide, moveSlide, selectSlide, setViewMode, toggleShortcuts, setZoom, deleteElement])

  useEffect(() => { window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown) }, [handleKeyDown])

  if (viewMode === 'present') return <PresenterView />

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="text-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-hearst-500 text-xs font-mono">Chargement...</p></div>
    </div>
  )

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'dark bg-[#0a0a0a]' : 'bg-hearst-50'}`}>
      <TopToolbar />
      <div className="flex-1 flex overflow-hidden" style={{ marginBottom: '36px' }}>
        <LeftPanel />
        <Canvas />
        <RightPanel />
      </div>
      <BottomToolbar />
      {toast && <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-mono px-4 py-2 rounded-full shadow-lg z-50 animate-fade-in">{toast}</div>}
      {showShortcuts && <ShortcutsOverlay onClose={toggleShortcuts} />}
    </div>
  )
}

function PresenterView() {
  const { presentation, selectedSlideId, selectSlide, setViewMode } = useEditorStore()
  const theme = presentation.globalTheme
  const slide = presentation.slides.find(s => s.id === selectedSlideId) || presentation.slides[0]
  if (!slide) return null
  const idx = presentation.slides.findIndex(s => s.id === slide.id)

  const bg = slide.background
  const bgStyle: React.CSSProperties = {}
  if (bg.type === 'solid') bgStyle.backgroundColor = bg.color || '#ffffff'
  else if (bg.type === 'gradient' && bg.gradient) { const stops = bg.gradient.stops.map(s => `${s.color} ${s.position}%`).join(', '); bgStyle.background = `linear-gradient(${bg.gradient.angle || 135}deg, ${stops})` }
  else if (bg.type === 'image' && (bg.image || slide.backgroundImage)) { const src = bg.image?.src || `/images/book/${slide.backgroundImage}`; bgStyle.backgroundImage = `url(${src})`; bgStyle.backgroundSize = 'cover'; bgStyle.backgroundPosition = 'center' }
  bgStyle.opacity = bg.opacity ?? 1

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center cursor-none" onClick={() => { if (idx < presentation.slides.length - 1) selectSlide(presentation.slides[idx + 1].id) }}>
      <div className="relative w-full h-full" style={bgStyle}>
        {slide.type === 'cover' && <div className="w-full h-full flex flex-col items-center justify-center"><img src="/images/hearst-logo-green.svg" alt="" className="w-24 mb-6" /><p className="text-sm tracking-[0.4em] uppercase" style={{ color: theme.colors.textSecondary }}>HEARST CORPORATION</p></div>}
        {slide.type === 'hero' && <div className="w-full h-full flex items-center justify-center bg-black"><h1 className="text-center max-w-[70%]" style={{ fontFamily: `'${theme.typography.displayFont}', sans-serif`, fontSize: theme.typography.h1Size * 1.5, fontWeight: theme.typography.h1Weight, color: theme.colors.accent, lineHeight: 1.1 }}>{slide.name}</h1></div>}
        {slide.type === 'content' && <div className="w-full h-full flex flex-col justify-center px-20">{slide.kicker && <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ fontFamily: `'${theme.typography.monoFont}', monospace`, color: theme.colors.accentDark }}>{slide.kicker}</p>}<h2 style={{ fontFamily: `'${theme.typography.displayFont}', sans-serif`, fontSize: theme.typography.h2Size * 1.5, fontWeight: theme.typography.h2Weight, color: theme.colors.accentDark }}>{slide.name}</h2></div>}
      </div>
      <div className="fixed bottom-6 right-6 flex items-center gap-3 z-[101]">
        <span className="text-white/40 text-xs font-mono">{idx + 1}/{presentation.slides.length}</span>
        <button onClick={e => { e.stopPropagation(); setViewMode('edit') }} className="text-white/40 hover:text-white text-xs font-mono px-2 py-1 rounded border border-white/20 hover:border-white/40 transition-colors">ESC</button>
      </div>
    </div>
  )
}

function ShortcutsOverlay({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    ['Ctrl+S', 'Sauvegarder'], ['Ctrl+Z', 'Annuler'], ['Ctrl+Y', 'Rétablir'], ['Ctrl+D', 'Dupliquer slide'],
    ['Delete', 'Supprimer'], ['↑/↓', 'Déplacer slide'], ['Space', 'Mode présentation'],
    ['+/−', 'Zoom'], ['?', 'Raccourcis'], ['Esc', 'Quitter'],
  ]
  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <h3 className="font-display font-bold text-sm mb-4">Raccourcis clavier</h3>
        <div className="space-y-2">
          {shortcuts.map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between"><span className="text-xs text-hearst-600">{desc}</span><kbd className="text-[10px] font-mono bg-hearst-100 px-2 py-0.5 rounded border border-hearst-200">{key}</kbd></div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full text-xs font-medium py-2 rounded-lg bg-hearst-100 hover:bg-hearst-200 transition-colors">Fermer</button>
      </div>
    </div>
  )
}
