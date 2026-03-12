import type { Presentation } from './types'

export function exportHTML(presentation: Presentation): void {
  const theme = presentation.globalTheme
  const { width, height } = presentation.dimensions
  const slidesHTML = presentation.slides.map((slide, i) => {
    const bg = slide.background
    let bgCSS = ''
    if (bg.type === 'solid') bgCSS = `background-color:${bg.color || '#fff'};`
    else if (bg.type === 'gradient' && bg.gradient) { const stops = bg.gradient.stops.map(s => `${s.color} ${s.position}%`).join(','); bgCSS = `background:linear-gradient(${bg.gradient.angle || 135}deg,${stops});` }
    else if (bg.type === 'image' && (bg.image || slide.backgroundImage)) { const src = bg.image?.src || `images/${slide.backgroundImage}`; bgCSS = `background-image:url('${src}');background-size:cover;background-position:center;` }
    let content = ''
    if (slide.type === 'cover') content = `<div class="slide-center"><p style="font-size:14px;letter-spacing:0.3em;text-transform:uppercase;color:${theme.colors.textSecondary}">HEARST CORPORATION</p></div>`
    else if (slide.type === 'hero') content = `<div class="slide-center" style="background:#000"><h1 style="font-family:'${theme.typography.displayFont}',sans-serif;font-size:${theme.typography.h1Size}px;font-weight:${theme.typography.h1Weight};color:${theme.colors.accent};text-align:center;max-width:70%">${slide.name}</h1></div>`
    else if (slide.type === 'content') content = `<div style="display:flex;flex-direction:column;justify-content:center;padding:60px;height:100%">${slide.kicker ? `<p style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:${theme.colors.accentDark};margin-bottom:16px">${slide.kicker}</p>` : ''}<h2 style="font-family:'${theme.typography.displayFont}',sans-serif;font-size:${theme.typography.h2Size}px;font-weight:${theme.typography.h2Weight};color:${theme.colors.accentDark}">${slide.name}</h2>${slide.bodyText ? `<p style="margin-top:16px;line-height:${theme.typography.lineHeight}">${slide.bodyText}</p>` : ''}</div>`
    return `<section class="slide" id="slide-${i + 1}" style="${bgCSS}opacity:${bg.opacity ?? 1}">${content}</section>`
  }).join('\n')
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${presentation.name}</title><link href="https://fonts.googleapis.com/css2?family=${theme.typography.displayFont.replace(/ /g, '+')}&family=${theme.typography.bodyFont.replace(/ /g, '+')}&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'${theme.typography.bodyFont}',sans-serif;color:${theme.colors.textPrimary};background:#000;overflow:hidden}.slide{width:${width}px;height:${height}px;position:relative;display:none;overflow:hidden}.slide.active{display:block}.slide-center{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%}.controls{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:100}.controls button{background:rgba(255,255,255,0.1);color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:12px}.slide-counter{position:fixed;bottom:20px;right:20px;color:rgba(255,255,255,0.4);font-size:11px;z-index:100}</style></head><body>${slidesHTML}<div class="controls"><button onclick="prev()">← Précédent</button><button onclick="next()">Suivant →</button></div><div class="slide-counter" id="counter"></div><script>let current=0;const slides=document.querySelectorAll('.slide');const counter=document.getElementById('counter');function show(n){slides.forEach(s=>s.classList.remove('active'));if(slides[n])slides[n].classList.add('active');counter.textContent=(n+1)+'/'+slides.length}function next(){if(current<slides.length-1){current++;show(current)}}function prev(){if(current>0){current--;show(current)}}document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key===' ')next();if(e.key==='ArrowLeft')prev()});show(0);</script></body></html>`
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `${presentation.name.replace(/\s+/g, '-').toLowerCase()}.html`; a.click(); URL.revokeObjectURL(url)
}

export function exportJSON(presentation: Presentation): void {
  const blob = new Blob([JSON.stringify(presentation, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `${presentation.name.replace(/\s+/g, '-').toLowerCase()}.json`; a.click(); URL.revokeObjectURL(url)
}

export function exportCSS(presentation: Presentation): string {
  const { typography: typo, colors } = presentation.globalTheme
  return `:root { --font-display: '${typo.displayFont}', sans-serif; --font-body: '${typo.bodyFont}', sans-serif; --font-mono: '${typo.monoFont}', monospace; --color-accent: ${colors.accent}; --color-accent-dark: ${colors.accentDark}; --color-bg: ${colors.bg}; --color-text: ${colors.textPrimary}; --color-muted: ${colors.textSecondary}; }
h1 { font: ${typo.h1Weight} ${typo.h1Size}px var(--font-display); color: var(--color-accent-dark); }
h2 { font: ${typo.h2Weight} ${typo.h2Size}px var(--font-display); color: var(--color-muted); }
p  { font: ${typo.bodyWeight} ${typo.bodySize}px/${typo.lineHeight} var(--font-body); }`
}
