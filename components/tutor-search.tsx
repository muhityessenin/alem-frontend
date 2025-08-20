"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

export function TutorSearch() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground font-serif">Найдите идеального репетитора</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Изучайте языки, математику, науки и многое другое с квалифицированными преподавателями
        </p>
      </div>

      {/* Search Card */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Subject Selection */}
            <div className="flex-1">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите предмет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">Английский язык</SelectItem>
                  <SelectItem value="russian">Русский язык</SelectItem>
                  <SelectItem value="kazakh">Казахский язык</SelectItem>
                  <SelectItem value="math">Математика</SelectItem>
                  <SelectItem value="physics">Физика</SelectItem>
                  <SelectItem value="chemistry">Химия</SelectItem>
                  <SelectItem value="biology">Биология</SelectItem>
                  <SelectItem value="history">История</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск по имени или специализации..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="flex-1">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Цена за урок" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-5000">до 5 000 ₸</SelectItem>
                  <SelectItem value="5000-10000">5 000 - 10 000 ₸</SelectItem>
                  <SelectItem value="10000-15000">10 000 - 15 000 ₸</SelectItem>
                  <SelectItem value="15000+">от 15 000 ₸</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <Button className="md:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Найти
            </Button>

            {/* Filter Button */}
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
