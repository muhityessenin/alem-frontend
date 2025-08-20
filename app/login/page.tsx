"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const success = await login(email, password)
    if (success) {
      router.push("/welcome")
    } else {
      setError("Неверный email или пароль")
    }
    setIsLoading(false)
  }

  return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
        <div className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4">
          <Card className="w-full border-muted shadow-sm">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold">
                  A
                </div>
                <span className="text-sm text-muted-foreground">Войдите в аккаунт</span>
              </div>
              <CardTitle className="text-2xl">Alem</CardTitle>
              <CardDescription>Продолжите с электронной почтой и паролем</CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                  <div
                      role="alert"
                      aria-live="polite"
                      className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                  >
                    {error}
                  </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Электронная почта</Label>
                  <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Введите пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        aria-invalid={!!error}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-2 grid place-items-center px-2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                        tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Входим…
                  </span>
                  ) : (
                      "Войти"
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Нет аккаунта?{" "}
                  <Link href="/register" className="font-medium text-primary hover:underline">
                    Зарегистрироваться
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 max-w-sm text-center text-xs text-muted-foreground">
            Продолжая, вы принимаете Политику конфиденциальности и Условия сервиса.
          </p>
        </div>
      </div>
  )
}
