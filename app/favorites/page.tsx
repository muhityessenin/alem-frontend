import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { EmptyState } from "@/components/empty-state"

export default function FavoritesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-foreground font-serif mb-6">Избранные</h1>
            <EmptyState
              title="У вас нет избранных"
              description="Добавляйте репетиторов в избранное, чтобы быстро находить их позже"
              actionLabel="Найти репетиторов"
              actionHref="/"
            />
          </div>
        </main>
      </div>
    </div>
  )
}
