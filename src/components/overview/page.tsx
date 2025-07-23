"use client"

import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, MapPin, Trash2, TrendingUp, Loader2, ArrowRight, Eye } from "lucide-react"
import { Badge } from "../ui/badge"
import {
  useGetBookingStatsQuery,
  useGetUpcomingAndActiveBookingsQuery,
  useUpdateBookingStatusMutation,
} from "@/redux/api/bookingApi"
import { formatDateTime } from "@/lib/utils"
import { Alert, AlertDescription } from "../ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import PageLoading from "../shared/PageLoading"
import Link from "next/link"

export function OverviewPage() {
  const [updateBookingStatus, { isLoading: isCanceling, error }] = useUpdateBookingStatusMutation()

  // Booking stats
  const { data: bookingStats, isLoading: isStatsLoading } = useGetBookingStatsQuery({})
  const { totalBookings, totalResources, totalBookingsToday, ongoingBookingsToday } = bookingStats?.data || {}

  // useGetUpcomingAndActiveBookingsQuery
  const { data: upcomingAndActiveBookings, isLoading: isUpcomingAndActiveBookingsLoading } =
    useGetUpcomingAndActiveBookingsQuery({})
  const { upcomingBookings, activeBookings: ongoingBookings } = upcomingAndActiveBookings?.data || {
    upcomingBookings: [],
    ongoingBookings: [],
  }

  if (isStatsLoading || isUpcomingAndActiveBookingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <PageLoading />
        <span className="ml-2">Loading bookings...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load bookings. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  const handleDelete = async (bookingId: string) => {
    try {
      await updateBookingStatus({ id: bookingId, status: { status: "cancelled" } }).unwrap()
    } catch (error) {
      console.error("Failed to delete booking:", error)
    }
  }

  const handleSeeAllUpcoming = () => {
    // Navigate to upcoming bookings page
    console.log("Navigate to upcoming bookings")
  }

  const handleSeeAllActive = () => {
    // Navigate to active bookings page
    console.log("Navigate to active bookings")
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Total Bookings</CardTitle>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalBookings || 0}</div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">All time bookings</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Ongoing</CardTitle>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">{ongoingBookingsToday || 0}</div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">Today</CardTitle>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{totalBookingsToday || 0}</div>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Bookings today</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">Resources</CardTitle>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{totalResources || 0}</div>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">Available resources</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <div className="grid gap-8 xl:grid-cols-2">
        {/* Upcoming Bookings Card */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Upcoming Bookings
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Next {upcomingBookings?.length || 0} scheduled bookings
                </CardDescription>
              </div>
              <Link href="/bookings">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSeeAllUpcoming}
                  className="bg-white/80 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  See All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {upcomingBookings?.slice(0, 10)?.map((booking: any) => (
              <div
                key={booking?.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge
                      variant="outline"
                      className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                    >
                      {booking?.status || "upcoming"}
                    </Badge>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {booking?.resource?.name || "Unknown Resource"}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{formatDateTime(booking?.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>{booking?.requestedBy || "Unknown User"}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(booking?.id)}
                  disabled={isCanceling}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  {isCanceling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  <span className="ml-2 hidden sm:inline">Cancel</span>
                </Button>
              </div>
            ))}
            {(!upcomingBookings || upcomingBookings?.length === 0) && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No upcoming bookings</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">All caught up!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Now Card */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="border-b border-green-200 dark:border-green-700 bg-white/50 dark:bg-green-800/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-green-900 dark:text-green-100 flex items-center gap-2">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  Active Now
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </CardTitle>
                <CardDescription className="text-green-700 dark:text-green-300">
                  {ongoingBookings?.length || 0} currently ongoing bookings
                </CardDescription>
              </div>
              <Link href="/bookings">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSeeAllActive}
                  className="bg-white/80 dark:bg-green-800/80 border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-400 dark:hover:border-green-500 transition-all duration-200"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  See All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {ongoingBookings?.map((booking: any) => (
              <div
                key={booking?.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4 p-4 rounded-xl bg-white dark:bg-green-800/30 border border-green-200 dark:border-green-700 hover:border-green-400 dark:hover:border-green-500 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-green-500 text-white animate-pulse">● {booking?.status || "active"}</Badge>
                    <span className="text-sm font-semibold text-green-900 dark:text-green-100 truncate">
                      {booking?.resource?.name || "Unknown Resource"}
                    </span>
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>Until {formatDateTime(booking?.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>{booking?.requestedBy || "Unknown User"}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(booking?.id)}
                  disabled={isCanceling}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  {isCanceling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  <span className="ml-2 hidden sm:inline">Cancel</span>
                </Button>
              </div>
            ))}
            {(!ongoingBookings || ongoingBookings?.length === 0) && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">No active bookings</p>
                <p className="text-xs text-green-500 dark:text-green-500 mt-1">All quiet right now</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
