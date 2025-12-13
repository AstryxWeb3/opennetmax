import { supabase } from './supabase'

export interface User {
  id: string
  accessCode: string
  createdAt: string
}

export interface UserData {
  user: User
  subscription?: {
    plan: string
    expiresAt: string
    isActive: boolean
  }
  keys?: Array<{
    id: string
    type: string
    config: string
    location: string
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

  if (sanitized.length !== 19) {
    return { valid: false, error: "Access code must be 16 characters in format XXXX-XXXX-XXXX-XXXX" }
  }

  if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(sanitized)) {
    return { valid: false, error: "Invalid access code format" }
  }

  return { valid: true }
}

async function hashAccessCode(code: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(code.toUpperCase() + "opennet_salt_2024")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
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

export async function createUser(): Promise<{ success: boolean; error?: string; user?: User; accessCode?: string }> {
  try {
    let accessCode = generateAccessCode()
    let attempts = 0

    while (attempts < 10) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('access_code', accessCode)
        .maybeSingle()

      if (!existingUser) break

      accessCode = generateAccessCode()
      attempts++
    }

    if (attempts >= 10) {
      return { success: false, error: "Failed to generate unique access code. Please try again." }
    }

    const codeHash = await hashAccessCode(accessCode)

    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        access_code: accessCode,
        access_code_hash: codeHash,
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating user:', userError)
      return { success: false, error: "Failed to create user" }
    }

    const trialExpiresAt = new Date()
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 3)

    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: newUser.id,
        plan: '3-day trial',
        expires_at: trialExpiresAt.toISOString(),
        is_active: true,
      })

    if (subError) {
      console.error('Error creating subscription:', subError)
    }

    const user: User = {
      id: newUser.id,
      accessCode: newUser.access_code,
      createdAt: newUser.created_at,
    }

    return { success: true, user, accessCode }
  } catch (error) {
    console.error('Error in createUser:', error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function authenticateUser(accessCode: string): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const validation = validateAccessCode(accessCode)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const normalizedCode = accessCode.toUpperCase()

    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('access_code', normalizedCode)
      .maybeSingle()

    if (error || !userData) {
      return { success: false, error: "Invalid access code" }
    }

    const codeHash = await hashAccessCode(normalizedCode)
    if (codeHash !== userData.access_code_hash) {
      return { success: false, error: "Invalid access code" }
    }

    const user: User = {
      id: userData.id,
      accessCode: userData.access_code,
      createdAt: userData.created_at,
    }

    return { success: true, user }
  } catch (error) {
    console.error('Error in authenticateUser:', error)
    return { success: false, error: "An unexpected error occurred" }
  }
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

export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (userError || !userData) return null

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: keys } = await supabase
      .from('vpn_keys')
      .select('*')
      .eq('user_id', userId)

    const user: User = {
      id: userData.id,
      accessCode: userData.access_code,
      createdAt: userData.created_at,
    }

    const result: UserData = {
      user,
    }

    if (subscription) {
      result.subscription = {
        plan: subscription.plan,
        expiresAt: subscription.expires_at,
        isActive: subscription.is_active && new Date(subscription.expires_at) > new Date(),
      }
    }

    if (keys) {
      result.keys = keys.map((key) => ({
        id: key.id,
        type: key.key_type,
        config: key.config,
        location: key.location,
        createdAt: key.created_at,
      }))
    }

    return result
  } catch (error) {
    console.error('Error in getUserData:', error)
    return null
  }
}

export async function updateUserData(userId: string, updates: Partial<UserData>) {
  if (updates.subscription) {
    await supabase
      .from('subscriptions')
      .update({
        plan: updates.subscription.plan,
        expires_at: updates.subscription.expiresAt,
        is_active: updates.subscription.isActive,
      })
      .eq('user_id', userId)
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
