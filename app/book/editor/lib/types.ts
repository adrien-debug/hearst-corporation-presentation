// ─── Slide Types ─────────────────────────────────────────────────────────────

export type SlideType =
  | 'cover' | 'hero' | 'image' | 'content'
  | 'custom-image' | 'custom-text'
  | 'two-column-text' | 'three-column' | 'full-image-overlay'
  | 'quote' | 'timeline' | 'comparison'
  | 'team' | 'pricing' | 'contact' | 'blank'

// ─── Element Types ───────────────────────────────────────────────────────────

export type ElementType = 'text' | 'image' | 'shape' | 'icon'

export interface ElementPosition {
  x: number
  y: number
  z: number
}

export interface ElementSize {
  width: number
  height: number
}

export interface BoxSpacing {
  top: number
  right: number
  bottom: number
  left: number
}

export interface BorderConfig {
  width: number
  style: 'solid' | 'dashed' | 'dotted' | 'none'
  radius: number
  color: string
}

export interface ElementStyle {
  fontFamily?: string
  fontSize?: number
  fontWeight?: number
  fontStyle?: 'normal' | 'italic'
  lineHeight?: number
  letterSpacing?: number
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  verticalAlign?: 'top' | 'center' | 'bottom'
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  textDecoration?: 'none' | 'underline' | 'line-through'

  color?: string
  backgroundColor?: string
  backgroundOpacity?: number
  borderColor?: string

  textShadow?: string
  boxShadow?: string
  filter?: string
  backdropFilter?: string
  mixBlendMode?: string
  opacity?: number

  textStrokeWidth?: number
  textStrokeColor?: string

  gradientText?: GradientConfig | null

  padding?: BoxSpacing
  margin?: BoxSpacing
  border?: BorderConfig
}

export interface AnimationConfig {
  type: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom' | 'bounce'
  duration: number
  delay: number
  easing: string
}

export interface SlideElement {
  id: string
  type: ElementType
  position: ElementPosition
  size: ElementSize
  rotation: number
  opacity: number
  content: string
  style: ElementStyle
  animation?: AnimationConfig
  locked?: boolean
  name?: string
}

// ─── Background ──────────────────────────────────────────────────────────────

export interface GradientStop {
  color: string
  position: number
}

export interface GradientConfig {
  type: 'linear' | 'radial' | 'conic'
  angle?: number
  stops: GradientStop[]
}

export interface ImageBackgroundConfig {
  src: string
  blur?: number
  brightness?: number
  contrast?: number
  saturation?: number
  grayscale?: number
  objectFit?: 'cover' | 'contain' | 'fill'
}

export type PatternType = 'dots' | 'lines' | 'grid' | 'noise'

export interface PatternConfig {
  type: PatternType
  color: string
  size: number
  opacity: number
}

export interface SlideBackground {
  type: 'solid' | 'gradient' | 'image' | 'pattern'
  color?: string
  gradient?: GradientConfig
  image?: ImageBackgroundConfig
  pattern?: PatternConfig
  opacity: number
  blendMode?: string
}

// ─── Transition ──────────────────────────────────────────────────────────────

export interface SlideTransition {
  type: 'none' | 'fade' | 'slide' | 'zoom' | 'flip'
  duration: number
  easing: string
}

// ─── Slide ───────────────────────────────────────────────────────────────────

export interface Slide {
  id: string
  order: number
  type: SlideType
  name: string
  elements: SlideElement[]
  background: SlideBackground
  transition: SlideTransition
  notes?: string
  duration?: number
  locked: boolean
  title?: string
  kicker?: string
  backgroundImage?: string
  subtitle?: string
  bodyText?: string
}

// ─── Theme ───────────────────────────────────────────────────────────────────

export interface ColorPalette {
  accent: string
  accentDark: string
  bg: string
  textPrimary: string
  textSecondary: string
  success?: string
  warning?: string
  error?: string
  info?: string
}

export interface TypographyConfig {
  displayFont: string
  bodyFont: string
  monoFont: string
  h1Size: number
  h2Size: number
  h3Size: number
  bodySize: number
  h1Weight: number
  h2Weight: number
  h3Weight: number
  bodyWeight: number
  lineHeight: number
  letterSpacing: number
}

export interface SpacingConfig {
  unit: number
  sectionGap: number
  elementGap: number
}

export interface EffectsConfig {
  borderRadius: number
  shadowIntensity: number
}

export interface Theme {
  colors: ColorPalette
  typography: TypographyConfig
  spacing: SpacingConfig
  effects: EffectsConfig
}

// ─── Presentation ────────────────────────────────────────────────────────────

export interface PresentationDimensions {
  width: number
  height: number
  aspectRatio: string
}

export interface Presentation {
  id: string
  name: string
  description?: string
  thumbnail?: string
  tags: string[]
  dimensions: PresentationDimensions
  slides: Slide[]
  globalTheme: Theme
  createdAt: string
  updatedAt: string
  isTemplate: boolean
}

// ─── Asset ───────────────────────────────────────────────────────────────────

export interface Asset {
  id: string
  name: string
  type: 'image' | 'video' | 'font'
  mimeType: string
  size: number
  url: string
  blob?: Blob
  width?: number
  height?: number
  createdAt: string
  tags: string[]
}

// ─── Template ────────────────────────────────────────────────────────────────

export interface SlideTemplate {
  id: string
  name: string
  description: string
  category: 'corporate' | 'startup' | 'academic' | 'creative' | 'minimal'
  thumbnail?: string
  slides: Slide[]
  theme: Theme
}

// ─── Editor State ────────────────────────────────────────────────────────────

export type ViewMode = 'edit' | 'present' | 'print'
export type EditorTab = 'slides' | 'typography' | 'colors' | 'backgrounds' | 'templates' | 'assets' | 'export'

export interface DimensionPreset {
  name: string
  width: number
  height: number
  aspectRatio: string
}
