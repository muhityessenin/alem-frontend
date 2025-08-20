"use client"

import { ProfileTabs } from "./profile-tabs"
import { ProfileForm } from "./profile-form"

export function ProfileInterface() {
  return (
    <main className="flex-1 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground font-serif">Мой профиль</h1>
        <ProfileTabs />
        <ProfileForm />
      </div>
    </main>
  )
}
