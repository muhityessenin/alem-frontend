"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload } from "lucide-react"

export function ProfilePhotoUpload() {
  const [profileImage, setProfileImage] = useState("/user-profile-illustration.png")

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="text-center space-y-4">
          <h3 className="font-semibold text-foreground">Фото профиля</h3>

          <div className="flex justify-center">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profileImage || "/placeholder.svg"} />
              <AvatarFallback>МЮ</AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-2">
            <label htmlFor="photo-upload">
              <Button variant="outline" className="w-full cursor-pointer bg-transparent" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Выбрать фото
                </span>
              </Button>
            </label>
            <input id="photo-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <p className="text-xs text-muted-foreground">Максимальный размер файла 2mb, формат png, jpeg</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
