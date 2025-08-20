"use client"

import { useState } from "react"
import { ChatList } from "./chat-list"
import { EmptyChatState } from "./empty-chat-state"
import { ChatWindow } from "./chat-window"

export function MessagesInterface() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

  return (
    <div className="flex-1 flex">
      <ChatList selectedChat={selectedChat} onSelectChat={setSelectedChat} />
      <div className="flex-1">{selectedChat ? <ChatWindow chatId={selectedChat} /> : <EmptyChatState />}</div>
    </div>
  )
}
