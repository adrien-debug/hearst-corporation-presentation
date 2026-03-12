import type { Presentation } from './types'

export async function exportPPTX(presentation: Presentation): Promise<void> {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()
  const { width, height } = presentation.dimensions
  pptx.defineLayout({ name: 'CUSTOM', width: width / 96, height: height / 96 })
  pptx.layout = 'CUSTOM'
  pptx.author = 'Hearst Corporation'
  pptx.title = presentation.name

  const theme = presentation.globalTheme

  for (const slide of presentation.slides) {
    const s = pptx.addSlide()
    const bg = slide.background
    if (bg.type === 'solid') s.background = { color: (bg.color || '#ffffff').replace('#', '') }
    else if (bg.type === 'image' && (bg.image || slide.backgroundImage)) {
      const src = bg.image?.src || `/images/book/${slide.backgroundImage}`
      try { s.background = { path: window.location.origin + src } } catch { s.background = { color: '000000' } }
    } else if (bg.type === 'gradient' && bg.gradient) {
      s.background = { color: (bg.gradient.stops[0]?.color || '#ffffff').replace('#', '') }
    }

    if (slide.elements.length > 0) {
      for (const el of slide.elements) {
        const x = el.position.x / 96; const y = el.position.y / 96
        const w = el.size.width / 96; const h = el.size.height / 96
        if (el.type === 'text') {
          s.addText(el.content, { x, y, w, h, fontSize: el.style.fontSize || 16, fontFace: el.style.fontFamily || theme.typography.bodyFont, color: (el.style.color || theme.colors.textPrimary).replace('#', ''), bold: (el.style.fontWeight || 400) >= 700, italic: el.style.fontStyle === 'italic', align: el.style.textAlign || 'left', valign: el.style.verticalAlign === 'center' ? 'middle' : el.style.verticalAlign === 'bottom' ? 'bottom' : 'top' })
        } else if (el.type === 'shape') {
          s.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: (el.style.backgroundColor || theme.colors.accent).replace('#', '') }, rectRadius: el.style.border?.radius ? el.style.border.radius / 96 : 0 })
        }
      }
    } else {
      if (slide.type === 'cover') { s.addText('HEARST CORPORATION', { x: 0, y: '40%', w: '100%', align: 'center', fontSize: 14, fontFace: theme.typography.monoFont, color: theme.colors.textSecondary.replace('#', ''), charSpacing: 6 }) }
      else if (slide.type === 'hero') { s.addText(slide.name, { x: '15%', y: '30%', w: '70%', align: 'center', fontSize: theme.typography.h1Size, fontFace: theme.typography.displayFont, color: theme.colors.accent.replace('#', ''), bold: true }) }
      else if (slide.type === 'content') {
        if (slide.kicker) s.addText(slide.kicker, { x: 0.6, y: 1.2, w: 8, fontSize: 10, fontFace: theme.typography.monoFont, color: theme.colors.accentDark.replace('#', ''), charSpacing: 3 })
        s.addText(slide.name, { x: 0.6, y: 2, w: 8, fontSize: theme.typography.h2Size, fontFace: theme.typography.displayFont, color: theme.colors.accentDark.replace('#', ''), bold: true })
      }
    }

    if (slide.notes) s.addNotes(slide.notes)
  }

  await pptx.writeFile({ fileName: `${presentation.name.replace(/\s+/g, '-').toLowerCase()}.pptx` })
}
