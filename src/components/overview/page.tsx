"use client"



import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, MapPin, Trash2, TrendingUp, Loader2 } from "lucide-react"
import { Badge } from "../ui/badge"
import {  useGetBookingStatsQuery, useGetUpcomingAndActiveBookingsQuery, useUpdateBookingStatusMutation } from "@/redux/api/bookingApi"
import { formatDateTime } from "@/lib/utils"
import { Alert, AlertDescription } from "../ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

export function OverviewPage() {
  const [updateBookingStatus, { isLoading: isCanceling, error }] = useUpdateBookingStatusMutation()

  //booking stats
  const { data: bookingStats, isLoading: isStatsLoading } = useGetBookingStatsQuery({})
  const { totalBookings, totalResources, totalBookingsToday, ongoingBookingsToday } = bookingStats?.data || {}

  //useGetUpcomingAndActiveBookingsQuery
  const { data: upcomingAndActiveBookings, isLoading: isUpcomingAndActiveBookingsLoading } =
    useGetUpcomingAndActiveBookingsQuery({})

  const { upcomingBookings, activeBookings: ongoingBookings } = upcomingAndActiveBookings?.data || {
    upcomingBookings: [],
    ongoingBookings: [],
  }



  if ( isStatsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
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


  const handleDelete = async (bookingId: string,) => {

    try {
      await updateBookingStatus({ id: bookingId, status: { status: "cancelled" } }).unwrap()
    } catch (error) {
      console.error("Failed to delete booking:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ongoingBookingsToday}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookingsToday}</div>
            <p className="text-xs text-muted-foreground">Bookings today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResources}</div>
            <p className="text-xs text-muted-foreground">Available resources</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Next scheduled bookings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingBookings?.slice(0, 5).map((booking: any) => (
              <div
                key={booking.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4"
              >
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{booking?.status}</Badge>
                    <span className="text-sm font-medium truncate">{booking?.resource?.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="sm:hidden">{formatDateTime(booking?.startTime)}</div>
                    <div className="hidden sm:block">
                      {formatDateTime(booking?.startTime)} • {booking?.requestedBy}
                    </div>
                    <div className="sm:hidden">{booking?.requestedBy}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(booking.id)}
                  disabled={isCanceling}
                  className="text-destructive hover:text-destructive shrink-0 text-red-800"
                >
                  {isCanceling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  <span className="">Cancel Booking</span>
                </Button>
              </div>
            ))}
            {upcomingBookings?.length === 0 && <p className="text-sm text-muted-foreground">No upcoming bookings</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Now</CardTitle>
            <CardDescription>Currently ongoing bookings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ongoingBookings?.map((booking: any) => (
              <div
                key={booking?.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4"
              >
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default">{booking?.status}</Badge>
                    <span className="text-sm font-medium truncate">{booking?.resource?.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="sm:hidden">Until {formatDateTime(booking?.endTime)}</div>
                    <div className="hidden sm:block">
                      Until {formatDateTime(booking?.endTime)} • {booking?.requestedBy}
                    </div>
                    <div className="sm:hidden">{booking?.requestedBy}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(booking?.id)}
                  disabled={isCanceling}
                  className="text-destructive hover:text-destructive shrink-0 text-red-500"
                >
                  {isCanceling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  <span className="">Delete booking</span>
                </Button>
              </div>
            ))}
            {ongoingBookings?.length === 0 && <p className="text-sm text-muted-foreground">No active bookings</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
