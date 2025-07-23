"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Trash2, Loader2, Calendar, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useGetBookingsQuery, useUpdateBookingStatusMutation } from "@/redux/api/bookingApi"


const HOURS = Array.from({ length: 14 }, (_, i) => i + 8) // 8 AM to 9 PM
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Type definitions
interface Booking {
  id: string
  resourceId: string
  startTime: string
  endTime: string
  requestedBy: string
  status: string
  createdAt: string
  updatedAt: string
  resource: {
    id: string
    name: string
    createdAt: string
    updatedAt: string
  }
}

export function CalendarPage() {
  const { data: bookingsResponse, isLoading, error } = useGetBookingsQuery({})
   const [updateBookingStatus, { isLoading: isCanceling }] = useUpdateBookingStatusMutation()
  const [currentWeek, setCurrentWeek] = useState(new Date())

  // Extract bookings array from API response
  const bookings: Booking[] = bookingsResponse?.data || []

  // Get the start of the current week (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  const weekStart = getWeekStart(currentWeek)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    return day
  })

  // Filter bookings for current week
  const weekBookings = useMemo(() => {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.startTime)
      return bookingDate >= weekStart && bookingDate < weekEnd
    })
  }, [bookings, weekStart])

  // Group bookings by day and hour
  const bookingsByDayAndHour = useMemo(() => {
    const grouped: Record<string, Record<number, Booking[]>> = {}
    weekDays.forEach((day) => {
      const dayKey = day.toDateString()
      grouped[dayKey] = {}
      HOURS.forEach((hour) => {
        grouped[dayKey][hour] = weekBookings.filter((booking) => {
          const bookingDate = new Date(booking.startTime)
          const bookingStartHour = bookingDate.getHours()
          const bookingEndHour = new Date(booking.endTime).getHours()
          return bookingDate.toDateString() === dayKey && bookingStartHour <= hour && bookingEndHour > hour
        })
      })
    })
    return grouped
  }, [weekBookings, weekDays])

  // Group bookings by day for mobile view
  const bookingsByDay = useMemo(() => {
    const grouped: Record<string, Booking[]> = {}
    weekDays.forEach((day) => {
      const dayKey = day.toDateString()
      grouped[dayKey] = weekBookings.filter((booking) => {
        const bookingDate = new Date(booking.startTime)
        return bookingDate.toDateString() === dayKey
      })
    })
    return grouped
  }, [weekBookings, weekDays])

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const formatWeekRange = () => {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    return `${weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${weekEnd.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getBookingStatus = (startTime: string, endTime: string) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)
    if (now > end) return "past"
    if (now >= start && now <= end) return "ongoing"
    return "upcoming"
  }

  const handleDelete = async (bookingId: string) => {
    try {
      await updateBookingStatus({id:bookingId, status: { status: "cancelled" } }).unwrap()
    } catch (error) {
      console.error("Failed to delete booking:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-black mb-2">Loading Calendar</h3>
            <p className="text-gray-600">Preparing your weekly view...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-white border-2 border-red-500">
        <AlertDescription className="text-red-700">Failed to load calendar. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-black bg-white shadow-lg">
        <CardHeader className="bg-black text-white rounded-t-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-lg">
                <Calendar className="h-6 w-6 text-black" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">Weekly Calendar</CardTitle>
                <p className="text-gray-300 font-medium mt-1">{formatWeekRange()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek("prev")}
                className="bg-white text-black border-white hover:bg-gray-100 font-medium"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(new Date())}
                className="bg-white text-black border-white hover:bg-gray-100 font-medium"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek("next")}
                className="bg-white text-black border-white hover:bg-gray-100 font-medium"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {/* Desktop Calendar View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                {/* Header Row */}
                <div className="grid grid-cols-8 border-b-2 border-black">
                  <div className="p-4 text-center font-bold text-black bg-gray-100 border-r border-black">
                    <Clock className="h-4 w-4 mx-auto mb-1" />
                    Time
                  </div>
                  {weekDays.map((day, index) => (
                    <div
                      key={day.toDateString()}
                      className={`p-4 text-center font-bold border-r border-black transition-all ${
                        isToday(day) ? "bg-black text-white" : "bg-gray-100 text-black hover:bg-gray-200"
                      }`}
                    >
                      <div className="text-sm font-medium">{DAYS[index]}</div>
                      <div className="text-xl font-bold mt-1">{day.getDate()}</div>
                    </div>
                  ))}
                </div>
                {/* Time Slots */}
                {HOURS.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b border-gray-300 min-h-[100px]">
                    {/* Time Column */}
                    <div className="p-4 text-center font-bold text-black bg-gray-50 border-r border-black flex items-center justify-center">
                      <div className="text-sm">
                        {hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                      </div>
                    </div>
                    {/* Day Columns */}
                    {weekDays.map((day) => {
                      const dayKey = day.toDateString()
                      const hourBookings = bookingsByDayAndHour[dayKey]?.[hour] || []
                      return (
                        <div
                          key={`${dayKey}-${hour}`}
                          className={`relative p-2 border-r border-gray-300 min-h-[100px] transition-all ${
                            isToday(day) ? "bg-gray-50" : "bg-white hover:bg-gray-50"
                          }`}
                        >
                          {hourBookings.map((booking) => {
                            const status = getBookingStatus(booking.startTime, booking.endTime)
                            return (
                              <div
                                key={booking.id}
                                className={`group relative mb-2 p-3 rounded-lg border-2 transition-all hover:scale-105 hover:shadow-lg ${
                                  status === "past"
                                    ? "bg-gray-200 border-gray-400 text-gray-700"
                                    : status === "ongoing"
                                      ? "bg-black text-white border-black animate-pulse"
                                      : "bg-white border-black text-black hover:bg-gray-100"
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="font-bold text-sm truncate">{booking.resource.name}</div>
                                  <div className="text-xs font-medium truncate">{booking.requestedBy}</div>
                                  <div className="text-xs">
                                    {new Date(booking.startTime).toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                  <Badge
                                    className={`text-xs font-bold px-2 py-1 ${
                                      status === "past"
                                        ? "bg-gray-500 text-white"
                                        : status === "ongoing"
                                          ? "bg-white text-black"
                                          : "bg-black text-white"
                                    }`}
                                  >
                                    {status === "ongoing" ? "● LIVE" : status.toUpperCase()}
                                  </Badge>
                                </div>
                                {/* Delete Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(booking.id)}
                                  disabled={isCanceling}
                                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all bg-red-500 hover:bg-red-600 text-white rounded-full"
                                >
                                  {isCanceling ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden space-y-4 p-4">
            {weekDays.map((day, index) => {
              const dayKey = day.toDateString()
              const dayBookings = bookingsByDay[dayKey] || []
              return (
                <Card
                  key={dayKey}
                  className={`border-2 bg-white ${isToday(day) ? "border-black border-l-8" : "border-gray-300"}`}
                >
                  <CardHeader
                    className={`${isToday(day) ? "bg-black text-white" : "bg-gray-100 text-black"} rounded-t-lg`}
                  >
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {FULL_DAYS[index]}, {day.getDate()}
                        {isToday(day) && <span className="text-xl">●</span>}
                      </span>
                      <Badge
                        variant="outline"
                        className={`${isToday(day) ? "text-white border-white" : "text-black border-black"}`}
                      >
                        {dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 bg-white">
                    {dayBookings.length === 0 ? (
                      <p className="text-center text-gray-500 py-6">No bookings for this day</p>
                    ) : (
                      dayBookings.map((booking) => {
                        const status = getBookingStatus(booking.startTime, booking.endTime)
                        return (
                          <div
                            key={booking.id}
                            className={`group p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                              status === "past"
                                ? "bg-gray-100 border-gray-400 text-gray-700"
                                : status === "ongoing"
                                  ? "bg-black text-white border-black"
                                  : "bg-white border-black text-black hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-2">
                                <div className="font-bold">{booking.resource.name}</div>
                                <div className="text-sm">
                                  {new Date(booking.startTime).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  -{" "}
                                  {new Date(booking.endTime).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                <div className="text-sm font-medium">{booking.requestedBy}</div>
                                <Badge
                                  className={`text-xs font-bold ${
                                    status === "past"
                                      ? "bg-gray-500 text-white"
                                      : status === "ongoing"
                                        ? "bg-white text-black"
                                        : "bg-black text-white"
                                  }`}
                                >
                                  {status === "ongoing" ? "● LIVE" : status.toUpperCase()}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(booking.id)}
                                disabled={isCanceling}
                                className="opacity-0 group-hover:opacity-100 transition-all bg-red-500 hover:bg-red-600 text-white rounded-full"
                              >
                                {isCanceling ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CalendarPage
