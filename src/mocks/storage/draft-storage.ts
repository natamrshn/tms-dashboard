import type { LocalDraft } from '@/shared/types/draft'
import {
  DRAFT_STORAGE_INDEX_KEY,
  DRAFT_STORAGE_PREFIX,
} from '@/shared/config/constants'
import { readStorage, writeStorage, removeStorage } from './storage'

export function getDraftIndex(): string[] {
  return readStorage<string[]>(DRAFT_STORAGE_INDEX_KEY) ?? []
}

export function saveDraftIndex(ids: string[]): void {
  writeStorage(DRAFT_STORAGE_INDEX_KEY, ids)
}

export function getDraft(id: string): LocalDraft | null {
  return readStorage<LocalDraft>(`${DRAFT_STORAGE_PREFIX}${id}`)
}

export function saveDraft(draft: LocalDraft): void {
  writeStorage(`${DRAFT_STORAGE_PREFIX}${draft.id}`, draft)
  const index = getDraftIndex()
  if (!index.includes(draft.id)) {
    saveDraftIndex([...index, draft.id])
  }
}

export function deleteDraft(id: string): void {
  removeStorage(`${DRAFT_STORAGE_PREFIX}${id}`)
  const index = getDraftIndex()
  saveDraftIndex(index.filter((i) => i !== id))
}

export function getAllDrafts(): LocalDraft[] {
  const index = getDraftIndex()
  return index
    .map((id) => getDraft(id))
    .filter((d): d is LocalDraft => d !== null)
}

export function clearAllDrafts(): void {
  const index = getDraftIndex()
  index.forEach((id) => removeStorage(`${DRAFT_STORAGE_PREFIX}${id}`))
  saveDraftIndex([])
}
