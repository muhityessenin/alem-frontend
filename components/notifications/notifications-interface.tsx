"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, CheckCircle, Clock, Calendar } from "lucide-react"

const notifications = [
  {
    id: "1",
    type: "feedback",
    title: "Репетитор оставил вам обратную связь",
    message: "",
    time: "9 августа, 2025",
    read: true,
    avatar: "/tutor-gulyara.png",
    icon: CheckCircle,
  },
  {
    id: "2",
    type: "lesson",
    title: 'Через 10 минут начнётся урок. Перейдите в раздел "Мои уроки", чтобы присоединиться вовремя.',
    message: "",
    time: "9 августа, 2025",
    read: true,
    avatar: "/tutor-gulyara.png",
    icon: Clock,
  },
  {
    id: "3",
    type: "lesson",
    title: "Ваш урок оплачен. Удачного обучения!",
    message: "",
    time: "9 августа, 2025",
    read: true,
    avatar: "/tutor-gulyara.png",
    icon: CheckCircle,
  },
  {
    id: "4",
    type: "lesson",
    title: "Ваш урок с Gulyara A подтверждён на 9 августа 20:30.",
    message: "",
    time: "9 августа, 2025",
    read: true,
    avatar: "/tutor-gulyara.png",
    icon: Calendar,
  },
  {
    id: "5",
    type: "account",
    title: "Аккаунт репетитора создан. Заполните профиль, чтобы начать.",
    message: "",
    time: "7 августа, 2025",
    read: true,
    icon: CheckCircle,
  },
  {
    id: "6",
    type: "account",
    title: "Аккаунт успешно создан. Начните поиск репетитора.",
    message: "",
    time: "7 августа, 2025",
    read: true,
    icon: CheckCircle,
  },
]

export function NotificationsInterface() {
  return (
    <main className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground font-serif">Уведомления</h1>
          <Button variant="outline" size="sm">
            Отметить всё как прочитанное
          </Button>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Avatar or Icon */}
                  <div className="flex-shrink-0">
                    {notification.avatar ? (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={notification.avatar || "/placeholder.svg"} />
                        <AvatarFallback>GA</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <notification.icon className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{notification.title}</p>
                    {notification.message && (
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    {notification.read && (
                      <Badge variant="secondary" className="text-xs">
                        Прочитано
                      </Badge>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
