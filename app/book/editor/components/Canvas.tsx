'use client'
import { useCallback, useRef, useState } from 'react'
import { useEditorStore } from '../lib/store'
import type { Slide, SlideElement } from '../lib/types'
import { Type, Square, Trash2 } from 'lucide-react'

export default function Canvas() {
  const { presentation, selectedSlideId, selectedElementId, selectElement, addElement, updateElement, deleteElement, zoom } = useEditorStore()
  const canvasRef = useRef<HTMLDivElement>(null)
  const selectedSlide = presentation.slides.find(s => s.id === selectedSlideId)
  const theme = presentation.globalTheme
  const scale = zoom / 100

  const handleAddText = useCallback(() => {
    if (!selectedSlideId) return
    addElement(selectedSlideId, { type: 'text', position: { x: 100, y: 100, z: 1 }, size: { width: 400, height: 60 }, rotation: 0, opacity: 1, content: 'Nouveau texte', style: { fontFamily: theme.typography.displayFont, fontSize: 24, fontWeight: 600, color: theme.colors.textPrimary, textAlign: 'left' } })
  }, [selectedSlideId, addElement, theme])

  const handleAddShape = useCallback(() => {
    if (!selectedSlideId) return
    addElement(selectedSlideId, { type: 'shape', position: { x: 200, y: 200, z: 1 }, size: { width: 200, height: 200 }, rotation: 0, opacity: 1, content: 'rectangle', style: { backgroundColor: theme.colors.accent, border: { width: 0, style: 'solid', radius: 8, color: 'transparent' } } })
  }, [selectedSlideId, addElement, theme])

  if (!selectedSlide) return (
    <div className="flex-1 flex items-center justify-center bg-hearst-50">
      <div className="text-center"><p className="text-hearst-400 text-sm mb-1">Sélectionnez une slide</p><p className="text-hearst-300 text-xs font-mono">Cliquez dans le panneau de gauche</p></div>
    </div>
  )

  const bg = selectedSlide.background
  const bgStyle: React.CSSProperties = {}
  if (bg.type === 'solid') bgStyle.backgroundColor = bg.color || '#ffffff'
  else if (bg.type === 'gradient' && bg.gradient) { const stops = bg.gradient.stops.map(s => `${s.color} ${s.position}%`).join(', '); bgStyle.background = `linear-gradient(${bg.gradient.angle || 135}deg, ${stops})` }
  else if (bg.type === 'image' && (bg.image || selectedSlide.backgroundImage)) { const src = bg.image?.src || `/images/book/${selectedSlide.backgroundImage}`; bgStyle.backgroundImage = `url(${src})`; bgStyle.backgroundSize = 'cover'; bgStyle.backgroundPosition = 'center' }
  else if (bg.type === 'pattern' && bg.pattern) { if (bg.pattern.type === 'dots') { bgStyle.backgroundImage = `radial-gradient(${bg.pattern.color} 1px, transparent 1px)`; bgStyle.backgroundSize = `${bg.pattern.size}px ${bg.pattern.size}px` } else if (bg.pattern.type === 'grid') { bgStyle.backgroundImage = `linear-gradient(${bg.pattern.color} 1px, transparent 1px), linear-gradient(90deg, ${bg.pattern.color} 1px, transparent 1px)`; bgStyle.backgroundSize = `${bg.pattern.size}px ${bg.pattern.size}px` } }
  bgStyle.opacity = bg.opacity

  return (
    <div className="flex-1 flex flex-col bg-hearst-100 overflow-hidden">
      <div className="bg-white border-b border-hearst-200 px-4 py-1.5 flex items-center gap-2">
        <span className="text-[10px] font-mono text-hearst-400 mr-2">Ajouter :</span>
        <button onClick={handleAddText} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border border-hearst-200 text-hearst-600 hover:bg-hearst-50 transition-colors"><Type className="w-3 h-3" /> Texte</button>
        <button onClick={handleAddShape} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border border-hearst-200 text-hearst-600 hover:bg-hearst-50 transition-colors"><Square className="w-3 h-3" /> Forme</button>
        {selectedElementId && <><div className="w-px h-4 bg-hearst-200 mx-1" /><button onClick={() => { if (selectedSlideId && selectedElementId) deleteElement(selectedSlideId, selectedElementId) }} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3 h-3" /> Supprimer</button></>}
      </div>
      <div className="flex-1 overflow-auto flex items-center justify-center p-8" ref={canvasRef}>
        <div className="relative shadow-2xl rounded-lg overflow-hidden" style={{ width: presentation.dimensions.width * 0.5 * scale, height: presentation.dimensions.height * 0.5 * scale }}>
          <div className="absolute inset-0" style={bgStyle} onClick={() => selectElement(null)} />
          {selectedSlide.elements.length === 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {selectedSlide.type === 'cover' && <div className="w-full h-full flex flex-col items-center justify-center"><img src="/images/hearst-logo-green.svg" alt="" className="w-16 mb-4 opacity-80" /><p className="text-[10px] font-mono tracking-[0.3em] uppercase" style={{ color: theme.colors.textSecondary }}>HEARST CORPORATION</p></div>}
              {selectedSlide.type === 'hero' && <div className="w-full h-full flex items-center justify-center bg-black"><h1 className="text-center max-w-[70%]" style={{ fontFamily: `'${theme.typography.displayFont}', sans-serif`, fontSize: Math.min(theme.typography.h1Size, 28), fontWeight: theme.typography.h1Weight, color: theme.colors.accent, lineHeight: 1.15 }}>{selectedSlide.name}</h1></div>}
              {selectedSlide.type === 'content' && <div className="w-full h-full flex flex-col justify-center p-6">{selectedSlide.kicker && <p className="text-[8px] tracking-[0.25em] uppercase mb-2" style={{ fontFamily: `'${theme.typography.monoFont}', monospace`, color: theme.colors.accentDark }}>{selectedSlide.kicker}</p>}<h2 style={{ fontFamily: `'${theme.typography.displayFont}', sans-serif`, fontSize: Math.min(theme.typography.h2Size, 18), fontWeight: theme.typography.h2Weight, color: theme.colors.accentDark, lineHeight: 1.2 }}>{selectedSlide.name}</h2></div>}
            </div>
          )}
          {selectedSlide.elements.map(el => <DraggableElement key={el.id} element={el} isSelected={selectedElementId === el.id} scale={scale} onSelect={() => selectElement(el.id)} onUpdate={(patch) => updateElement(selectedSlide.id, el.id, patch)} />)}
        </div>
      </div>
    </div>
  )
}

