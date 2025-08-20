"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import {
  Bell,
  Calendar,
  Check,
  ChevronLeft,
  Globe,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  Trash2,
  Upload,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

/* ──────────────────────────────────────────────────────────────────────────────
  TYPES
────────────────────────────────────────────────────────────────────────────── */
type LangCode = string
type Proficiency = "native" | "C2" | "C1" | "B2" | "B1" | "A2" | "A1"

interface Language {
  code: LangCode
  name: string
}
interface University {
  id: string
  slug: string
  name: { en: string; ru: string }
  countryCode: string
  city: string
}
interface Subject {
  id: string
  slug: string
  name: { en: string; ru: string }
}

interface SubjectItem {
  subjectId: string
  subjectSlug: string
  level: "beginner" | "intermediate" | "advanced"
  priceMinor: number
  currency: "KZT"
}

interface FormState {
  firstName: string
  lastName: string
  gender: "" | "male" | "female"
  avatarUrl: string
  headline: string
  bio: string
  yearsExperience: number
  languages: { code: LangCode; proficiency: Proficiency | "" }[]
  education: {
    description: string
    education: { degree: string; institution: string; year: string; field: string }[]
    certificates: { name: string; issuer: string; year: string }[]
  }
  subjects: {
    items: SubjectItem[]
    regularPrices: Record<string, number>
    trialPrices: Record<string, number>
    levels: Record<string, SubjectItem["level"]>
  }
  schedule: { id: string; name: string; enabled: boolean; startTime: string; endTime: string }[]
  videoGreeting: File | null
  selectedUniversity: string
}

/* ──────────────────────────────────────────────────────────────────────────────
  CONSTANTS
────────────────────────────────────────────────────────────────────────────── */
const steps = [
  { id: 1, title: "О себе" },
  { id: 2, title: "Предмет" },
  { id: 3, title: "Профиль" },
  { id: 4, title: "Видео" },
  { id: 5, title: "Расписание" },
  { id: 6, title: "Модерация" },
] as const

const weekDays = [
  { id: "monday", name: "Понедельник", enabled: false, startTime: "", endTime: "" },
  { id: "tuesday", name: "Вторник", enabled: false, startTime: "", endTime: "" },
  { id: "wednesday", name: "Среда", enabled: false, startTime: "", endTime: "" },
  { id: "thursday", name: "Четверг", enabled: false, startTime: "", endTime: "" },
  { id: "friday", name: "Пятница", enabled: false, startTime: "", endTime: "" },
  { id: "saturday", name: "Суббота", enabled: false, startTime: "", endTime: "" },
  { id: "sunday", name: "Воскресенье", enabled: false, startTime: "", endTime: "" },
]



const AUTH_API_BASE =
    (process.env.NEXT_PUBLIC_AUTH_HOST?.replace(/\/$/, "") || "https://auth-service-58sq.onrender.com") + "/api/v1"
const SUBJECTS_API = `${AUTH_API_BASE}/admin/subjects`

const TUTOR_API_BASE =
    (process.env.NEXT_PUBLIC_TUTOR_HOST?.replace(/\/$/, "") || "https://tutor-service-ikls.onrender.com") + "/api/v1"

/* ──────────────────────────────────────────────────────────────────────────────
  HELPERS (pure)
────────────────────────────────────────────────────────────────────────────── */
const buildSubjectsPayload = (form: FormState) => {
  const items = form.subjects.items
      .map((it) => {
        const slug = it.subjectSlug
        const price = Number(form.subjects.regularPrices[slug] ?? 0)
        if (!price || Number.isNaN(price)) return null
        const level = (form.subjects.levels[slug] || it.level || "intermediate") as SubjectItem["level"]
        return { subjectId: it.subjectId, subjectSlug: slug, level, priceMinor: price, currency: "KZT" as const }
      })
      .filter(Boolean) as SubjectItem[]

  const regularPrices = Object.fromEntries(
      form.subjects.items.map((it) => [it.subjectSlug, Number(form.subjects.regularPrices[it.subjectSlug] ?? 0)]),
  )
  const trialPrices = Object.fromEntries(
      form.subjects.items.map((it) => [it.subjectSlug, Number(form.subjects.trialPrices[it.subjectSlug] ?? 0)]),
  )

  return { items, regularPrices, trialPrices }
}



