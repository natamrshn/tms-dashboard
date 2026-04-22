export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const
export const DEFAULT_PAGE_SIZE = 10
export const MAX_DRAFTS = 5
export const DRAFT_AUTOSAVE_INTERVAL_MS = 5_000

export const DRAFT_STORAGE_INDEX_KEY = 'draft:index'
export const DRAFT_STORAGE_PREFIX = 'draft:'
export const ORDERS_STORAGE_KEY = 'tms:orders'
export const CARRIERS_STORAGE_KEY = 'tms:carriers'

export const MOCK_DELAY_BASE_MS = 300
export const MOCK_DELAY_JITTER_MS = 500
export const MOCK_ERROR_RATE = 0.05

export const REFERENCE_PREFIX = 'TMS'

// Bump this when seed data schema changes — forces localStorage reseed
export const SEED_VERSION = '4'
export const SEED_VERSION_KEY = 'tms:seed_version'