function DraggableElement({ element, isSelected, scale, onSelect, onUpdate }: { element: SlideElement; isSelected: boolean; scale: number; onSelect: () => void; onUpdate: (patch: Partial<SlideElement>) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const startRef = useRef({ x: 0, y: 0, elX: 0, elY: 0, w: 0, h: 0 })
  const canvasScale = 0.5 * scale

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); onSelect(); if (element.locked) return; setIsDragging(true)
    startRef.current = { x: e.clientX, y: e.clientY, elX: element.position.x, elY: element.position.y, w: element.size.width, h: element.size.height }
    const handleMove = (ev: MouseEvent) => { const dx = (ev.clientX - startRef.current.x) / canvasScale; const dy = (ev.clientY - startRef.current.y) / canvasScale; onUpdate({ position: { ...element.position, x: Math.round(startRef.current.elX + dx), y: Math.round(startRef.current.elY + dy) } }) }
    const handleUp = () => { setIsDragging(false); window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp) }
    window.addEventListener('mousemove', handleMove); window.addEventListener('mouseup', handleUp)
  }, [element, onSelect, onUpdate, canvasScale])

  const handleResizeDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    startRef.current = { x: e.clientX, y: e.clientY, elX: element.position.x, elY: element.position.y, w: element.size.width, h: element.size.height }
    const handleMove = (ev: MouseEvent) => { const dx = (ev.clientX - startRef.current.x) / canvasScale; const dy = (ev.clientY - startRef.current.y) / canvasScale; onUpdate({ size: { width: Math.max(40, Math.round(startRef.current.w + dx)), height: Math.max(20, Math.round(startRef.current.h + dy)) } }) }
    const handleUp = () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp) }
    window.addEventListener('mousemove', handleMove); window.addEventListener('mouseup', handleUp)
  }, [element, onUpdate, canvasScale])

  return (
    <div style={{ position: 'absolute', left: element.position.x * canvasScale, top: element.position.y * canvasScale, width: element.size.width * canvasScale, height: element.size.height * canvasScale, opacity: element.opacity, zIndex: element.position.z, cursor: element.locked ? 'default' : 'move', transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined }} onMouseDown={handleMouseDown} className={`group ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}>
      {element.type === 'text' && <div className="w-full h-full overflow-hidden" style={{ fontFamily: element.style.fontFamily ? `'${element.style.fontFamily}', sans-serif` : undefined, fontSize: (element.style.fontSize || 16) * canvasScale, fontWeight: element.style.fontWeight, color: element.style.color, textAlign: element.style.textAlign || 'left', lineHeight: element.style.lineHeight || 1.4, display: 'flex', alignItems: element.style.verticalAlign === 'center' ? 'center' : element.style.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start' }}><span className="w-full">{element.content}</span></div>}
      {element.type === 'shape' && <div className="w-full h-full" style={{ backgroundColor: element.style.backgroundColor || '#cccccc', borderRadius: element.style.border?.radius ? element.style.border.radius * canvasScale : 0 }} />}
      {element.type === 'image' && <img src={element.content} alt="" className="w-full h-full object-cover" draggable={false} />}
      {isSelected && !element.locked && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-sm cursor-se-resize border border-white" onMouseDown={handleResizeDown} />}
    </div>
  )
}
