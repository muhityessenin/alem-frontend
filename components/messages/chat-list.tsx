"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface Chat {
  id: string
  name: string
  lastMessage: string
  time: string
  avatar?: string
  unread?: number
  isActive: boolean
}

const mockChats: Chat[] = [
  {
    id: "1",
    name: "Gulyara A",
    lastMessage: "Здравствуйте! Спасибо, что...",
    time: "23:22",
    avatar: "/tutor-gulyara.png",
    isActive: true,
  },
  {
    id: "2",
    name: "Алексей К",
    lastMessage: "Урок завтра в 15:00",
    time: "19:45",
    avatar: "/tutor-alexey.png",
    unread: 2,
    isActive: true,
  },
  {
    id: "3",
    name: "Жанар М",
    lastMessage: "Отлично! До встречи",
    time: "Вчера",
    avatar: "/tutor-zhanar.png",
    isActive: false,
  },
]

interface ChatListProps {
  selectedChat: string | null
  onSelectChat: (chatId: string) => void
}

export function ChatList({ selectedChat, onSelectChat }: ChatListProps) {
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = mockChats.filter((chat) => {
    const matchesTab = activeTab === "active" ? chat.isActive : !chat.isActive
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground mb-4">Сообщения</h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          <Button
            variant={activeTab === "active" ? "default" : "ghost"}
            size="sm"
            className="flex-1 text-sm"
            onClick={() => setActiveTab("active")}
          >
            Активные чаты
          </Button>
          <Button
            variant={activeTab === "archived" ? "default" : "ghost"}
            size="sm"
            className="flex-1 text-sm"
            onClick={() => setActiveTab("archived")}
          >
            Архивные чаты
          </Button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {activeTab === "active" ? "Нет активных чатов" : "Нет архивных чатов"}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={cn(
                  "w-full p-3 rounded-lg text-left hover:bg-muted transition-colors",
                  selectedChat === chat.id && "bg-muted",
                )}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={chat.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground truncate">{chat.name}</p>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                      {chat.unread && (
                        <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {chat.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
