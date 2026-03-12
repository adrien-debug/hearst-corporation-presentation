# Hearst Corporation — Pitch Deck

Présentation institutionnelle interactive pour **Hearst Corporation**, une solution Mining-as-a-Service (MaaS) axée sur la durabilité et l'infrastructure AI.

## Stack Technique

| Tech | Version | Rôle |
|------|---------|------|
| Next.js | 14.2 | Framework React |
| React | 18.3 | UI |
| TypeScript | 5.3 | Typage |
| Tailwind CSS | 3.4 | Styles |
| Framer Motion | 11.0 | Animations |
| Zustand + Zundo | latest | State management + undo/redo |
| idb | latest | IndexedDB persistence |
| Fabric.js | 6.x | Canvas editing engine |
| Lucide React | latest | Icons |
| jsPDF + html2canvas | latest | PDF export |
| pptxgenjs | latest | PowerPoint export |

## Structure

```
├── app/
│   ├── layout.tsx
│   ├── page.tsx                         # Redirect → /book
│   ├── globals.css
│   └── book/
│       ├── layout.tsx
│       ├── page.tsx                     # 29 slides viewer
│       └── editor/
│           ├── page.tsx                 # Editor layout (3-panel)
│           ├── components/
│           │   ├── TopToolbar.tsx        # Save, Undo/Redo, Export, Present
│           │   ├── BottomToolbar.tsx     # Zoom, dimensions, view mode
│           │   ├── LeftPanel.tsx         # Slide thumbnails, drag-drop
│           │   ├── RightPanel.tsx        # Context-sensitive properties
│           │   ├── Canvas.tsx           # Slide canvas with elements
│           │   └── panels/
│           │       ├── TypographyPanel.tsx   # Atomic text controls
│           │       ├── ColorPanel.tsx        # Color system + presets
│           │       ├── BackgroundPanel.tsx   # Solid/gradient/image/pattern
│           │       ├── TemplatesPanel.tsx    # 5 starter templates
│           │       ├── AssetPanel.tsx        # Upload + gallery
│           │       └── ExportPanel.tsx       # PDF/PPTX/HTML/JSON/CSS
│           └── lib/
│               ├── types.ts             # All TypeScript types
│               ├── constants.ts         # Fonts, presets, defaults
│               ├── store.ts             # Zustand store + undo/redo (30 states)
│               ├── db.ts               # IndexedDB via idb
│               ├── templates.ts         # 5 presentation templates
│               ├── export-pdf.ts        # jsPDF + html2canvas
│               ├── export-pptx.ts       # pptxgenjs
│               └── export-html.ts       # HTML bundle + JSON + CSS
├── components/
│   └── book/
│       └── TwoColumnSlide.tsx
├── public/
│   └── images/
│       ├── hearst-logo-*.svg
│       └── book/
└── tailwind.config.ts
```

## Éditeur (`/book/editor`)

### Fonctionnalités

- **15 types de slides** : cover, hero, image, content, custom-image, custom-text, two-column-text, three-column, full-image-overlay, quote, timeline, comparison, team, pricing, contact, blank
- **Éditeur atomique** : contrôle par élément (police, taille, poids, couleur, ombre, espacement, alignement, padding, opacité, contour, mode de fusion)
- **Arrière-plans avancés** : couleur unie, dégradé (linéaire/radial/conique avec stops), image avec filtres, motifs (dots/lines/grid/noise)
- **5 templates** : Corporate, Startup, Academic, Creative, Minimal
- **Export** : PDF (72/150/300 DPI, avec/sans notes), PowerPoint (.pptx), HTML bundle, JSON, CSS
- **Asset manager** : drag-drop upload, galerie grid/list, recherche
- **Undo/Redo** : 30 états via Zundo
- **Persistence** : IndexedDB (offline-first), migration auto depuis localStorage
- **Raccourcis clavier** : Ctrl+S, Ctrl+Z/Y, Ctrl+D, Delete, flèches, Space, +/-, ?, Escape
- **Mode présentation** : plein écran avec navigation clavier

### Architecture

- **State** : Zustand store unique (`useEditorStore`) avec middleware temporal
- **Persistence** : IndexedDB via `idb` avec auto-save debounced (2s)
- **UI** : 3 panneaux (Left: slides, Center: canvas, Right: propriétés contextuelles)

## Couleurs

| Nom | Hex | Usage |
|-----|-----|-------|
| Accent | `#A7FB90` | CTA, highlights |
| Accent Dark | `#73DE56` | Titres accentués |
| Hearst 500 | `#7F7F7F` | Texte body |
| Hearst 100 | `#F2F2F2` | Borders light |

## Fonts

- **Display** : Space Grotesk (titres)
- **Sans** : Inter (body)
- **Mono** : JetBrains Mono (labels, code)

## Scripts

```bash
npm run dev      # Dev server → http://localhost:3000
npm run build    # Build production
npm run start    # Serve build
npm run lint     # ESLint
```

## Navigation (Viewer)

- **Scroll horizontal** : molette / trackpad
- **Clavier** : ← / → ou ↑ / ↓
- **Touch** : swipe gauche/droite
- **Dots** : clic sur indicateur bas

## Déploiement

```bash
npm run build && npm run start
```

Compatible Vercel, Netlify, ou tout hébergeur Node.js.
