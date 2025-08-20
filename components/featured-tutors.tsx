"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Play, MessageCircle, Heart } from "lucide-react"

const featuredTutors = [
  {
    id: 1,
    name: "Жанар М",
    subject: "Английский язык",
    languages: ["Eng", "Рус", "Каз"],
    price: 7000,
    rating: 4.9,
    reviews: 127,
    verified: true,
    image: "/female-english-teacher.png",
    videoPreview: true,
  },
  {
    id: 2,
    name: "Алексей К",
    subject: "Математика",
    languages: ["Рус", "Eng"],
    price: 8500,
    rating: 4.8,
    reviews: 89,
    verified: true,
    image: "/male-mathematics-teacher.png",
    videoPreview: false,
  },
  {
    id: 3,
    name: "Айгуль С",
    subject: "Физика",
    languages: ["Каз", "Рус"],
    price: 6500,
    rating: 4.9,
    reviews: 156,
    verified: true,
    image: "/female-physics-teacher.png",
    videoPreview: true,
  },
]

export function FeaturedTutors() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground font-serif">Рекомендуемые репетиторы</h2>
        <Button variant="outline">Посмотреть всех</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredTutors.map((tutor) => (
          <Card key={tutor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="aspect-video bg-muted relative overflow-hidden">
                <img src={tutor.image || "/placeholder.svg"} alt={tutor.name} className="w-full h-full object-cover" />
                {tutor.videoPreview && (
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <Button size="icon" className="rounded-full bg-white bg-opacity-90 hover:bg-opacity-100">
                      <Play className="h-5 w-5 text-primary ml-1" />
                    </Button>
                  </div>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-foreground">{tutor.name}</h3>
                    {tutor.verified && (
                      <Badge variant="secondary" className="text-xs">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{tutor.subject}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">от {tutor.price.toLocaleString()} ₸</p>
                  <p className="text-xs text-muted-foreground">за урок</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{tutor.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({tutor.reviews} отзывов)</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Языки:</span>
                <div className="flex space-x-1">
                  {tutor.languages.map((lang) => (
                    <Badge key={lang} variant="outline" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button className="flex-1">Записаться на урок</Button>
                <Button variant="outline" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
