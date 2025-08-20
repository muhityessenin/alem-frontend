import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { MessagesInterface } from "@/components/messages/messages-interface"

export default function MessagesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <MessagesInterface />
      </div>
    </div>
  )
}
