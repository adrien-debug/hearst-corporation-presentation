'use client'
import { useState } from 'react'
import { FileDown, FileText, FileCode, Copy, Check } from 'lucide-react'
import { useEditorStore } from '../../lib/store'

export default function ExportPanel() {
  const { presentation, flash } = useEditorStore()
  const [includeNotes, setIncludeNotes] = useState(false)
  const [dpi, setDpi] = useState(150)
  const [copied, setCopied] = useState(false)

  const handlePDF = async () => {
    flash('Export PDF en cours...'); const { exportPDF } = await import('../../lib/export-pdf'); await exportPDF(presentation, { includeNotes, dpi }); flash('PDF exporté')
  }
  const handlePPTX = async () => { flash('Export PPTX en cours...'); const { exportPPTX } = await import('../../lib/export-pptx'); await exportPPTX(presentation); flash('PPTX exporté') }
  const handleHTML = async () => { const { exportHTML } = await import('../../lib/export-html'); exportHTML(presentation); flash('HTML exporté') }
  const handleJSON = async () => { const { exportJSON } = await import('../../lib/export-html'); exportJSON(presentation); flash('JSON exporté') }
  const handleCSS = async () => { const { exportCSS } = await import('../../lib/export-html'); const css = exportCSS(presentation); await navigator.clipboard.writeText(css); setCopied(true); setTimeout(() => setCopied(false), 2000); flash('CSS copié') }

  return (
    <div className="p-3 space-y-4">
      <div className="space-y-1.5">
        <button onClick={handlePDF} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-hearst-200 text-xs font-medium hover:bg-accent/5 transition-colors"><FileDown className="w-4 h-4 text-red-500" /> Export PDF</button>
        <button onClick={handlePPTX} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-hearst-200 text-xs font-medium hover:bg-accent/5 transition-colors"><FileText className="w-4 h-4 text-orange-500" /> Export PowerPoint</button>
        <button onClick={handleHTML} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-hearst-200 text-xs font-medium hover:bg-accent/5 transition-colors"><FileCode className="w-4 h-4 text-blue-500" /> Export HTML</button>
        <button onClick={handleJSON} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-hearst-200 text-xs font-medium hover:bg-accent/5 transition-colors"><FileCode className="w-4 h-4 text-green-500" /> Export JSON</button>
        <button onClick={handleCSS} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-hearst-200 text-xs font-medium hover:bg-accent/5 transition-colors">{copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-purple-500" />} {copied ? 'Copié !' : 'Copier CSS thème'}</button>
      </div>
      <div className="border-t border-hearst-100 pt-3 space-y-2">
        <p className="text-[10px] font-semibold text-hearst-500 uppercase tracking-wider">Options PDF</p>
        <label className="flex items-center gap-2 text-xs text-hearst-600 cursor-pointer"><input type="checkbox" checked={includeNotes} onChange={e => setIncludeNotes(e.target.checked)} className="rounded border-hearst-300 text-accent focus:ring-accent/40" /> Inclure les notes</label>
        <div><label className="text-[10px] text-hearst-500">DPI : {dpi}</label><input type="range" min={72} max={300} value={dpi} onChange={e => setDpi(+e.target.value)} className="w-full h-1 accent-green-500" /></div>
      </div>
    </div>
  )
}
