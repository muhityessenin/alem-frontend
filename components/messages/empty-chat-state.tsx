import { Button } from "@/components/ui/button"

export function EmptyChatState() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-64 h-64 mx-auto">
          <img src="/chat-illustration.png" alt="Начните новый диалог" className="w-full h-full object-contain" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Начните новый диалог</h2>
          <p className="text-muted-foreground">
            Сообщения, отправленные после подключения с учеником/наставником, появятся здесь
          </p>
        </div>

        <Button className="w-full max-w-xs">Перейти к выбору репетитора</Button>
      </div>
    </div>
  )
}
