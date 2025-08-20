"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type Role = "student" | "tutor"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: Role
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (
      firstName: string,
      lastName: string,
      email: string,
      phone: string,
      password: string,
  ) => Promise<boolean>
  logout: () => Promise<void>
  makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<Response>
  getAccessToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ── Config ─────────────────────────────────────────────────────────────────────
const AUTH_HOST =
    process.env.NEXT_PUBLIC_AUTH_HOST?.replace(/\/$/, "") ||
    "https://auth-service-58sq.onrender.com"

const STORAGE = {
  access: "accessToken",
  refresh: "refreshToken",
  user: "userData",
} as const

// ── Helpers ────────────────────────────────────────────────────────────────────
type JwtPayload = Partial<User> & { exp?: number; sub?: string }

function parseJwt(token: string | null): JwtPayload | null {
  if (!token) return null
  try {
    const base64 = token.split(".")[1]
    return JSON.parse(typeof atob !== "undefined" ? atob(base64) : Buffer.from(base64, "base64").toString())
  } catch {
    return null
  }
}

function isExpired(token: string | null): boolean {
  const payload = parseJwt(token)
  if (!payload?.exp) return false
  // небольшой сдвиг на 5 сек, чтобы не «попадать» в границу
  return payload.exp * 1000 <= Date.now() + 5000
}

