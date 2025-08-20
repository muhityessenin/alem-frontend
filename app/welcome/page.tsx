"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Globe, Bell, Wallet } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function WelcomePage() {
  const router = useRouter()

  const handleBecomeTeacher = () => {
    router.push("/become-tutor")
  }

  const handleFindTeacher = () => {
    // Navigate to main app
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-foreground font-serif">Alem</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Globe className="w-4 h-4 mr-2" />
            Русский
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Wallet className="w-4 h-4 mr-2" />
            Баланс
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/user-profile-illustration.png" />
            <AvatarFallback>МЮ</AvatarFallback>
          </Avatar>
          <Bell className="w-5 h-5 text-muted-foreground" />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Button variant="ghost" className="mb-8 text-primary">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        {/* Welcome Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Добро пожаловать в Alem!</h1>
          <p className="text-xl text-muted-foreground">Что привело вас к нам?</p>
        </div>

        {/* Options */}
        <div className="grid gap-6 max-w-2xl mx-auto">
          {/* Become a Teacher */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20"
            onClick={handleBecomeTeacher}
          >
            <CardContent className="flex items-center p-6">
              <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mr-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">📚</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">Стать репетитором</h3>
                <p className="text-muted-foreground">Удобное расписание</p>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </CardContent>
          </Card>

          {/* Find a Teacher */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20"
            onClick={handleFindTeacher}
          >
            <CardContent className="flex items-center p-6">
              <div className="w-16 h-16 bg-purple-400 rounded-2xl flex items-center justify-center mr-6">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">🔍</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">Найти репетитора</h3>
                <p className="text-muted-foreground">Проверенные репетиторы с огромным опытом</p>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
