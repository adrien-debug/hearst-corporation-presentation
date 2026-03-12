import { create } from 'zustand'
import { temporal } from 'zundo'
import { nanoid } from 'nanoid'
import type { Presentation, Slide, SlideElement, SlideBackground, SlideTransition, Theme, EditorTab, ViewMode, ColorPalette, TypographyConfig, Asset, SlideType, ElementStyle, PresentationDimensions } from './types'
import { DEFAULT_THEME, DEFAULT_DIMENSIONS, DEFAULT_SLIDES, DEFAULT_BACKGROUND, DEFAULT_TRANSITION, createDefaultPresentation } from './constants'
import * as db from './db'

interface EditorStore {
  presentation: Presentation
  selectedSlideId: string | null
  selectedElementId: string | null
  activeTab: EditorTab
  viewMode: ViewMode
  zoom: number
  darkMode: boolean
  showShortcuts: boolean
  isPresentationListOpen: boolean
  toast: string
  presentations: Presentation[]
  assets: Asset[]
  isLoading: boolean
  autoSaveTimer: ReturnType<typeof setTimeout> | null
  init: () => Promise<void>
  loadPresentation: (id: string) => Promise<void>
  createPresentation: (name: string) => Promise<void>
  duplicatePresentation: (id: string) => Promise<void>
  deletePresentation: (id: string) => Promise<void>
  updatePresentationName: (name: string) => void
  updateDimensions: (dims: PresentationDimensions) => void
  selectSlide: (id: string | null) => void
  addSlide: (type: SlideType, afterId?: string) => void
  deleteSlide: (id: string) => void
  moveSlide: (id: string, direction: -1 | 1) => void
  reorderSlides: (fromIndex: number, toIndex: number) => void
  duplicateSlide: (id: string) => void
  updateSlideBackground: (slideId: string, bg: Partial<SlideBackground>) => void
  updateSlideTransition: (slideId: string, t: Partial<SlideTransition>) => void
  updateSlideNotes: (slideId: string, notes: string) => void
  updateSlideName: (slideId: string, name: string) => void
  updateSlideBackgroundImage: (slideId: string, img: string) => void
  selectElement: (id: string | null) => void
  addElement: (slideId: string, element: Omit<SlideElement, 'id'>) => void
  updateElement: (slideId: string, elementId: string, patch: Partial<SlideElement>) => void
  updateElementStyle: (slideId: string, elementId: string, style: Partial<ElementStyle>) => void
  deleteElement: (slideId: string, elementId: string) => void
  updateColors: (colors: Partial<ColorPalette>) => void
  updateTypography: (typo: Partial<TypographyConfig>) => void
  applyTheme: (theme: Theme) => void
  setActiveTab: (tab: EditorTab) => void
  setViewMode: (mode: ViewMode) => void
  setZoom: (zoom: number) => void
  toggleDarkMode: () => void
  toggleShortcuts: () => void
  togglePresentationList: () => void
  flash: (msg: string) => void
  loadAssets: () => Promise<void>
  addAsset: (asset: Asset & { blob?: Blob }) => Promise<void>
  removeAsset: (id: string) => Promise<void>
  save: () => void
  _scheduleSave: () => void
}

