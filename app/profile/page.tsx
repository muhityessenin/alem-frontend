import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ProfileInterface } from "@/components/profile/profile-interface"

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <ProfileInterface />
      </div>
    </div>
  )
}
