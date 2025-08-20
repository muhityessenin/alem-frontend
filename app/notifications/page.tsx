import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { NotificationsInterface } from "@/components/notifications/notifications-interface"

export default function NotificationsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <NotificationsInterface />
      </div>
    </div>
  )
}
