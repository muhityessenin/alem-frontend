"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Home,
  BookOpen,
  MessageCircle,
  Heart,
  Bell,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

const navigation = [
  { name: "Главная", href: "/", icon: Home },
  { name: "Мои уроки", href: "/lessons", icon: BookOpen },
  { name: "Сообщения", href: "/messages", icon: MessageCircle },
  { name: "Избранные", href: "/favorites", icon: Heart },
  { name: "Уведомления", href: "/notifications", icon: Bell },
] as const

const LS_KEY = "sidebar:collapsed"

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  // ── Mobile drawer state ──────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false)

  // ── Desktop collapse state (persisted) ───────────────────────────────────────
  const [isCollapsed, setIsCollapsed] = useState(false)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved === "1") setIsCollapsed(true)
    } catch {}
  }, [])
  const toggleCollapsed = () => {
    setIsCollapsed((v) => {
      const next = !v
      try {
        localStorage.setItem(LS_KEY, next ? "1" : "0")
      } catch {}
      return next
    })
  }

  const displayName = useMemo(() => {
    const fn = user?.firstName?.trim() || ""
    const ln = user?.lastName?.trim() || ""
    const full = `${fn} ${ln}`.trim()
    return full || "Гость"
  }, [user])

  const initials = useMemo(() => {
    const f = user?.firstName?.[0] ?? ""
    const l = user?.lastName?.[0] ?? ""
    const val = `${f}${l}`.toUpperCase()
    return val || "??"
  }, [user])

  return (
      <>
        {/* Mobile menu button */}
        <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden"
            onClick={() => setIsOpen((o) => !o)}
            aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        <TooltipProvider delayDuration={300}>
          {/* Sidebar */}
          <aside
              className={cn(
                  "fixed inset-y-0 left-0 z-40 bg-sidebar border-r border-sidebar-border transform transition-all duration-200 ease-in-out md:translate-x-0 md:static md:inset-0",
                  // ширина на десктопе зависит от collapsed
                  isCollapsed ? "md:w-20" : "md:w-64",
                  // мобильное скрытие/показ
                  isOpen ? "w-64 translate-x-0" : "-translate-x-full w-64 md:translate-x-0",
              )}
              aria-label="Боковое меню"
          >
            <div className="flex h-full flex-col">
              {/* Logo + collapse button */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                  <div className="w-8 h-8 bg-primary rounded-lg grid place-items-center">
                    <span className="text-primary-foreground font-bold text-lg">A</span>
                  </div>
                  {!isCollapsed && (
                      <span className="text-xl font-bold text-sidebar-foreground font-serif">Alem</span>
                  )}
                </Link>
                {/* Кнопка сворачивания — только на десктопе */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:inline-flex"
                    onClick={toggleCollapsed}
                    aria-label={isCollapsed ? "Развернуть сайдбар" : "Свернуть сайдбар"}
                    title={isCollapsed ? "Развернуть" : "Свернуть"}
                >
                  {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  const ItemIcon = item.icon
                  const linkClasses = cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isCollapsed && "justify-center",
                  )

                  const content = (
                      <Link
                          key={item.name}
                          href={item.href}
                          className={linkClasses}
                          onClick={() => setIsOpen(false)}
                      >
                        <ItemIcon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </Link>
                  )

                  return isCollapsed ? (
                      <Tooltip key={item.name}>
                        <TooltipTrigger asChild>{content}</TooltipTrigger>
                        <TooltipContent side="right">{item.name}</TooltipContent>
                      </Tooltip>
                  ) : (
                      content
                  )
                })}
              </nav>

              {/* Profile */}
              <div className="p-3 border-t border-sidebar-border">
                <Link
                    href="/profile"
                    className={cn(
                        "flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors",
                        isCollapsed && "justify-center",
                    )}
                    onClick={() => setIsOpen(false)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/user-profile-illustration.png" alt={displayName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">Профиль</p>
                      </div>
                  )}
                </Link>
              </div>
            </div>
          </aside>
        </TooltipProvider>

        {/* Overlay for mobile */}
        {isOpen && (
            <div
                className="fixed inset-0 bg-black/50 z-30 md:hidden"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />
        )}
      </>
  )
}
