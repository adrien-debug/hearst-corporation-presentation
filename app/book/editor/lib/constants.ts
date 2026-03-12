import type {
  ColorPalette, TypographyConfig, SpacingConfig, EffectsConfig,
  Theme, Slide, SlideBackground, SlideTransition, DimensionPreset,
  PresentationDimensions, Presentation,
} from './types'

export interface FontDef { name: string; value: string; weights: string }

export const DISPLAY_FONTS: FontDef[] = [
  { name: 'Space Grotesk', value: 'Space+Grotesk', weights: '400;500;600;700' },
  { name: 'Plus Jakarta Sans', value: 'Plus+Jakarta+Sans', weights: '400;500;600;700;800' },
  { name: 'Outfit', value: 'Outfit', weights: '400;500;600;700;800' },
  { name: 'Sora', value: 'Sora', weights: '400;500;600;700;800' },
  { name: 'DM Sans', value: 'DM+Sans', weights: '400;500;600;700' },
  { name: 'Manrope', value: 'Manrope', weights: '400;500;600;700;800' },
  { name: 'Poppins', value: 'Poppins', weights: '400;500;600;700;800;900' },
  { name: 'Montserrat', value: 'Montserrat', weights: '400;500;600;700;800;900' },
  { name: 'Raleway', value: 'Raleway', weights: '400;500;600;700;800;900' },
  { name: 'Oswald', value: 'Oswald', weights: '400;500;600;700' },
  { name: 'Playfair Display', value: 'Playfair+Display', weights: '400;500;600;700;800;900' },
  { name: 'Lora', value: 'Lora', weights: '400;500;600;700' },
  { name: 'Work Sans', value: 'Work+Sans', weights: '400;500;600;700;800;900' },
  { name: 'Rubik', value: 'Rubik', weights: '400;500;600;700;800;900' },
  { name: 'Nunito Sans', value: 'Nunito+Sans', weights: '400;500;600;700;800;900' },
  { name: 'Figtree', value: 'Figtree', weights: '400;500;600;700;800;900' },
  { name: 'Archivo', value: 'Archivo', weights: '400;500;600;700;800;900' },
  { name: 'Bebas Neue', value: 'Bebas+Neue', weights: '400' },
  { name: 'Lexend', value: 'Lexend', weights: '400;500;600;700;800' },
  { name: 'Bricolage Grotesque', value: 'Bricolage+Grotesque', weights: '400;500;600;700;800' },
]

export const BODY_FONTS: FontDef[] = [
  { name: 'Inter', value: 'Inter', weights: '400;500;600;700' },
  { name: 'DM Sans', value: 'DM+Sans', weights: '400;500;600;700' },
  { name: 'Source Sans 3', value: 'Source+Sans+3', weights: '400;500;600;700' },
  { name: 'Noto Sans', value: 'Noto+Sans', weights: '400;500;600;700' },
  { name: 'IBM Plex Sans', value: 'IBM+Plex+Sans', weights: '400;500;600;700' },
  { name: 'Lato', value: 'Lato', weights: '400;700;900' },
  { name: 'Open Sans', value: 'Open+Sans', weights: '400;500;600;700;800' },
  { name: 'Libre Franklin', value: 'Libre+Franklin', weights: '400;500;600;700;800' },
  { name: 'Plus Jakarta Sans', value: 'Plus+Jakarta+Sans', weights: '400;500;600;700;800' },
  { name: 'Work Sans', value: 'Work+Sans', weights: '400;500;600;700' },
  { name: 'Nunito', value: 'Nunito', weights: '400;500;600;700;800' },
  { name: 'Karla', value: 'Karla', weights: '400;500;600;700;800' },
  { name: 'Cabin', value: 'Cabin', weights: '400;500;600;700' },
  { name: 'Barlow', value: 'Barlow', weights: '400;500;600;700;800;900' },
  { name: 'Mulish', value: 'Mulish', weights: '400;500;600;700;800;900' },
]

