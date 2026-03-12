'use client'
import { ZoomIn, ZoomOut, Maximize2, Monitor } from 'lucide-react'
import { useEditorStore } from '../lib/store'
import { DIMENSION_PRESETS } from '../lib/constants'

export default function BottomToolbar() {
  const { zoom, setZoom, viewMode, setViewMode, presentation, updateDimensions } = useEditorStore()
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-hearst-200 px-4 py-1.5">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button onClick={() => setZoom(zoom - 10)} className="p-1 rounded hover:bg-hearst-100 text-hearst-500 transition-colors"><ZoomOut className="w-3.5 h-3.5" /></button>
          <span className="text-[10px] font-mono text-hearst-500 w-10 text-center">{zoom}%</span>
          <button onClick={() => setZoom(zoom + 10)} className="p-1 rounded hover:bg-hearst-100 text-hearst-500 transition-colors"><ZoomIn className="w-3.5 h-3.5" /></button>
          <button onClick={() => setZoom(100)} className="p-1 rounded hover:bg-hearst-100 text-hearst-500 transition-colors" title="Fit"><Maximize2 className="w-3.5 h-3.5" /></button>
          <input type="range" min={25} max={200} value={zoom} onChange={e => setZoom(+e.target.value)} className="w-20 h-1 accent-green-500" />
        </div>
        <div className="flex items-center gap-1.5">
          {DIMENSION_PRESETS.slice(0, 3).map(preset => (
            <button key={preset.aspectRatio} onClick={() => updateDimensions({ width: preset.width, height: preset.height, aspectRatio: preset.aspectRatio })} className={`text-[9px] font-mono px-2 py-1 rounded transition-colors ${presentation.dimensions.aspectRatio === preset.aspectRatio ? 'bg-accent/20 text-black font-bold' : 'text-hearst-400 hover:text-hearst-600 hover:bg-hearst-50'}`}>{preset.aspectRatio}</button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {([{ id: 'edit' as const, label: 'Edit', icon: Monitor }, { id: 'present' as const, label: 'Present', icon: Maximize2 }]).map(m => (
            <button key={m.id} onClick={() => setViewMode(m.id)} className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded transition-colors ${viewMode === m.id ? 'bg-accent/20 text-black font-bold' : 'text-hearst-400 hover:text-hearst-600 hover:bg-hearst-50'}`}><m.icon className="w-3 h-3" />{m.label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
