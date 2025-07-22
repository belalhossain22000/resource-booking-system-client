"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Clock, Calendar, TrendingUp, Loader2 } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { useGetBookingsQuery } from "@/redux/api/bookingApi"
import { RESOURCES } from "@/constants/resources"


export function ResourcesPage() {
  const { data: bookings = [], isLoading, error } = useGetBookingsQuery()

  const resourceStats = useMemo(() => {
    return RESOURCES.map((resource) => {
      const resourceBookings = bookings.filter((booking) => booking.resource === resource)
      const now = new Date()

      const totalBookings = resourceBookings.length
      const upcomingBookings = resourceBookings.filter((booking) => new Date(booking.startTime) > now).length
      const ongoingBookings = resourceBookings.filter((booking) => {
        const start = new Date(booking.startTime)
        const end = new Date(booking.endTime)
        return now >= start && now <= end
      }).length

      // Calculate total hours booked
      const totalHours = resourceBookings.reduce((acc, booking) => {
        const duration =
          (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60)
        return acc + duration
      }, 0)

      // Calculate utilization (assuming 8 hours per day, 5 days per week)
      const availableHours = 40 // 8 hours * 5 days
      const utilization = Math.min((totalHours / availableHours) * 100, 100)

      return {
        name: resource,
        totalBookings,
        upcomingBookings,
        ongoingBookings,
        totalHours: Math.round(totalHours * 10) / 10,
        utilization: Math.round(utilization),
        isActive: ongoingBookings > 0,
      }
    })
  }, [bookings])

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return "text-red-600"
    if (utilization >= 60) return "text-yellow-600"
    return "text-green-600"
  }

  const getUtilizationBg = (utilization: number) => {
    if (utilization >= 80) return "bg-red-100"
    if (utilization >= 60) return "bg-yellow-100"
    return "bg-green-100"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading resources...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load resources. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Resources Overview</h2>
        <p className="text-muted-foreground">Monitor resource utilization and booking statistics</p>
      </div>

      {/* Resource Cards */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {resourceStats.map((resource) => (
          <Card key={resource.name} className={resource.isActive ? "border-primary" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg min-w-0">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="truncate">{resource.name}</span>
                </CardTitle>
                {resource.isActive && (
                  <Badge variant="default" className="text-xs shrink-0">
                    Active
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Resource utilization and booking statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span className="truncate">Total Bookings</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold">{resource.totalBookings}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="truncate">Total Hours</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold">{resource.totalHours}h</div>
                </div>
              </div>

              {/* Utilization */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Utilization</span>
                  <span className={`font-medium ${getUtilizationColor(resource.utilization)}`}>
                    {resource.utilization}%
                  </span>
                </div>
                <Progress value={resource.utilization} className={`h-2 ${getUtilizationBg(resource.utilization)}`} />
              </div>

              {/* Upcoming Bookings */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Upcoming</span>
                <Badge variant="outline" className="text-xs text-black">
                  {resource.upcomingBookings} booking{resource.upcomingBookings !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{RESOURCES.length}</div>
            <p className="text-xs text-muted-foreground">Available for booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resourceStats.filter((r) => r.isActive).length}</div>
            <p className="text-xs text-muted-foreground">Currently in use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(resourceStats.reduce((acc, r) => acc + r.utilization, 0) / resourceStats.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Across all resources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resourceStats.reduce((acc, r) => acc + r.totalHours, 0)}h</div>
            <p className="text-xs text-muted-foreground">Booked this period</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