export const MONO_FONTS: FontDef[] = [
  { name: 'JetBrains Mono', value: 'JetBrains+Mono', weights: '400;500;600;700' },
  { name: 'Fira Code', value: 'Fira+Code', weights: '400;500;600;700' },
  { name: 'Source Code Pro', value: 'Source+Code+Pro', weights: '400;500;600;700' },
  { name: 'IBM Plex Mono', value: 'IBM+Plex+Mono', weights: '400;500;600;700' },
  { name: 'Space Mono', value: 'Space+Mono', weights: '400;700' },
  { name: 'Roboto Mono', value: 'Roboto+Mono', weights: '400;500;600;700' },
  { name: 'Ubuntu Mono', value: 'Ubuntu+Mono', weights: '400;700' },
  { name: 'Inconsolata', value: 'Inconsolata', weights: '400;500;600;700' },
]

export const AVAILABLE_IMAGES = [
  'ai-infrastructure-hero.png', 'b2b-training-hero.png', 'break-black-1.png',
  'break-black-2.png', 'connect-flow-4k.png', 'connect-flow-final.png',
  'connect-flow-gemini.png', 'global-map-final.png', 'key-metrics-gemini.png',
  'key-metrics-hero-4k.png', 'mining-solutions-gemini.png', 'physical-ai-hero.png',
  'strategic-tech-hero.png', 'sustainability-hero.png',
]

export interface ColorPreset { name: string; accent: string; accentDark: string; bg: string; textPrimary: string; textSecondary: string }

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Hearst Green', accent: '#A7FB90', accentDark: '#73DE56', bg: '#FCFDFC', textPrimary: '#000000', textSecondary: '#7F7F7F' },
  { name: 'Electric Blue', accent: '#60A5FA', accentDark: '#3B82F6', bg: '#F8FAFC', textPrimary: '#0F172A', textSecondary: '#64748B' },
  { name: 'Warm Gold', accent: '#FCD34D', accentDark: '#F59E0B', bg: '#FFFBEB', textPrimary: '#1C1917', textSecondary: '#78716C' },
  { name: 'Coral', accent: '#FB923C', accentDark: '#EA580C', bg: '#FFF7ED', textPrimary: '#1C1917', textSecondary: '#78716C' },
  { name: 'Rose', accent: '#FB7185', accentDark: '#E11D48', bg: '#FFF1F2', textPrimary: '#1C1917', textSecondary: '#71717A' },
  { name: 'Purple', accent: '#A78BFA', accentDark: '#7C3AED', bg: '#FAF5FF', textPrimary: '#1E1B4B', textSecondary: '#6B7280' },
  { name: 'Teal', accent: '#2DD4BF', accentDark: '#0D9488', bg: '#F0FDFA', textPrimary: '#134E4A', textSecondary: '#6B7280' },
  { name: 'Dark Mode', accent: '#A7FB90', accentDark: '#73DE56', bg: '#0A0A0A', textPrimary: '#FFFFFF', textSecondary: '#A1A1AA' },
  { name: 'Midnight Blue', accent: '#818CF8', accentDark: '#6366F1', bg: '#020617', textPrimary: '#F8FAFC', textSecondary: '#94A3B8' },
  { name: 'Forest', accent: '#4ADE80', accentDark: '#16A34A', bg: '#F0FDF4', textPrimary: '#14532D', textSecondary: '#6B7280' },
]

export interface FontPairing { name: string; display: string; body: string; mono: string }