export const useEditorStore = create<EditorStore>()(
  temporal(
    (set, get) => ({
      presentation: createDefaultPresentation('default', 'Hearst Pitch Deck'),
      selectedSlideId: null, selectedElementId: null, activeTab: 'slides', viewMode: 'edit',
      zoom: 100, darkMode: false, showShortcuts: false, isPresentationListOpen: false,
      toast: '', presentations: [], assets: [], isLoading: true, autoSaveTimer: null,

      async init() {
        set({ isLoading: true })
        await db.migrateFromLocalStorage()
        const all = await db.getAllPresentations()
        if (all.length === 0) {
          const defaultPres = createDefaultPresentation('default', 'Hearst Pitch Deck')
          await db.savePresentation(defaultPres)
          await db.setMeta('active-presentation', 'default')
          set({ presentation: defaultPres, presentations: [defaultPres], isLoading: false })
          return
        }
        const activeId = await db.getMeta('active-presentation')
        const active = all.find(p => p.id === activeId) || all[0]
        set({ presentation: active, presentations: all, isLoading: false })
      },

      async loadPresentation(id) {
        const pres = await db.getPresentation(id)
        if (!pres) return
        await db.setMeta('active-presentation', id)
        set({ presentation: pres, selectedSlideId: null, selectedElementId: null })
      },

      async createPresentation(name) {
        const id = nanoid(10)
        const pres = createDefaultPresentation(id, name)
        await db.savePresentation(pres)
        await db.setMeta('active-presentation', id)
        const all = await db.getAllPresentations()
        set({ presentation: pres, presentations: all, selectedSlideId: null })
        get().flash(`"${name}" créé`)
      },

      async duplicatePresentation(id) {
        const src = await db.getPresentation(id)
        if (!src) return
        const newId = nanoid(10)
        const dup: Presentation = { ...JSON.parse(JSON.stringify(src)), id: newId, name: `${src.name} (copie)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        await db.savePresentation(dup)
        await db.setMeta('active-presentation', newId)
        const all = await db.getAllPresentations()
        set({ presentation: dup, presentations: all })
        get().flash('Dupliqué')
      },

      async deletePresentation(id) {
        const { presentations } = get()
        if (presentations.length <= 1) { get().flash('Impossible de supprimer le dernier document'); return }
        await db.deletePresentation(id)
        const all = await db.getAllPresentations()
        const next = all[0]
        if (next) { await db.setMeta('active-presentation', next.id); set({ presentation: next, presentations: all, selectedSlideId: null }) }
        get().flash('Supprimé')
      },

      updatePresentationName(name) { set(s => ({ presentation: { ...s.presentation, name } })); get()._scheduleSave() },
      updateDimensions(dims) { set(s => ({ presentation: { ...s.presentation, dimensions: dims } })); get()._scheduleSave() },
      selectSlide(id) { set({ selectedSlideId: id, selectedElementId: null }) },

      addSlide(type, afterId) {
        const id = nanoid(10)
        const { presentation } = get()
        const newSlide: Slide = { id, order: presentation.slides.length, type, name: `Slide ${presentation.slides.length + 1}`, elements: [], background: { ...DEFAULT_BACKGROUND }, transition: { ...DEFAULT_TRANSITION }, locked: false }
        let slides: Slide[]
        if (afterId) { const idx = presentation.slides.findIndex(s => s.id === afterId); slides = [...presentation.slides]; slides.splice(idx + 1, 0, newSlide) } else { slides = [...presentation.slides, newSlide] }
        slides = slides.map((s, i) => ({ ...s, order: i }))
        set(s => ({ presentation: { ...s.presentation, slides }, selectedSlideId: id }))
        get()._scheduleSave(); get().flash('Slide ajoutée')
      },

      deleteSlide(id) {
        const { presentation } = get()
        const slide = presentation.slides.find(s => s.id === id)
        if (slide?.locked) { get().flash('Slide verrouillée'); return }
        const slides = presentation.slides.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i }))
        set(s => ({ presentation: { ...s.presentation, slides }, selectedSlideId: s.selectedSlideId === id ? null : s.selectedSlideId, selectedElementId: null }))
        get()._scheduleSave(); get().flash('Supprimée')
      },

      moveSlide(id, direction) {
        const { presentation } = get()
        const idx = presentation.slides.findIndex(s => s.id === id)
        const target = idx + direction
        if (target < 0 || target >= presentation.slides.length) return
        const slides = [...presentation.slides];[slides[idx], slides[target]] = [slides[target], slides[idx]]
        set(s => ({ presentation: { ...s.presentation, slides: slides.map((sl, i) => ({ ...sl, order: i })) } }))
        get()._scheduleSave()
      },

      reorderSlides(fromIndex, toIndex) {
        const { presentation } = get()
        const slides = [...presentation.slides]; const [moved] = slides.splice(fromIndex, 1); slides.splice(toIndex, 0, moved)
        set(s => ({ presentation: { ...s.presentation, slides: slides.map((sl, i) => ({ ...sl, order: i })) } }))
        get()._scheduleSave()
      },

      duplicateSlide(id) {
        const { presentation } = get()
        const idx = presentation.slides.findIndex(s => s.id === id)
        if (idx < 0) return
        const src = presentation.slides[idx]
        const dup: Slide = { ...JSON.parse(JSON.stringify(src)), id: nanoid(10), name: `${src.name} (copie)`, locked: false }
        const slides = [...presentation.slides]; slides.splice(idx + 1, 0, dup)
        set(s => ({ presentation: { ...s.presentation, slides: slides.map((sl, i) => ({ ...sl, order: i })) }, selectedSlideId: dup.id }))
        get()._scheduleSave(); get().flash('Slide dupliquée')
      },

      updateSlideBackground(slideId, bg) { set(s => ({ presentation: { ...s.presentation, slides: s.presentation.slides.map(sl => sl.id === slideId ? { ...sl, background: { ...sl.background, ...bg } } : sl) } })); get()._scheduleSave() },
      updateSlideTransition(slideId, t) { set(s => ({ presentation: { ...s.presentation, slides: s.presentation.slides.map(sl => sl.id === slideId ? { ...sl, transition: { ...sl.transition, ...t } } : sl) } })); get()._scheduleSave() },
      updateSlideNotes(slideId, notes) { set(s => ({ presentation: { ...s.presentation, slides: s.presentation.slides.map(sl => sl.id === slideId ? { ...sl, notes } : sl) } })); get()._scheduleSave() },
      updateSlideName(slideId, name) { set(s => ({ presentation: { ...s.presentation, slides: s.presentation.slides.map(sl => sl.id === slideId ? { ...sl, name } : sl) } })); get()._scheduleSave() },
      updateSlideBackgroundImage(slideId, img) { set(s => ({ presentation: { ...s.presentation, slides: s.presentation.slides.map(sl => sl.id === slideId ? { ...sl, backgroundImage: img, background: { type: 'image' as const, image: { src: `/images/book/${img}` }, opacity: 1 } } : sl) } })); get()._scheduleSave() },

      selectElement(id) { set({ selectedElementId: id }) },
      addElement(slideId, element) { const id = nanoid(10); const full: SlideElement = { ...element, id }; set(s => ({ presentation: { ...s.presentation, slides: s.presentation.slides.map(sl => sl.id === slideId ? { ...sl, elements: [...sl.elements, full] } : sl) }, selectedElementId: id })); get()._scheduleSave() },
      updateElement(slideId, elementId, patch) { set(s => ({ presentation: { ...s.presentation, slides: s.presentation.slides.map(sl => sl.id === slideId ? { ...sl, elements: sl.elements.map(el => el.id === elementId ? { ...el, ...patch } : el) } : sl) } })); get()._scheduleSave() },
      updateElementStyle(slideId, elementId, style) { set(s => ({ presentation: { ...s.presentation, slides: s.presentation.slides.map(sl => sl.id === slideId ? { ...sl, elements: sl.elements.map(el => el.id === elementId ? { ...el, style: { ...el.style, ...style } } : el) } : sl) } })); get()._scheduleSave() },
      deleteElement(slideId, elementId) { set(s => ({ presentation: { ...s.presentation, slides: s.presentation.slides.map(sl => sl.id === slideId ? { ...sl, elements: sl.elements.filter(el => el.id !== elementId) } : sl) }, selectedElementId: s.selectedElementId === elementId ? null : s.selectedElementId })); get()._scheduleSave() },

      updateColors(colors) { set(s => ({ presentation: { ...s.presentation, globalTheme: { ...s.presentation.globalTheme, colors: { ...s.presentation.globalTheme.colors, ...colors } } } })); get()._scheduleSave() },
      updateTypography(typo) { set(s => ({ presentation: { ...s.presentation, globalTheme: { ...s.presentation.globalTheme, typography: { ...s.presentation.globalTheme.typography, ...typo } } } })); get()._scheduleSave() },
      applyTheme(theme) { set(s => ({ presentation: { ...s.presentation, globalTheme: theme } })); get()._scheduleSave() },

      setActiveTab(tab) { set({ activeTab: tab }) },
      setViewMode(mode) { set({ viewMode: mode }) },
      setZoom(zoom) { set({ zoom: Math.max(25, Math.min(200, zoom)) }) },
      toggleDarkMode() { set(s => ({ darkMode: !s.darkMode })) },
      toggleShortcuts() { set(s => ({ showShortcuts: !s.showShortcuts })) },
      togglePresentationList() { set(s => ({ isPresentationListOpen: !s.isPresentationListOpen })) },
      flash(msg) { set({ toast: msg }); setTimeout(() => set({ toast: '' }), 2000) },

      async loadAssets() { const assets = await db.getAllAssets(); set({ assets }) },
      async addAsset(asset) { await db.saveAsset(asset); const assets = await db.getAllAssets(); set({ assets }) },
      async removeAsset(id) { await db.deleteAsset(id); const assets = await db.getAllAssets(); set({ assets }) },

      save() {
        const { presentation } = get()
        db.savePresentation(presentation)
        if (typeof window !== 'undefined') {
          try { const ls = presentation.slides.map(s => ({ id: s.id, type: s.type, title: s.name, kicker: s.kicker, backgroundImage: s.backgroundImage, subtitle: s.subtitle, bodyText: s.bodyText, locked: s.locked })); localStorage.setItem('hearst-slides-config', JSON.stringify(ls)) } catch {}
        }
      },
      _scheduleSave() { const { autoSaveTimer } = get(); if (autoSaveTimer) clearTimeout(autoSaveTimer); const timer = setTimeout(() => get().save(), 2000); set({ autoSaveTimer: timer }) },
    }),
    { limit: 30, partialize: (state) => ({ presentation: state.presentation }), equality: (a, b) => JSON.stringify(a) === JSON.stringify(b) }
  )
)