async function fetchProfile(accessToken: string): Promise<User | null> {
  try {
    const res = await fetch(`${AUTH_HOST}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return null
    const json = await res.json()
    const u = json?.data ?? json?.user
    if (!u) return null
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone ?? "",
      role: (u.role ?? "student") as Role,
    }
  } catch {
    return null
  }
}

// ── Provider ───────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Инициализация: восстановить сессию, при необходимости обновить токен
  useEffect(() => {
    ;(async () => {
      let access = localStorage.getItem(STORAGE.access)
      const refresh = localStorage.getItem(STORAGE.refresh)

      if (!access || isExpired(access)) {
        access = await refreshAccessToken(refresh)
      }

      if (access) {
        const cached = localStorage.getItem(STORAGE.user)
        if (cached) {
          setUser(JSON.parse(cached))
        } else {
          const profile = await fetchProfile(access)
          if (profile) {
            localStorage.setItem(STORAGE.user, JSON.stringify(profile))
            setUser(profile)
          } else {
            // как fallback соберём из JWT то, что есть
            const p = parseJwt(access)
            if (p?.email) {
              const fallback: User = {
                id: p.sub ?? "unknown",
                firstName: p.firstName ?? "User",
                lastName: p.lastName ?? "",
                email: p.email,
                phone: p.phone ?? "",
                role: (p.role ?? "student") as Role,
              }
              localStorage.setItem(STORAGE.user, JSON.stringify(fallback))
              setUser(fallback)
            }
          }
        }
      } else {
        clearStorage()
        setUser(null)
      }

      setLoading(false)
    })()
  }, [])

  const clearStorage = () => {
    localStorage.removeItem(STORAGE.access)
    localStorage.removeItem(STORAGE.refresh)
    localStorage.removeItem(STORAGE.user)
  }

  const getAccessToken = () => localStorage.getItem(STORAGE.access)

  const refreshAccessToken = async (refreshToken: string | null): Promise<string | null> => {
    if (!refreshToken) return null
    try {
      const res = await fetch(`${AUTH_HOST}/api/v1/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) return null
      const j = await res.json()
      const d: any = j?.data ?? {}
      const newAccess: string | null = d.token ?? d.accessToken ?? null
      const newRefresh: string | undefined = d.refreshToken
      if (newAccess) localStorage.setItem(STORAGE.access, newAccess)
      if (newRefresh) localStorage.setItem(STORAGE.refresh, newRefresh)
      return newAccess
    } catch {
      return null
    }
  }

  const login: AuthContextType["login"] = async (email, password) => {
    try {
      const res = await fetch(`${AUTH_HOST}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) return false

      const j: any = await res.json()
      const token: string | undefined = j?.data?.token
      const refreshToken: string | undefined = j?.data?.refreshToken
      if (!token) return false

      localStorage.setItem(STORAGE.access, token)
      if (refreshToken) localStorage.setItem(STORAGE.refresh, refreshToken)

      const profile = (await fetchProfile(token)) ?? {
        id: "unknown",
        firstName: "User",
        lastName: "",
        email,
        phone: "",
        role: "student" as const,
      }
      localStorage.setItem(STORAGE.user, JSON.stringify(profile))
      setUser(profile)
      return true
    } catch {
      return false
    }
  }

  const register: AuthContextType["register"] = async (
      firstName,
      lastName,
      email,
      phone,
      password,
  ) => {
    try {
      const res = await fetch(`${AUTH_HOST}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, password, role: "student" }),
      })
      if (!res.ok) return false

      const j: any = await res.json()
      // у /register токены внутри data.token.{token, refreshToken}
      const token: string | undefined = j?.data?.token?.token
      const refreshToken: string | undefined = j?.data?.token?.refreshToken
      const u = j?.data?.user

      if (!token) return false
      localStorage.setItem(STORAGE.access, token)
      if (refreshToken) localStorage.setItem(STORAGE.refresh, refreshToken)

      const profile: User =
          u
              ? {
                id: u.id,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                phone: u.phone ?? "",
                role: (u.role ?? "student") as Role,
              }
              : (await fetchProfile(token))! // если вдруг сервер не дал user
      localStorage.setItem(STORAGE.user, JSON.stringify(profile))
      setUser(profile)
      return true
    } catch {
      return false
    }
  }

  const logout: AuthContextType["logout"] = async () => {
    try {
      const refreshToken = localStorage.getItem(STORAGE.refresh)
      if (refreshToken) {
        await fetch(`${AUTH_HOST}/api/v1/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        })
      }
    } catch {
      // игнорируем сетевые ошибки при выходе
    } finally {
      clearStorage()
      setUser(null)
      router.push("/login")
    }
  }

// lib/auth-context.tsx
  const makeAuthenticatedRequest: AuthContextType["makeAuthenticatedRequest"] = async (url, options = {}) => {
    const absoluteUrl = /^https?:\/\//.test(url)
        ? url
        : `${AUTH_HOST}${url.startsWith("/") ? "" : "/"}${url}`

    let token = getAccessToken()
    if (!token || isExpired(token)) {
      token = await refreshAccessToken(localStorage.getItem(STORAGE.refresh))
    }
    console.log(options.body)
    const hasBody = typeof options.body !== "undefined" && options.body !== null

    const doFetch = (t: string | null) => {
      const baseHeaders: Record<string, string> = {
        ...(hasBody ? { "Content-Type": "application/json" } : {}), // только если есть body
      }
      const userHeaders = (options.headers || {}) as Record<string, string>

      return fetch(absoluteUrl, {
        ...options,
        mode: "cors",
        headers: {
          ...baseHeaders,
          ...userHeaders,
          ...(t ? { Authorization: `Bearer ${t}` } : {}),
        },
      })
    }

    let res: Response
    try {
      res = await doFetch(token)
    } catch (e: any) {
      // Сетевые ошибки, CORS, DNS, mixed-content и т.п.
      const msg = process.env.NODE_ENV === "development"
          ? `NETWORK_ERROR: ${e?.message || e} — ${absoluteUrl}`
          : "NETWORK_ERROR"
      throw new Error(msg)
    }

    if (res.status === 401) {
      const newTok = await refreshAccessToken(localStorage.getItem(STORAGE.refresh))
      try {
        res = await doFetch(newTok)
      } catch (e: any) {
        throw new Error("NETWORK_ERROR")
      }
      if (res.status === 401) await logout()
    }

    return res
  }


  const value = useMemo<AuthContextType>(
      () => ({
        user,
        loading,
        login,
        register,
        logout,
        makeAuthenticatedRequest,
        getAccessToken,
      }),
      [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
