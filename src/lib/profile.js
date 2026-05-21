const STORAGE_KEY = 'velion_profile'

function read() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function write(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function getProfile() {
  const p = read()
  return {
    name: p.name || '',
    avatar: p.avatar || '',
    createdAt: p.createdAt || null
  }
}

export function setProfile(patch) {
  const curr = read()
  const next = { ...curr, ...patch }
  if (!next.createdAt) next.createdAt = new Date().toISOString()
  write(next)
  return next
}

export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