/* ──────────────────────────────────────────────────────────────────────────────
  PAGE COMPONENT
────────────────────────────────────────────────────────────────────────────── */
export default function BecomeTutorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { makeAuthenticatedRequest } = useAuth()

  // ── UI / wizard
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // ── API data
  const [languages, setLanguages] = useState<Language[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])

  // ── Form state
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    gender: "",
    avatarUrl: "",
    headline: "",
    bio: "",
    yearsExperience: 0,
    languages: [{ code: "", proficiency: "" }],
    education: {
      description: "",
      education: [{ degree: "", institution: "", year: "", field: "" }],
      certificates: [],
    },
    subjects: {
      items: [],
      regularPrices: {},
      trialPrices: {},
      levels: {},
    },

    schedule: weekDays,
    videoGreeting: null,
    selectedUniversity: "",
  })

  // для выбора предмета в шаге 2
  const [subjectToAdd, setSubjectToAdd] = useState<string>("")

  /* ──────────────────────────────────────────────────────────────────────────
    FETCHERS
  ─────────────────────────────────────────────────────────────────────────── */
  const fetchLanguages = async () => {
    try {
      const res = await makeAuthenticatedRequest(`${AUTH_API_BASE}/admin/languages`)
      const json = await res.json()
      if (json?.success) setLanguages(json.data as Language[])
    } catch (e) {
      console.error("fetchLanguages:", e)
      toast({ title: "Ошибка", description: "Не удалось загрузить языки", variant: "destructive" })
    }
  }

  const fetchUniversities = async () => {
    try {
      const res = await makeAuthenticatedRequest(`${AUTH_API_BASE}/admin/universities`)
      const json = await res.json()
      if (json?.success) setUniversities(json.data as University[])
    } catch (e) {
      console.error("fetchUniversities:", e)
      toast({ title: "Ошибка", description: "Не удалось загрузить университеты", variant: "destructive" })
    }
  }

  const fetchSubjects = async () => {
    try {
      const res = await makeAuthenticatedRequest(SUBJECTS_API)
      const json = await res.json()
      if (json?.success) setSubjects(json.data as Subject[])
      else throw new Error("success=false")
    } catch (e) {
      console.error("fetchSubjects:", e)
      toast({ title: "Ошибка", description: "Не удалось загрузить предметы", variant: "destructive" })
    }
  }

  useEffect(() => {
    ;(async () => {
      await Promise.all([fetchLanguages(), fetchUniversities(), fetchSubjects()])
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ──────────────────────────────────────────────────────────────────────────
    ACTIONS (API mutations)
  ─────────────────────────────────────────────────────────────────────────── */
  const submitStep1 = async () => {
    setIsLoading(true);
    try {
      const res = await makeAuthenticatedRequest(`${TUTOR_API_BASE}/tutors/profile/about`, {
        method: "PUT",
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          gender: form.gender,
          avatarUrl: form.avatarUrl,
          languages: form.languages,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || `HTTP_${res.status}`);
      }
      toast({ title: "Успешно", description: "Данные профиля сохранены" });
    } catch (e: any) {
      console.error("submitStep1:", e);
      toast({ title: "Ошибка", description: e?.message || "Не удалось сохранить данные профиля", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  const submitStep2 = async () => {
    setIsLoading(true)
    try {
      const payload = buildSubjectsPayload(form)
      if (payload.items.length === 0) throw new Error("Укажите предмет(ы) и цену за урок")

      const [subjectsRes, educationRes] = await Promise.all([
        makeAuthenticatedRequest(`${TUTOR_API_BASE}/tutors/profile/subjects`, {
          method: "PUT",
          body: JSON.stringify(payload),
        }),
        makeAuthenticatedRequest(`${TUTOR_API_BASE}/tutors/profile/education`, {
          method: "PUT",
          body: JSON.stringify(form.education),
        }),
      ])

      const subjectsJson = await subjectsRes.json().catch(() => ({}))
      const educationJson = await educationRes.json().catch(() => ({}))

      if (!subjectsRes.ok || subjectsJson?.success === false) {
        throw new Error(subjectsJson?.message || `SUBJECTS_HTTP_${subjectsRes.status}`)
      }
      if (!educationRes.ok || educationJson?.success === false) {
        throw new Error(educationJson?.message || `EDUCATION_HTTP_${educationRes.status}`)
      }

      toast({ title: "Успешно", description: "Данные о предметах и образовании сохранены" })
    } catch (e: any) {
      console.error("submitStep2:", e)
      toast({ title: "Ошибка", description: e?.message || "Не удалось сохранить данные", variant: "destructive" })
      throw e
    } finally {
      setIsLoading(false)
    }
  }
  const submitStep3 = async () => {
    setIsLoading(true)
    try {
      const res = await makeAuthenticatedRequest(`${TUTOR_API_BASE}/tutors/profile/summary`, {
        method: "PUT",
        body: JSON.stringify({
          headline: form.headline.trim(),
          bio: form.bio.trim(),
          yearsExperience: Number.isFinite(form.yearsExperience) ? form.yearsExperience : 0,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `SUMMARY_HTTP_${res.status}`)
      }
      toast({ title: "Успешно", description: "Описание профиля сохранено" })
    } catch (e: any) {
      console.error("submitStep3:", e)
      toast({
        title: "Ошибка",
        description: e?.message || "Не удалось сохранить описание профиля",
        variant: "destructive",
      })
      throw e
    } finally {
      setIsLoading(false)
    }
  }


  /* ──────────────────────────────────────────────────────────────────────────
    SUBJECTS helpers (local state)
  ─────────────────────────────────────────────────────────────────────────── */
  const addSelectedSubject = () => {
    const subj = subjects.find((s) => s.id === subjectToAdd)
    if (!subj) return
    if (form.subjects.items.some((it) => it.subjectSlug === subj.slug)) return // no duplicates

    setForm((prev) => ({
      ...prev,
      subjects: {
        ...prev.subjects,
        items: [
          ...prev.subjects.items,
          { subjectId: subj.id, subjectSlug: subj.slug, level: "intermediate", priceMinor: 0, currency: "KZT" },
        ],
      },
    }))
    setSubjectToAdd("")
  }

  const removeSubject = (slug: string) => {
    setForm((prev) => {
      const nextItems = prev.subjects.items.filter((it) => it.subjectSlug !== slug)
      const { [slug]: _r, ...regular } = prev.subjects.regularPrices
      const { [slug]: _t, ...trial } = prev.subjects.trialPrices
      const { [slug]: _l, ...levels } = prev.subjects.levels
      return { ...prev, subjects: { ...prev.subjects, items: nextItems, regularPrices: regular, trialPrices: trial, levels } }
    })
  }

  const setRegular = (slug: string, val: string) =>
      setForm((prev) => ({
        ...prev,
        subjects: {
          ...prev.subjects,
          regularPrices: { ...prev.subjects.regularPrices, [slug]: Number.parseInt(val || "0", 10) || 0 },
        },
      }))

  const setTrial = (slug: string, val: string) =>
      setForm((prev) => ({
        ...prev,
        subjects: {
          ...prev.subjects,
          trialPrices: { ...prev.subjects.trialPrices, [slug]: Number.parseInt(val || "0", 10) || 0 },
        },
      }))

  const setLevel = (slug: string, level: SubjectItem["level"]) =>
      setForm((prev) => ({ ...prev, subjects: { ...prev.subjects, levels: { ...prev.subjects.levels, [slug]: level } } }))

  const hasAnyPrice = useMemo(
      () => form.subjects.items.some((it) => Number(form.subjects.regularPrices[it.subjectSlug] ?? 0) > 0),
      [form.subjects.items, form.subjects.regularPrices],
  )

  /* ──────────────────────────────────────────────────────────────────────────
    WIZARD NAV
  ─────────────────────────────────────────────────────────────────────────── */

  const saveToLocalStorage = (currentStep: number, completedSteps: number[], form: FormState) => {
    const stateToSave = {
      currentStep,
      completedSteps,
      form,
    }
    localStorage.setItem("tutorRegistrationState", JSON.stringify(stateToSave))
  }

  useEffect(() => {
    const savedState = localStorage.getItem("tutorRegistrationState")
    if (savedState) {
      const { currentStep, completedSteps, form } = JSON.parse(savedState)
      setCurrentStep(currentStep)
      setCompletedSteps(completedSteps)
      setForm(form)
    }
  }, [])

  useEffect(() => {
    saveToLocalStorage(currentStep, completedSteps, form)
  }, [currentStep, completedSteps, form])

  const handleNext = async () => {
    try {
      if (currentStep === 1) await submitStep1()
      else if (currentStep === 2) await submitStep2()
      else if (currentStep === 3) await submitStep3()

      if (currentStep < 6) {
        setCompletedSteps((s) => [...s, currentStep])
        setCurrentStep((s) => s + 1)
      }
    } catch {/* ошибки уже показаны в submit-функциях */}
  }

  const handleBack = () => {
    if (currentStep === 1) router.push("/welcome")
    else setCurrentStep((s) => s - 1)
  }

  const handleSkip = () => {
    // помечаем шаг как выполненный (или оставляем, если уже помечен)
    setCompletedSteps((prev) => (prev.includes(currentStep) ? prev : [...prev, currentStep]))
    // двигаемся дальше
    setCurrentStep((s) => Math.min(6, s + 1))
    // мягкое уведомление
    toast({
      title: "Шаг пропущен",
      description: "Вы сможете загрузить видео позже в настройках профиля.",
    })
  }


  /* ──────────────────────────────────────────────────────────────────────────
    STEP VIEWS (маленькие компоненты)
  ─────────────────────────────────────────────────────────────────────────── */
  const Step1About = () => (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Расскажите о себе</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Загрузите фото профиля</p>
              <div className="relative inline-block">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={form.avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback>
                    {form.firstName?.[0]}
                    {form.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Макс. размер 2&nbsp;МБ, форматы png, jpeg
              </p>
            </div>

            <div>
              <Label htmlFor="firstName">Имя</Label>
              <Input id="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            </div>

            <div>
              <Label htmlFor="lastName">Фамилия</Label>
              <Input id="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>

            <div>
              <Label>Пол</Label>
              <RadioGroup
                  value={form.gender}
                  onValueChange={(value) => setForm({ ...form, gender: value as FormState["gender"] })}
                  className="flex space-x-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Мужчина</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Женщина</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div>
            <Label>Знание языков</Label>
            <div className="space-y-4 mt-2">
              {form.languages.map((lang, index) => (
                  <div key={index} className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Язык преподавания</Label>
                        <Select
                            value={lang.code}
                            onValueChange={(value) =>
                                setForm((prev) => {
                                  const next = [...prev.languages]
                                  next[index] = { ...next[index], code: value }
                                  return { ...prev, languages: next }
                                })
                            }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите язык" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((l) => (
                                <SelectItem key={l.code} value={l.code}>
                                  {l.name}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Уровень владения</Label>
                        <Select
                            value={lang.proficiency}
                            onValueChange={(value) =>
                                setForm((prev) => {
                                  const next = [...prev.languages]
                                  next[index] = { ...next[index], proficiency: value as Proficiency }
                                  return { ...prev, languages: next }
                                })
                            }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите уровень" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="native">Родной</SelectItem>
                            <SelectItem value="C2">C2</SelectItem>
                            <SelectItem value="C1">C1</SelectItem>
                            <SelectItem value="B2">B2</SelectItem>
                            <SelectItem value="B1">B1</SelectItem>
                            <SelectItem value="A2">A2</SelectItem>
                            <SelectItem value="A1">A1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {form.languages.length > 1 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                setForm((prev) => ({ ...prev, languages: prev.languages.filter((_, i) => i !== index) }))
                            }
                            className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Удалить
                        </Button>
                    )}
                  </div>
              ))}
              <Button variant="ghost" onClick={() => setForm((p) => ({ ...p, languages: [...p.languages, { code: "", proficiency: "" }] }))} className="text-primary">
                <Plus className="w-4 h-4 mr-2" />
                Добавить язык
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Продолжая, я принимаю{" "}
            <a href="#" className="text-primary">
              правила публичной оферты
            </a>
          </p>
          <Button
              onClick={handleNext}
              className="w-full max-w-md"
              disabled={isLoading || !form.firstName || !form.lastName || !form.gender}
          >
            {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Сохранение...
                </>
            ) : (
                "Продолжить"
            )}
          </Button>
        </div>
      </div>
  )

  const Step2Subjects = () => (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Предметы, которые вы преподаёте, и цены</h1>

        <div className="space-y-8">
          {/* Университет */}
          <div>
            <Label>Где вы обучались?</Label>
            <Select value={form.selectedUniversity} onValueChange={(v) => setForm({ ...form, selectedUniversity: v })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Выберите университет" />
              </SelectTrigger>
              <SelectContent>
                {universities.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name.ru}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Добавление предмета */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <Label>Добавить предмет</Label>
              <Select value={subjectToAdd} onValueChange={setSubjectToAdd}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Выберите предмет" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name.ru}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full mt-2 md:mt-6" onClick={addSelectedSubject} disabled={!subjectToAdd}>
                Добавить
              </Button>
            </div>
          </div>

          {/* Карточки выбранных предметов */}
          <div className="space-y-4">
            {form.subjects.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Пока не выбран ни один предмет.</p>
            ) : (
                form.subjects.items.map((it, idx) => {
                  const subj = subjects.find((s) => s.id === it.subjectId)
                  const title = subj?.name?.ru || it.subjectSlug
                  const slug = it.subjectSlug
                  const level = form.subjects.levels[slug] || it.level || "intermediate"
                  const regular = form.subjects.regularPrices[slug] ?? 0
                  const trial = form.subjects.trialPrices[slug] ?? 0

                  return (
                      <Card key={`${slug}-${idx}`} className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="font-medium truncate">{title}</h3>
                            <p className="text-xs text-muted-foreground break-all">{slug}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full md:w-auto">
                            <div>
                              <Label className="text-sm">Уровень</Label>
                              <Select value={level} onValueChange={(val) => setLevel(slug, val as SubjectItem["level"])}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Выбрать" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="beginner">Beginner</SelectItem>
                                  <SelectItem value="intermediate">Intermediate</SelectItem>
                                  <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-sm">Обычный (тиыны)</Label>
                              <Input
                                  inputMode="numeric"
                                  type="number"
                                  className="mt-1"
                                  value={regular}
                                  onChange={(e) => setRegular(slug, e.target.value)}
                                  placeholder="600000"
                              />
                            </div>

                            <div>
                              <Label className="text-sm">Пробный (тиыны)</Label>
                              <Input
                                  inputMode="numeric"
                                  type="number"
                                  className="mt-1"
                                  value={trial}
                                  onChange={(e) => setTrial(slug, e.target.value)}
                                  placeholder="300000"
                              />
                            </div>

                            <div className="flex items-end">
                              <Button variant="ghost" className="text-red-500" onClick={() => removeSubject(slug)}>
                                Удалить
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                  )
                })
            )}
            <p className="text-xs text-muted-foreground">
              Валюта: <span className="font-medium">KZT</span>. 1 тенге = 100 тиынов.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={handleNext} className="w-full max-w-md" disabled={isLoading || form.subjects.items.length === 0 || !hasAnyPrice}>
            {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Сохранение...
                </>
            ) : (
                "Продолжить"
            )}
          </Button>
        </div>
      </div>
  )

  const Step3Profile = () => {
    const bioMax = 500
    const valid = form.headline.trim().length > 0 && form.bio.trim().length > 0

    return (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Почти закончили!
            <br />
            Заполните описание профиля
          </h1>

          <div className="space-y-6">
            {/* Заголовок-подпись (headline) */}
            <div>
              <Label htmlFor="headline">Короткий заголовок</Label>
              <Input
                  id="headline"
                  placeholder="Опытный преподаватель математики"
                  className="mt-2"
                  value={form.headline}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  required
              />
              <p className="text-xs text-muted-foreground mt-1">Отображается в карточке репетитора</p>
            </div>

            {/* Опыт (годы) */}
            <div>
              <Label htmlFor="years">Опыт преподавания (лет)</Label>
              <Input
                  id="years"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={60}
                  className="mt-2"
                  value={Number.isFinite(form.yearsExperience) ? form.yearsExperience : 0}
                  onChange={(e) =>
                      setForm({
                        ...form,
                        yearsExperience: Math.max(0, Math.min(60, Number.parseInt(e.target.value || "0", 10) || 0)),
                      })
                  }
              />
            </div>

            {/* Биография (bio) */}
            <div>
              <Label htmlFor="bio">О себе</Label>
              <Textarea
                  id="bio"
                  placeholder="Готовлю к ЕНТ и олимпиадам. Индивидуальный подход."
                  className="mt-2 min-h-[140px] resize-none"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  maxLength={bioMax}
                  required
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>Опишите методику, сильные стороны, формат занятий.</span>
                <span>
              {form.bio.length}/{bioMax}
            </span>
              </div>
            </div>

            {/* Памятка */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">i</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-2">Что можно указать:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ваш подход к преподаванию</li>
                    <li>• Кого готовите (ЕНТ, олимпиады, IELTS и т.д.)</li>
                    <li>• Формат и длительность занятий</li>
                    <li>• Результаты учеников</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Кнопка */}
          <div className="mt-8 text-center">
            <Button onClick={handleNext} className="w-full max-w-md" disabled={isLoading || !valid}>
              {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Сохранение...
                  </>
              ) : (
                  "Продолжить"
              )}
            </Button>
          </div>
        </div>
    )
  }


  const Step4Video = () => (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Загрузите видео-приветствие</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Label className="mb-4 block">Загрузите видео-приветствие</Label>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-[9/16] max-w-sm mx-auto">
              <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202025-08-15%20%D0%B2%204.19.39%E2%80%AFPM-cemqbToEC7Vie1yH9UZQK7xfQs5H4U.png"
                  alt="Video example"
                  className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/50 rounded-lg p-2 text-white text-sm">
                  <p className="font-medium">МАТЕМАТИКУ</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground mb-2">
                Максимальный размер файла — 200&nbsp;МБ, форматы mp4, mov
              </p>
              <Button className="mt-4">Выберите файлы</Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mt-6">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">i</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-2">Требования к видео</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Продолжительность 30 сек – 1,5 мин</li>
                    <li>• Вертикальный формат</li>
                    <li>• Стабильная поверхность для записи</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button onClick={handleNext} className="w-full max-w-md">
            Сохранить и продолжить
          </Button>

          <Button
              variant="ghost"
              onClick={handleSkip}
              className="w-full max-w-md text-muted-foreground"
          >
            Пропустить этот шаг
          </Button>

          <p className="text-xs text-muted-foreground">
            Шаг необязательный — видео можно добавить позже.
          </p>
        </div>

      </div>
  )

  const Step5Schedule = () => (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Добавьте ваше расписание</h1>

        <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-600"/>
          <span className="text-sm text-blue-800">У вас подключен Google Calendar</span>
        </div>

        <div className="space-y-4">
          <Label className="text-lg">Расписание</Label>
          {form.schedule.map((day) => (
              <div key={day.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Switch
                      checked={day.enabled}
                      onCheckedChange={(checked) =>
                          setForm((prev) => ({ ...prev, schedule: prev.schedule.map((d) => (d.id === day.id ? { ...d, enabled: checked } : d)) }))
                      }
                  />
                  <span className="font-medium">{day.name}</span>
                </div>

                {day.enabled ? (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Input type="time" value={day.startTime} className="w-24" onChange={(e) =>
                            setForm((prev) => ({ ...prev, schedule: prev.schedule.map((d) => (d.id === day.id ? { ...d, startTime: e.target.value } : d)) }))
                        }/>
                        <span className="text-muted-foreground">до</span>
                        <Input type="time" value={day.endTime} className="w-24" onChange={(e) =>
                            setForm((prev) => ({ ...prev, schedule: prev.schedule.map((d) => (d.id === day.id ? { ...d, endTime: e.target.value } : d)) }))
                        }/>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-4">
                      <span className="text-muted-foreground">Нет расписания</span>
                      <Button variant="ghost" size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                )}
              </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button onClick={handleNext} className="w-full max-w-md">
            Продолжить
          </Button>
        </div>
      </div>
  )

  const Step6Done = () => (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">
          Вы заполнили профиль для
          <br />
          модерации
        </h1>

        <div className="my-12">
          <div className="w-48 h-48 mx-auto mb-8">
            <img src="/purple-character-waving.png" alt="Success character" className="w-full h-full" />
          </div>

          <p className="text-muted-foreground mb-8">
            В течение 5 рабочих дней поступит SMS на ваш номер телефона
            <br />с обновлённым статусом вашего профиля.
          </p>

          <p className="text-muted-foreground mb-6">Остались вопросы? Мы всегда на связи!</p>

          <div className="flex justify-center space-x-4">
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              Написать на WhatsApp
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Send className="w-4 h-4 mr-2" />
              Telegram канал
            </Button>
          </div>
        </div>
      </div>
  )

  /* ──────────────────────────────────────────────────────────────────────────
    LAYOUT WRAPPER
  ─────────────────────────────────────────────────────────────────────────── */
  const ProgressBar = () => (
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => {
          const active = currentStep === step.id
          const done = completedSteps.includes(step.id) || currentStep > step.id
          return (
              <div key={step.id} className="flex items-center">
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        done ? "bg-green-500 text-white" : active ? "bg-primary text-primary-foreground" : "bg-gray-200 text-gray-500"
                    }`}
                >
                  {done ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span className={`ml-2 text-sm ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step.title}</span>
                {index < steps.length - 1 && <div className={`w-12 h-0.5 mx-4 ${done ? "bg-green-500" : "bg-gray-200"}`} />}
              </div>
          )
        })}
      </div>
  )

  return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-foreground font-serif">Alem</span>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Globe className="w-4 h-4 mr-2" />
              Русский
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/user-profile-illustration.png" />
              <AvatarFallback>А</AvatarFallback>
            </Avatar>
            <Bell className="w-5 h-5 text-muted-foreground" />
          </div>
        </header>

        {/* Progress */}
        <div className="py-6">
          <ProgressBar />
        </div>

        {/* Back */}
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <Button variant="ghost" onClick={handleBack} className="text-primary">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 pb-12">
          {currentStep === 1 && <Step1About />}
          {currentStep === 2 && <Step2Subjects />}
          {currentStep === 3 && <Step3Profile />}
          {currentStep === 4 && <Step4Video />}
          {currentStep === 5 && <Step5Schedule />}
          {currentStep === 6 && <Step6Done />}
        </div>

        {/* Next button for steps which не рисуют свою */}
        {/* (Step1/Step2 уже рисуют кнопку сами, остальные — ниже можем тоже рисовать при желании) */}
      </div>
  )
}
