"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfilePhotoUpload } from "./profile-photo-upload"

type AggregatedProfile = {
  user: {
    id: string
    email: string
    phoneE164: string
    role: "student" | "tutor"
    locale?: string
    countryCode?: string
    firstName: string
    lastName: string
  }
  student?: {
    displayName?: string
    birthdate?: string
    prefs?: { avatar_url?: string; theme?: string }
  }
  tutor?: {
    hasTutor: boolean
    avatarUrl?: string
    timezone?: string
    yearsExperience?: number
    videoUrl?: string
    ratingAvg?: string
    ratingCount?: number
  }
}

const USER_HOST =
    (process.env.NEXT_PUBLIC_USER_HOST || "https://user-service-jc2p.onrender.com").replace(/\/$/, "")

export function ProfileForm() {
  const { makeAuthenticatedRequest, logout } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>("")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    displayName: "",
    avatarUrl: "",
  })

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // ── Fetch profile on mount ──────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError("")
        const res = await makeAuthenticatedRequest(`${USER_HOST}/api/v1/users/profile`)
        if (res.status === 401) {
          // провал авто-рефреша -> разлогиним
          await logout()
          return
        }
        if (!res.ok) {
          throw new Error("Не удалось загрузить профиль")
        }
        const json = (await res.json()) as { success: boolean; data: AggregatedProfile }
        const d = json.data

        if (mounted && d?.user) {
          setFormData({
            firstName: d.user.firstName ?? "",
            lastName: d.user.lastName ?? "",
            email: d.user.email ?? "",
            phone: d.user.phoneE164 ?? "",
            displayName: d.student?.displayName ?? "",
            avatarUrl: d.student?.prefs?.avatar_url || d.tutor?.avatarUrl || "",
          })

          // обновим локальный кэш, чтобы остальная часть приложения видела свежее имя
          const cached = {
            id: d.user.id,
            firstName: d.user.firstName,
            lastName: d.user.lastName,
            email: d.user.email,
            phone: d.user.phoneE164,
            role: d.user.role,
          }
          try {
            localStorage.setItem("userData", JSON.stringify(cached))
          } catch {}
        }
      } catch (e: any) {
        setError(e?.message || "Ошибка загрузки профиля")
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Save minimal fields via PUT ─────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setSaving(true)
      setError("")

      // По контракту PUT обновляет firstName/lastName + student поля (displayName, prefs и т.д.)
      const body: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        // Пример: передадим displayName, если есть
        ...(formData.displayName ? { displayName: formData.displayName } : {}),
        // avatar менять через prefs.avatar_url (если понадобится)
        // ...(formData.avatarUrl ? { prefs: { avatar_url: formData.avatarUrl } } : {}),
      }

      const res = await makeAuthenticatedRequest(`${USER_HOST}/api/v1/users/profile`, {
        method: "PUT",
        body: JSON.stringify(body),
      })

      if (res.status === 401) {
        await logout()
        return
      }
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || "Не удалось сохранить профиль")
      }

      const json = (await res.json()) as { success: boolean; data: AggregatedProfile }
      const d = json.data
      setFormData((prev) => ({
        ...prev,
        firstName: d.user.firstName ?? prev.firstName,
        lastName: d.user.lastName ?? prev.lastName,
        displayName: d.student?.displayName ?? prev.displayName,
      }))

      // синхронизируем локальный кэш
      try {
        localStorage.setItem(
            "userData",
            JSON.stringify({
              id: d.user.id,
              firstName: d.user.firstName,
              lastName: d.user.lastName,
              email: d.user.email,
              phone: d.user.phoneE164,
              role: d.user.role,
            }),
        )
      } catch {}
    } catch (e: any) {
      setError(e?.message || "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  // ── UI ──────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Имя</Label>
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label>Фамилия</Label>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Почта</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Label>Номер телефона</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
    )
  }

  return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
              <div role="alert" aria-live="polite" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
          )}

          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя</Label>
                  <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия</Label>
                  <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="bg-background"
                  />
                </div>
              </div>

              {/* Display name (опционально, хранится в student) */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Отображаемое имя</Label>
                <Input
                    id="displayName"
                    placeholder="Как вас показывать другим"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange("displayName", e.target.value)}
                    className="bg-background"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Почта</Label>
                <div className="flex gap-2">
                  <Input id="email" type="email" value={formData.email} disabled className="flex-1 bg-muted" />
                  <Button variant="outline" size="sm" disabled title="Изменение почты будет доступно позже">
                    Изменить
                  </Button>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Номер телефона</Label>
                <div className="flex gap-2">
                  <Input id="phone" type="tel" value={formData.phone} disabled className="flex-1 bg-muted" />
                  <Button variant="outline" size="sm" disabled title="Изменение номера требует подтверждения по SMS">
                    Изменить
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Изменение почты и номера делается через безопасную верификацию и появится в следующих версиях.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving ? "Сохраняем…" : "Сохранить"}
            </Button>
            <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            >
              Выйти
            </Button>
          </div>
        </div>

        {/* Profile Photo & Tutor CTA */}
        <div className="space-y-6">
          {/* Если захотите — можно прокинуть avatarUrl внутрь компонента */}
          <ProfilePhotoUpload />

          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Аккаунт репетитора</h3>
                <p className="text-sm text-muted-foreground">Создайте профиль репетитора и начните зарабатывать, обучая других</p>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Стать репетитором
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
