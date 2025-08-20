"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "all", label: "Все Уроки" },
  { id: "archive", label: "Архив" },
  { id: "calendar", label: "Календарь" },
]

export function LessonsInterface() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <main className="flex-1 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground font-serif">Мои уроки</h1>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={cn(
                  "px-0 py-3 border-b-2 border-transparent hover:border-border rounded-none",
                  activeTab === tab.id && "border-primary text-primary hover:border-primary",
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <EmptyState
          title="У вас пока нет уроков"
          description="Найдите репетитора и запишитесь на первый урок"
          actionLabel="Перейти к выбору репетитора"
          actionHref="/"
        />
      </div>
    </main>
  )
}
