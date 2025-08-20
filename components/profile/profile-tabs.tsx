"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "about", label: "О себе" },
  { id: "purchases", label: "История покупок" },
  { id: "calendar", label: "Календарь" },
  { id: "referral", label: "Реферальная система" },
]

export function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("about")

  return (
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
  )
}
