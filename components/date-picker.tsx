"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DatePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
}

export function DatePicker({ date, setDate }: DatePickerProps) {
  const [displayMonth, setDisplayMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const daysInMonth = getDaysInMonth(displayMonth)
  const firstDay = getFirstDayOfMonth(displayMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const handlePrevMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1))
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day)
    setDate(newDate)
  }

  const monthName = displayMonth.toLocaleString("default", { month: "long", year: "numeric" })

  return (
    <div className="bg-background border border-border rounded-lg p-4">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-1 hover:bg-muted rounded transition">
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-semibold text-foreground">{monthName}</h3>
        <button onClick={handleNextMonth} className="p-1 hover:bg-muted rounded transition">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const isSelected = date?.getDate() === day && date?.getMonth() === displayMonth.getMonth()
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`py-1 rounded text-sm font-medium transition ${
                isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>

      {date && (
        <div className="mt-4 pt-4 border-t border-border text-sm text-foreground">
          Selected: {date.toLocaleDateString()}
        </div>
      )}
    </div>
  )
}
