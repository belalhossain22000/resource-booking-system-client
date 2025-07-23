"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Trash2, Loader2, Calendar, Clock, MapPin, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useGetBookingsQuery, useUpdateBookingStatusMutation } from "@/redux/api/bookingApi"

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8) // 8 AM to 9 PM
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Type definitions
interface Resource {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

interface Booking {
  id: string
  resourceId: string
  startTime: string
  endTime: string
  requestedBy: string
  status: string
  createdAt: string
  updatedAt: string
  resource: Resource
}

interface BookingsResponse {
  success: boolean
  message: string
  data: {
    [resourceName: string]: Booking[]
  }
}

export function CalendarPage() {
  const {
    data: bookingsResponse,
    isLoading,
    error,
  } = useGetBookingsQuery({}) as {
    data: BookingsResponse | undefined
    isLoading: boolean
    error: any
  }

  const [updateBookingStatus, { isLoading: isCanceling }] = useUpdateBookingStatusMutation()
  const [currentWeek, setCurrentWeek] = useState(new Date())

  // Extract and flatten bookings array from API response
  const bookings: Booking[] = useMemo(() => {
    if (!bookingsResponse?.data) return []
    const allBookings: Booking[] = []
    Object.values(bookingsResponse?.data || {}).forEach((resourceBookings) => {
      allBookings.push(...(resourceBookings || []))
    })
    return allBookings
  }, [bookingsResponse])

  // Set initial week to show the first booking if available
  useEffect(() => {
    if (bookings?.length > 0 && bookings[0]?.startTime) {
      const firstBookingDate = new Date(bookings[0].startTime)
      setCurrentWeek(firstBookingDate)
    }
  }, [bookings])

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
    return (
      bookings?.filter((booking) => {
        const bookingDate = new Date(booking?.startTime || "")
        return bookingDate >= weekStart && bookingDate < weekEnd
      }) || []
    )
  }, [bookings, weekStart])

  // Group bookings by day and hour
  const bookingsByDayAndHour = useMemo(() => {
    const grouped: Record<string, Record<number, Booking[]>> = {}
    weekDays.forEach((day) => {
      const dayKey = day.toDateString()
      grouped[dayKey] = {}
      HOURS.forEach((hour) => {
        grouped[dayKey][hour] = weekBookings.filter((booking) => {
          const bookingDate = new Date(booking?.startTime || "")
          const bookingStartHour = bookingDate?.getHours()
          const bookingEndHour = new Date(booking?.endTime || "")?.getHours()
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
        const bookingDate = new Date(booking?.startTime || "")
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
    const start = new Date(startTime || "")
    const end = new Date(endTime || "")
    if (now > end) return "past"
    if (now >= start && now <= end) return "ongoing"
    return "upcoming"
  }

  const handleDelete = async (bookingId: string) => {
    try {
      await updateBookingStatus({
        id: bookingId,
        status: { status: "cancelled" },
      }).unwrap()
    } catch (error) {
      console.error("Failed to delete booking:", error)
    }
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  const goToFirstBooking = () => {
    if (bookings?.length > 0 && bookings[0]?.startTime) {
      setCurrentWeek(new Date(bookings[0].startTime))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Loading Calendar</h3>
            <p className="text-slate-600 dark:text-slate-400">Preparing your weekly view...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        className="border-0 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900"
      >
        <AlertDescription className="text-red-800 dark:text-red-200 font-medium">
          Failed to load calendar. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">Weekly Calendar</CardTitle>
                <p className="text-green-100 font-medium mt-2 text-lg">{formatWeekRange()}</p>
                <p className="text-green-200 text-sm mt-1">
                  Total bookings: {bookings?.length || 0} | This week: {weekBookings?.length || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek("prev")}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm font-medium transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm font-medium transition-all duration-200"
              >
                Today
              </Button>
              {bookings?.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstBooking}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm font-medium transition-all duration-200"
                >
                  First Booking
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek("next")}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm font-medium transition-all duration-200"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 bg-white dark:bg-slate-900">
          {/* Desktop Calendar View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                {/* Header Row */}
                <div className="grid grid-cols-8 border-b-2 border-slate-200 dark:border-slate-700">
                  <div className="p-6 text-center font-bold text-slate-900 dark:text-slate-100 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border-r border-slate-200 dark:border-slate-600">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-green-600" />
                    <span className="text-sm">Time</span>
                  </div>
                  {weekDays.map((day, index) => (
                    <div
                      key={day.toDateString()}
                      className={`p-6 text-center font-bold border-r border-slate-200 dark:border-slate-600 transition-all duration-200 ${
                        isToday(day)
                          ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg"
                          : "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-slate-900 dark:text-slate-100 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-600"
                      }`}
                    >
                      <div className="text-sm font-medium opacity-80">{DAYS[index]}</div>
                      <div className="text-2xl font-bold mt-1">{day.getDate()}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {day.toLocaleDateString("en-US", { month: "short" })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700 min-h-[120px]"
                  >
                    {/* Time Column */}
                    <div className="p-4 text-center font-bold text-slate-900 dark:text-slate-100 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-r border-slate-200 dark:border-slate-600 flex items-center justify-center">
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
                          className={`relative p-3 border-r border-slate-200 dark:border-slate-600 min-h-[120px] transition-all duration-200 ${
                            isToday(day)
                              ? "bg-green-50/50 dark:bg-green-950/20"
                              : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {hourBookings.map((booking) => {
                            const status = getBookingStatus(booking?.startTime || "", booking?.endTime || "")
                            return (
                              <div
                                key={booking?.id}
                                className={`group relative mb-3 p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                                  status === "past"
                                    ? "bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300 text-slate-600"
                                    : status === "ongoing"
                                      ? "bg-gradient-to-br from-green-500 to-green-600 text-white border-green-400 animate-pulse shadow-lg"
                                      : "bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:border-green-300 dark:hover:border-green-600"
                                }`}
                              >
                                <div className="space-y-2">
                                  <div className="font-bold text-sm truncate flex items-center gap-2">
                                    <MapPin className="h-3 w-3 opacity-70" />
                                    {booking?.resource?.name || "Unknown Resource"}
                                  </div>
                                  <div className="text-xs font-medium truncate flex items-center gap-2">
                                    <User className="h-3 w-3 opacity-70" />
                                    {booking?.requestedBy || "Unknown User"}
                                  </div>
                                  <div className="text-xs flex items-center gap-2">
                                    <Clock className="h-3 w-3 opacity-70" />
                                    {new Date(booking?.startTime || "").toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}
                                    {" - "}
                                    {new Date(booking?.endTime || "").toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                  <Badge
                                    className={`text-xs font-bold px-3 py-1 ${
                                      status === "past"
                                        ? "bg-slate-500 text-white"
                                        : status === "ongoing"
                                          ? "bg-white text-green-600 animate-pulse"
                                          : "bg-green-500 text-white"
                                    }`}
                                  >
                                    {status === "ongoing" ? "● LIVE" : status.toUpperCase()}
                                  </Badge>
                                </div>

                                {/* Delete Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(booking?.id || "")}
                                  disabled={isCanceling}
                                  className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg"
                                >
                                  {isCanceling ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
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
          <div className="lg:hidden space-y-6 p-6">
            {weekDays.map((day, index) => {
              const dayKey = day.toDateString()
              const dayBookings = bookingsByDay[dayKey] || []
              return (
                <Card
                  key={dayKey}
                  className={`border-0 shadow-lg overflow-hidden ${
                    isToday(day)
                      ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 ring-2 ring-green-500"
                      : "bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700"
                  }`}
                >
                  <CardHeader
                    className={`${
                      isToday(day)
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                        : "bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-900 dark:text-slate-100"
                    } relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <CardTitle className="text-xl font-bold flex items-center justify-between relative z-10">
                      <span className="flex items-center gap-3">
                        {FULL_DAYS[index]}, {day.getDate()} {day.toLocaleDateString("en-US", { month: "short" })}
                        {isToday(day) && <span className="text-2xl animate-pulse">●</span>}
                      </span>
                      <Badge
                        variant="outline"
                        className={`${
                          isToday(day)
                            ? "text-white border-white/50 bg-white/20"
                            : "text-slate-700 dark:text-slate-300 border-slate-400 dark:border-slate-500 bg-white/50 dark:bg-slate-800/50"
                        } backdrop-blur-sm`}
                      >
                        {dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {dayBookings.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No bookings for this day</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">All clear!</p>
                      </div>
                    ) : (
                      dayBookings.map((booking) => {
                        const status = getBookingStatus(booking?.startTime || "", booking?.endTime || "")
                        return (
                          <div
                            key={booking?.id}
                            className={`group p-5 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                              status === "past"
                                ? "bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300 text-slate-600"
                                : status === "ongoing"
                                  ? "bg-gradient-to-br from-green-500 to-green-600 text-white border-green-400 animate-pulse"
                                  : "bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:border-green-300 dark:hover:border-green-600"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                <div className="font-bold text-lg flex items-center gap-2">
                                  <MapPin className="h-4 w-4 opacity-70" />
                                  {booking?.resource?.name || "Unknown Resource"}
                                </div>
                                <div className="text-sm flex items-center gap-2">
                                  <Clock className="h-4 w-4 opacity-70" />
                                  {new Date(booking?.startTime || "").toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  -{" "}
                                  {new Date(booking?.endTime || "").toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                <div className="text-sm font-medium flex items-center gap-2">
                                  <User className="h-4 w-4 opacity-70" />
                                  {booking?.requestedBy || "Unknown User"}
                                </div>
                                <Badge
                                  className={`text-xs font-bold w-fit ${
                                    status === "past"
                                      ? "bg-slate-500 text-white"
                                      : status === "ongoing"
                                        ? "bg-white text-green-600 animate-pulse"
                                        : "bg-green-500 text-white"
                                  }`}
                                >
                                  {status === "ongoing" ? "● LIVE" : status.toUpperCase()}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(booking?.id || "")}
                                disabled={isCanceling}
                                className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg"
                              >
                                {isCanceling ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-5 w-5" />
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