export const FONT_PAIRINGS: FontPairing[] = [
  { name: 'Contrast (actuel)', display: 'Space Grotesk', body: 'Inter', mono: 'JetBrains Mono' },
  { name: 'Modern Minimal', display: 'Outfit', body: 'DM Sans', mono: 'Fira Code' },
  { name: 'Tech Forward', display: 'Sora', body: 'IBM Plex Sans', mono: 'IBM Plex Mono' },
  { name: 'Editorial', display: 'Playfair Display', body: 'Source Sans 3', mono: 'Source Code Pro' },
  { name: 'Startup', display: 'Plus Jakarta Sans', body: 'Inter', mono: 'JetBrains Mono' },
  { name: 'Bold Impact', display: 'Montserrat', body: 'Open Sans', mono: 'Roboto Mono' },
  { name: 'Clean Pro', display: 'Manrope', body: 'Nunito', mono: 'Inconsolata' },
  { name: 'Geometric', display: 'Archivo', body: 'Barlow', mono: 'Space Mono' },
  { name: 'Elegant', display: 'Lora', body: 'Libre Franklin', mono: 'Source Code Pro' },
  { name: 'Playful', display: 'Figtree', body: 'Mulish', mono: 'Fira Code' },
  { name: 'Neo Grotesk', display: 'Lexend', body: 'Karla', mono: 'Ubuntu Mono' },
  { name: 'French Modern', display: 'Bricolage Grotesque', body: 'Cabin', mono: 'JetBrains Mono' },
]

export const GRADIENT_PRESETS = [
  { name: 'Sunset', stops: [{ color: '#FF6B6B', position: 0 }, { color: '#FFA07A', position: 100 }] },
  { name: 'Ocean', stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }] },
  { name: 'Mint', stops: [{ color: '#a8edea', position: 0 }, { color: '#fed6e3', position: 100 }] },
  { name: 'Night', stops: [{ color: '#0f0c29', position: 0 }, { color: '#302b63', position: 50 }, { color: '#24243e', position: 100 }] },
  { name: 'Fire', stops: [{ color: '#f12711', position: 0 }, { color: '#f5af19', position: 100 }] },
  { name: 'Cool', stops: [{ color: '#2193b0', position: 0 }, { color: '#6dd5ed', position: 100 }] },
  { name: 'Peach', stops: [{ color: '#ffecd2', position: 0 }, { color: '#fcb69f', position: 100 }] },
  { name: 'Forest', stops: [{ color: '#134E5E', position: 0 }, { color: '#71B280', position: 100 }] },
  { name: 'Royal', stops: [{ color: '#141E30', position: 0 }, { color: '#243B55', position: 100 }] },
  { name: 'Candy', stops: [{ color: '#fc5c7d', position: 0 }, { color: '#6a82fb', position: 100 }] },
]

export const DIMENSION_PRESETS: DimensionPreset[] = [
  { name: '16:9 Standard', width: 1920, height: 1080, aspectRatio: '16:9' },
  { name: '16:10 Widescreen', width: 1920, height: 1200, aspectRatio: '16:10' },
  { name: '4:3 Classic', width: 1024, height: 768, aspectRatio: '4:3' },
  { name: '21:9 Ultrawide', width: 2560, height: 1080, aspectRatio: '21:9' },
  { name: 'A4 Portrait', width: 794, height: 1123, aspectRatio: 'A4' },
]

export const DEFAULT_COLORS: ColorPalette = { accent: '#A7FB90', accentDark: '#73DE56', bg: '#FCFDFC', textPrimary: '#000000', textSecondary: '#7F7F7F' }
export const DEFAULT_TYPOGRAPHY: TypographyConfig = { displayFont: 'Space Grotesk', bodyFont: 'Inter', monoFont: 'JetBrains Mono', h1Size: 32, h2Size: 18, h3Size: 16, bodySize: 14, h1Weight: 700, h2Weight: 600, h3Weight: 600, bodyWeight: 400, lineHeight: 1.6, letterSpacing: -0.01 }
export const DEFAULT_SPACING: SpacingConfig = { unit: 8, sectionGap: 48, elementGap: 16 }
export const DEFAULT_EFFECTS: EffectsConfig = { borderRadius: 8, shadowIntensity: 0.1 }
export const DEFAULT_THEME: Theme = { colors: DEFAULT_COLORS, typography: DEFAULT_TYPOGRAPHY, spacing: DEFAULT_SPACING, effects: DEFAULT_EFFECTS }
export const DEFAULT_DIMENSIONS: PresentationDimensions = { width: 1920, height: 1080, aspectRatio: '16:9' }
export const DEFAULT_BACKGROUND: SlideBackground = { type: 'solid', color: '#ffffff', opacity: 1 }
export const DEFAULT_TRANSITION: SlideTransition = { type: 'none', duration: 300, easing: 'ease-in-out' }

