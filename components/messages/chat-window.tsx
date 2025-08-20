"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Phone, Video, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  timestamp: string
  isOwn: boolean
  avatar?: string
}

const mockMessages: Message[] = [
  {
    id: "1",
    content:
      "Здравствуйте! Спасибо за выбор меня в качестве репетитора. Готова помочь вам с изучением английского языка!",
    timestamp: "23:20",
    isOwn: false,
    avatar: "/tutor-gulyara.png",
  },
  {
    id: "2",
    content: "Здравствуйте! Очень рад начать занятия. Когда можем провести первый урок?",
    timestamp: "23:21",
    isOwn: true,
  },
  {
    id: "3",
    content: "Отлично! Предлагаю завтра в 18:00. Вам подходит это время?",
    timestamp: "23:22",
    isOwn: false,
    avatar: "/tutor-gulyara.png",
  },
]

interface ChatWindowProps {
  chatId: string
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const [message, setMessage] = useState("")

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage("")
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/tutor-gulyara.png" />
            <AvatarFallback>GA</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">Gulyara A</h3>
            <p className="text-sm text-muted-foreground">Английский язык</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mockMessages.map((msg) => (
          <div key={msg.id} className={cn("flex space-x-3", msg.isOwn && "flex-row-reverse space-x-reverse")}>
            {!msg.isOwn && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={msg.avatar || "/placeholder.svg"} />
                <AvatarFallback>GA</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                msg.isOwn ? "bg-primary text-primary-foreground ml-auto" : "bg-muted text-foreground",
              )}
            >
              <p className="text-sm">{msg.content}</p>
              <p className={cn("text-xs mt-1", msg.isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Напишите сообщение..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
