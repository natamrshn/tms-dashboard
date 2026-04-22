// Type-safe localStorage helpers with JSON serialization

export function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage quota exceeded — fail silently but don't crash the app
    console.warn(`[storage] Failed to write key "${key}"`)
  }
}

export function removeStorage(key: string): void {
  localStorage.removeItem(key)
}