export const DEFAULT_SLIDES: Slide[] = [
  { id: 's1', order: 0, type: 'cover', name: 'Cover', title: 'Cover', elements: [], background: { type: 'solid', color: '#ffffff', opacity: 1 }, transition: DEFAULT_TRANSITION, locked: true },
  { id: 's2', order: 1, type: 'hero', name: 'We Make Crypto Mining More Sustainable', title: 'We Make Crypto Mining More Sustainable', elements: [], background: { type: 'solid', color: '#000000', opacity: 1 }, transition: DEFAULT_TRANSITION, locked: true },
  { id: 's3', order: 2, type: 'image', name: 'Key Metrics', title: 'Key Metrics', backgroundImage: 'key-metrics-gemini.png', elements: [], background: { type: 'image', image: { src: '/images/book/key-metrics-gemini.png' }, opacity: 1 }, transition: DEFAULT_TRANSITION, locked: false },
  { id: 's4', order: 3, type: 'content', name: 'Identity & Mission', title: 'Identity & Mission', kicker: '01 — About Hearst Corporation', elements: [], background: { type: 'solid', color: '#ffffff', opacity: 1 }, transition: DEFAULT_TRANSITION, locked: true },
  { id: 's28', order: 27, type: 'hero', name: 'Pre-Closing', title: 'Pre-Closing', elements: [], background: { type: 'solid', color: '#000000', opacity: 1 }, transition: DEFAULT_TRANSITION, locked: true },
  { id: 's29', order: 28, type: 'cover', name: 'Closing', title: 'Closing', elements: [], background: { type: 'solid', color: '#ffffff', opacity: 1 }, transition: DEFAULT_TRANSITION, locked: true },
]

export function createDefaultPresentation(id: string, name: string): Presentation {
  return { id, name, tags: [], dimensions: { ...DEFAULT_DIMENSIONS }, slides: DEFAULT_SLIDES.map(s => ({ ...s })), globalTheme: JSON.parse(JSON.stringify(DEFAULT_THEME)), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isTemplate: false }
}

export const SLIDE_TYPE_LABELS: Record<string, string> = { 'cover': 'Couverture', 'hero': 'Hero', 'image': 'Image', 'content': 'Contenu', 'custom-image': 'Image+', 'custom-text': 'Texte+', 'two-column-text': '2 Colonnes', 'three-column': '3 Colonnes', 'full-image-overlay': 'Image Overlay', 'quote': 'Citation', 'timeline': 'Timeline', 'comparison': 'Comparaison', 'team': 'Équipe', 'pricing': 'Tarifs', 'contact': 'Contact', 'blank': 'Vierge' }
export const FONT_WEIGHT_LABELS: Record<number, string> = { 100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black' }

const loadedFonts = new Set<string>()
export function loadFonts(fonts: string[]) {
  if (typeof document === 'undefined') return
  fonts.forEach(f => {
    if (loadedFonts.has(f)) return
    loadedFonts.add(f)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${f.replace(/ /g, '+')}&display=swap`
    link.setAttribute('data-editor-font', f)
    document.head.appendChild(link)
  })
}
export function loadAllFonts() { loadFonts([...DISPLAY_FONTS, ...BODY_FONTS, ...MONO_FONTS].map(f => f.name)) }
