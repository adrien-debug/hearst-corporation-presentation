import type { Presentation } from './types'

export async function exportPDF(presentation: Presentation, options?: { includeNotes?: boolean; dpi?: number }): Promise<void> {
  const { default: jsPDF } = await import('jspdf')
  const { default: html2canvas } = await import('html2canvas')
  const { width, height } = presentation.dimensions
  const dpi = options?.dpi || 150
  const scaleFactor = dpi / 96
  const pdf = new jsPDF({ orientation: width > height ? 'landscape' : 'portrait', unit: 'px', format: [width, height], compress: true })

  const container = document.createElement('div')
  container.style.cssText = `position:fixed;left:-99999px;top:0;width:${width}px;height:${height}px;`
  document.body.appendChild(container)

  for (let i = 0; i < presentation.slides.length; i++) {
    if (i > 0) pdf.addPage([width, height], width > height ? 'landscape' : 'portrait')
    const slide = presentation.slides[i]
    container.innerHTML = ''
    const el = document.querySelector(`[data-slide-id="${slide.id}"]`) as HTMLElement | null
    const clone = el ? el.cloneNode(true) as HTMLElement : document.createElement('div')
    if (!el) { clone.style.cssText = `width:${width}px;height:${height}px;background:${slide.background.color || '#fff'};display:flex;align-items:center;justify-content:center;`; clone.innerHTML = `<p style="color:#999;font-size:24px">${slide.name}</p>` }
    else { clone.style.width = `${width}px`; clone.style.height = `${height}px` }
    container.appendChild(clone)

    try {
      const canvas = await html2canvas(clone, { scale: scaleFactor, width, height, useCORS: true, allowTaint: true, logging: false })
      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      pdf.addImage(imgData, 'JPEG', 0, 0, width, height, undefined, 'FAST')
    } catch (e) { console.error(`[export-pdf] Slide ${i + 1} failed:`, e) }

    if (options?.includeNotes && slide.notes) {
      pdf.addPage([width, height], width > height ? 'landscape' : 'portrait')
      pdf.setFontSize(12); pdf.setTextColor(100)
      pdf.text(`Notes — Slide ${i + 1}: ${slide.name}`, 40, 40)
      pdf.setFontSize(10); pdf.setTextColor(60)
      const lines = pdf.splitTextToSize(slide.notes, width - 80)
      pdf.text(lines, 40, 60)
    }
  }

  document.body.removeChild(container)
  pdf.save(`${presentation.name.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}
