import fs from "fs"
import path from "path"
import crypto from "crypto"

const DATA_DIR = path.join(process.cwd(), "data")
const USERS_FILE = path.join(DATA_DIR, "users.json")

export interface UserPreferences {
  units?: "metric" | "imperial"
  defaultLocation?: { lat: number; lng: number; name?: string }
  [key: string]: any
}

export interface UserRecord {
  id: string
  email: string
  passwordHash: string
  createdAt: string
  lastLogin?: string
  preferences?: UserPreferences
  searchHistory?: Array<{ query: string; lat?: number; lng?: number; at: string }>
  savedLocations?: Array<{ lat: number; lng: number; name?: string }>
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]))
  }
}

function readUsers(): UserRecord[] {
  ensureDataDir()
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf-8")
    return JSON.parse(raw || "[]")
  } catch (e) {
    return []
  }
}

function writeUsers(users: UserRecord[]) {
  ensureDataDir()
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

function hashPassword(password: string, salt = "app_salt_v1") {
  return crypto.createHmac("sha256", salt).update(password).digest("hex")
}

export function createUser(email: string, password: string): UserRecord | null {
  const users = readUsers()
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) return null
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const user: UserRecord = {
    id,
    email,
    passwordHash: hashPassword(password),
    createdAt: now,
    preferences: { units: "metric" },
    searchHistory: [],
    savedLocations: [],
  }
  users.push(user)
  writeUsers(users)
  return user
}

export function authenticateUser(email: string, password: string): UserRecord | null {
  const users = readUsers()
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!found) return null
  if (found.passwordHash !== hashPassword(password)) return null
  found.lastLogin = new Date().toISOString()
  writeUsers(users)
  return found
}

export function getUserById(id: string): UserRecord | null {
  const users = readUsers()
  return users.find((u) => u.id === id) || null
}

export function addSearchHistory(userId: string, query: string, lat?: number, lng?: number) {
  const users = readUsers()
  const user = users.find((u) => u.id === userId)
  if (!user) return null
  user.searchHistory = user.searchHistory || []
  user.searchHistory.unshift({ query, lat, lng, at: new Date().toISOString() })
  // keep recent 50
  user.searchHistory = user.searchHistory.slice(0, 50)
  writeUsers(users)
  return user
}

export function updatePreferences(userId: string, prefs: Partial<UserPreferences>) {
  const users = readUsers()
  const user = users.find((u) => u.id === userId)
  if (!user) return null
  user.preferences = { ...(user.preferences || {}), ...(prefs || {}) }
  writeUsers(users)
  return user
}

export function saveLocation(userId: string, loc: { lat: number; lng: number; name?: string }) {
  const users = readUsers()
  const user = users.find((u) => u.id === userId)
  if (!user) return null
  user.savedLocations = user.savedLocations || []
  user.savedLocations.push(loc)
  writeUsers(users)
  return user
}
