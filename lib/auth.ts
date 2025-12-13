export interface User {
  id: string
  accessCode: string // Replaced username with accessCode
  createdAt: string
}

export interface UserData {
  user: User
  codeHash: string // Replaced passwordHash with codeHash
  subscription?: {
    plan: string
    expiresAt: string
    isActive: boolean
  }
  keys?: Array<{
    id: string
    type: string
    config: string
    createdAt: string
  }>
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>"'&]/g, "")
    .substring(0, 50)
}

export function validateAccessCode(code: string): { valid: boolean; error?: string } {
  const sanitized = code.trim().toUpperCase()

  // Check format: XXXX-XXXX-XXXX-XXXX (16 chars + 3 hyphens)
  if (sanitized.length !== 19) {
    return { valid: false, error: "Access code must be 16 characters in format XXXX-XXXX-XXXX-XXXX" }
  }

  if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(sanitized)) {
    return { valid: false, error: "Invalid access code format" }
  }

  return { valid: true }
}

function getUsersDatabase(): Record<string, UserData> {
  if (typeof window === "undefined") return {}

  const usersStr = localStorage.getItem("opennet_users_db")
  if (!usersStr) return {}

  try {
    return JSON.parse(usersStr)
  } catch {
    return {}
  }
}

function saveUsersDatabase(users: Record<string, UserData>) {
  if (typeof window !== "undefined") {
    localStorage.setItem("opennet_users_db", JSON.stringify(users))
  }
}

export function checkAccessCodeExists(code: string): boolean {
  const users = getUsersDatabase()
  const normalizedCode = code.toUpperCase()
  return Object.values(users).some((userData) => userData.user.accessCode === normalizedCode)
}

async function hashAccessCode(code: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(code.toUpperCase() + "opennet_salt_2024")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

async function verifyAccessCode(code: string, hash: string): Promise<boolean> {
  const codeHash = await hashAccessCode(code)
  return codeHash === hash
}

export async function createUser(): Promise<{ success: boolean; error?: string; user?: User; accessCode?: string }> {
  let accessCode = generateAccessCode()
  let attempts = 0

  // Ensure unique code (very unlikely to collide, but just in case)
  while (checkAccessCodeExists(accessCode) && attempts < 10) {
    accessCode = generateAccessCode()
    attempts++
  }

  if (attempts >= 10) {
    return { success: false, error: "Failed to generate unique access code. Please try again." }
  }

  const users = getUsersDatabase()
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const codeHash = await hashAccessCode(accessCode)

  const newUser: User = {
    id: userId,
    accessCode: accessCode,
    createdAt: new Date().toISOString(),
  }

  const trialExpiresAt = new Date()
  trialExpiresAt.setDate(trialExpiresAt.getDate() + 3) // Add 3 days

  const userData: UserData = {
    user: newUser,
    codeHash,
    subscription: {
      plan: "3-day trial",
      expiresAt: trialExpiresAt.toISOString(),
      isActive: true,
    },
  }

  users[userId] = userData
  saveUsersDatabase(users)

  return { success: true, user: newUser, accessCode }
}

export async function authenticateUser(accessCode: string): Promise<{ success: boolean; error?: string; user?: User }> {
  const validation = validateAccessCode(accessCode)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  const normalizedCode = accessCode.toUpperCase()
  const users = getUsersDatabase()

  const userData = Object.values(users).find((userData) => userData.user.accessCode === normalizedCode)

  if (!userData) {
    return { success: false, error: "Invalid access code" }
  }

  // Verify the code against stored hash
  const isValidCode = await verifyAccessCode(normalizedCode, userData.codeHash)
  if (!isValidCode) {
    return { success: false, error: "Invalid access code" }
  }

  return { success: true, user: userData.user }
}

export function generateAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const segments = []

  for (let i = 0; i < 4; i++) {
    let segment = ""
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    segments.push(segment)
  }

  return segments.join("-")
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem("opennet_current_user")
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function setCurrentUser(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem("opennet_current_user", JSON.stringify(user))
  }
}

export function getUserData(userId: string): UserData | null {
  const users = getUsersDatabase()
  return users[userId] || null
}

export function updateUserData(userId: string, updates: Partial<UserData>) {
  const users = getUsersDatabase()
  if (users[userId]) {
    users[userId] = { ...users[userId], ...updates }
    saveUsersDatabase(users)
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("opennet_current_user")
    window.location.href = "/login"
  }
}

export function requireAuth(): User {
  const user = getCurrentUser()
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    throw new Error("Authentication required")
  }
  return user
}
