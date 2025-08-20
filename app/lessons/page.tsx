import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { LessonsInterface } from "@/components/lessons/lessons-interface"

export default function LessonsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <LessonsInterface />
      </div>
    </div>
  )
}
