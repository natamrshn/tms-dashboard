import { create } from 'zustand'
import type { CreateOrderFormValues } from '@/entities/order/lib/order.schema'
import type { LocalDraft, DraftTab } from '@/shared/types/draft'
import {
  getAllDrafts,
  saveDraft,
  deleteDraft,
  clearAllDrafts,
} from '@/mocks/storage/draft-storage'
import { generateId, generateReferenceNumber } from '@/shared/lib/utils'
import { MAX_DRAFTS } from '@/shared/config/constants'

interface DraftState {
  tabs: DraftTab[]
  activeDraftId: string | null
  drafts: Record<string, LocalDraft> // in-memory mirror of localStorage drafts
  isAutosaving: boolean

  // Actions
  initDrafts: () => void
  createDraft: (initial?: Partial<CreateOrderFormValues>) => string | null // returns new draft id or null if at limit
  switchDraft: (id: string) => void
  closeDraft: (id: string) => void
  updateDraftData: (id: string, data: Partial<CreateOrderFormValues>) => void
  persistDraft: (id: string) => void
  clearDraft: (id: string) => void
  clearAllDrafts: () => void
  setAutosaving: (val: boolean) => void
}

function buildTab(draft: LocalDraft): DraftTab {
  return {
    id: draft.id,
    label: draft.formData.referenceNumber?.trim() || 'New Draft',
    isDirty: false,
    lastSaved: draft.updatedAt,
  }
}

export const useDraftStore = create<DraftState>((set, get) => ({
  tabs: [],
  activeDraftId: null,
  drafts: {},
  isAutosaving: false,

  initDrafts() {
    // Skip if already initialised — prevents overwriting in-memory state on re-navigation
    if (get().tabs.length > 0) return

    const existing = getAllDrafts()
    if (existing.length > 0) {
      const drafts: Record<string, LocalDraft> = {}
      existing.forEach((d) => (drafts[d.id] = d))
      const tabs = existing.map(buildTab)
      set({ drafts, tabs, activeDraftId: existing[0].id })
    } else {
      // Always open with at least one blank draft
      const id = generateId()
      const now = new Date().toISOString()
      const draft: LocalDraft = {
        id,
        formData: { referenceNumber: generateReferenceNumber() },
        createdAt: now,
        updatedAt: now,
      }
      saveDraft(draft)
      set({
        drafts: { [id]: draft },
        tabs: [buildTab(draft)],
        activeDraftId: id,
      })
    }
  },

  createDraft(initial) {
    const { tabs } = get()
    if (tabs.length >= MAX_DRAFTS) return null

    const id = generateId()
    const now = new Date().toISOString()
    const draft: LocalDraft = {
      id,
      formData: {
        referenceNumber: generateReferenceNumber(),
        ...initial,
      },
      createdAt: now,
      updatedAt: now,
    }
    saveDraft(draft)
    set((s) => ({
      drafts: { ...s.drafts, [id]: draft },
      tabs: [...s.tabs, buildTab(draft)],
      activeDraftId: id,
    }))
    return id
  },

  switchDraft(id) {
    set({ activeDraftId: id })
  },

  closeDraft(id) {
    const { tabs, activeDraftId } = get()
    deleteDraft(id)
    const newTabs = tabs.filter((t) => t.id !== id)
    const newActive =
      activeDraftId === id ? (newTabs[0]?.id ?? null) : activeDraftId

    set((s) => {
      const newDrafts = { ...s.drafts }
      delete newDrafts[id]
      return { drafts: newDrafts, tabs: newTabs, activeDraftId: newActive }
    })

    // If we closed the last draft, create a new blank one
    if (newTabs.length === 0) {
      get().createDraft()
    }
  },

  updateDraftData(id, data) {
    set((s) => {
      const existing = s.drafts[id]
      if (!existing) return s
      const updated: LocalDraft = {
        ...existing,
        formData: { ...existing.formData, ...data },
        updatedAt: new Date().toISOString(),
      }
      const newLabel = updated.formData.referenceNumber?.trim() || 'New Draft'
      return {
        drafts: { ...s.drafts, [id]: updated },
        tabs: s.tabs.map((t) =>
          t.id === id ? { ...t, isDirty: true, label: newLabel } : t,
        ),
      }
    })
  },

  persistDraft(id) {
    const { drafts } = get()
    const draft = drafts[id]
    if (!draft) return
    const persisted: LocalDraft = { ...draft, updatedAt: new Date().toISOString() }
    saveDraft(persisted)
    set((s) => ({
      drafts: { ...s.drafts, [id]: persisted },
      tabs: s.tabs.map((t) =>
        t.id === id ? { ...t, isDirty: false, lastSaved: persisted.updatedAt } : t,
      ),
    }))
  },

  clearDraft(id) {
    set((s) => {
      const existing = s.drafts[id]
      if (!existing) return s
      const cleared: LocalDraft = {
        ...existing,
        formData: { referenceNumber: generateReferenceNumber() },
        updatedAt: new Date().toISOString(),
      }
      saveDraft(cleared)
      return {
        drafts: { ...s.drafts, [id]: cleared },
        tabs: s.tabs.map((t) =>
          t.id === id ? { ...t, isDirty: false, label: 'New Draft' } : t,
        ),
      }
    })
  },

  clearAllDrafts() {
    clearAllDrafts()
    set({ drafts: {}, tabs: [], activeDraftId: null })
    // Re-open with a fresh blank
    get().createDraft()
  },

  setAutosaving(val) {
    set({ isAutosaving: val })
  },
}))
