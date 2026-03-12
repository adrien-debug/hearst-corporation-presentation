import { openDB, type IDBPDatabase } from 'idb'
import type { Presentation, Asset } from './types'

const DB_NAME = 'hearst-editor'
const DB_VERSION = 1

interface HearstDB {
  presentations: { key: string; value: Presentation; indexes: { 'by-updated': string } }
  assets: { key: string; value: Asset & { blob?: Blob }; indexes: { 'by-type': string } }
  meta: { key: string; value: { key: string; value: string } }
}

let dbInstance: IDBPDatabase<HearstDB> | null = null

async function getDB(): Promise<IDBPDatabase<HearstDB>> {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<HearstDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('presentations')) {
        const ps = db.createObjectStore('presentations', { keyPath: 'id' })
        ps.createIndex('by-updated', 'updatedAt')
      }
      if (!db.objectStoreNames.contains('assets')) {
        const as_ = db.createObjectStore('assets', { keyPath: 'id' })
        as_.createIndex('by-type', 'type')
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' })
      }
    },
  })
  return dbInstance
}

export async function getAllPresentations(): Promise<Presentation[]> {
  const db = await getDB()
  const all = await db.getAll('presentations')
  return all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export async function getPresentation(id: string): Promise<Presentation | undefined> {
  const db = await getDB()
  return db.get('presentations', id)
}

export async function savePresentation(p: Presentation): Promise<void> {
  const db = await getDB()
  p.updatedAt = new Date().toISOString()
  await db.put('presentations', p)
}

export async function deletePresentation(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('presentations', id)
}

export async function getAllAssets(): Promise<Asset[]> {
  const db = await getDB()
  return db.getAll('assets')
}

export async function getAsset(id: string): Promise<(Asset & { blob?: Blob }) | undefined> {
  const db = await getDB()
  return db.get('assets', id)
}

export async function saveAsset(asset: Asset & { blob?: Blob }): Promise<void> {
  const db = await getDB()
  await db.put('assets', asset)
}

export async function deleteAsset(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('assets', id)
}

export async function getMeta(key: string): Promise<string | undefined> {
  const db = await getDB()
  const row = await db.get('meta', key)
  return row?.value
}

export async function setMeta(key: string, value: string): Promise<void> {
  const db = await getDB()
  await db.put('meta', { key, value })
}

export async function migrateFromLocalStorage(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  const migrated = await getMeta('migrated-from-localstorage')
  if (migrated === 'true') return false
  const { createDefaultPresentation } = await import('./constants')
  try {
    const docsRaw = localStorage.getItem('hearst-documents')
    if (!docsRaw) { await setMeta('migrated-from-localstorage', 'true'); return false }
    const docs: Array<{ id: string; name: string; createdAt: string; updatedAt: string }> = JSON.parse(docsRaw)
    for (const doc of docs) {
      const configRaw = localStorage.getItem(`hearst-doc-${doc.id}`)
      if (!configRaw) continue
      const config = JSON.parse(configRaw)
      const pres = createDefaultPresentation(doc.id, doc.name)
      pres.createdAt = doc.createdAt
      pres.updatedAt = doc.updatedAt
      if (config.slides && Array.isArray(config.slides)) {
        pres.slides = config.slides.map((s: Record<string, unknown>, i: number) => ({
          id: s.id || `s${i + 1}`, order: i, type: s.type || 'blank', name: (s.title as string) || `Slide ${i + 1}`,
          title: s.title, kicker: s.kicker, backgroundImage: s.backgroundImage, subtitle: s.subtitle, bodyText: s.bodyText,
          elements: [], background: s.backgroundImage ? { type: 'image' as const, image: { src: `/images/book/${s.backgroundImage}` }, opacity: 1 } : { type: 'solid' as const, color: s.type === 'cover' || s.type === 'content' ? '#ffffff' : '#000000', opacity: 1 },
          transition: { type: 'none' as const, duration: 300, easing: 'ease-in-out' }, locked: Boolean(s.locked),
        }))
      }
      if (config.typo) pres.globalTheme.typography = { ...pres.globalTheme.typography, ...config.typo }
      if (config.colors) pres.globalTheme.colors = { ...pres.globalTheme.colors, ...config.colors }
      await savePresentation(pres)
    }
    const activeId = localStorage.getItem('hearst-active-doc')
    if (activeId) await setMeta('active-presentation', activeId)
    await setMeta('migrated-from-localstorage', 'true')
    console.log(`[db] Migrated ${docs.length} presentations from localStorage`)
    return true
  } catch (e) { console.error('[db] Migration failed:', e); return false }
}
