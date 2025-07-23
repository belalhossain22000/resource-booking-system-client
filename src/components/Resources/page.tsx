"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Clock, Calendar, TrendingUp, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter, X } from "lucide-react"
import { useGetAllResourcesQuery } from "@/redux/api/resourceApi"
import { Resource } from "@/types/resources"


// Type definitions


export function ResourcesPage() {
  const { data: resourcesResponse, isLoading: isLoadingResources, error } = useGetAllResourcesQuery({})

  // Extract resources array from API response
  const resources: Resource[] = resourcesResponse?.data?.data || []

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [utilizationFilter, setUtilizationFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  const filteredResourceStats = useMemo(() => {
    let filtered = resources.map((resource) => {
      // Use bookings directly from the resource object
      const resourceBookings = resource.bookings || []
      const now = new Date()
      const totalBookings = resourceBookings.length

      // Filter out cancelled bookings for active calculations
      const activeBookings = resourceBookings.filter((booking) => booking.status !== "cancelled")

      const upcomingBookings = activeBookings.filter((booking) => new Date(booking.startTime) > now).length
      const ongoingBookings = activeBookings.filter((booking) => {
        const start = new Date(booking.startTime)
        const end = new Date(booking.endTime)
        return now >= start && now <= end
      }).length

      // Calculate total hours booked (excluding cancelled bookings)
      const totalHours = activeBookings.reduce((acc, booking) => {
        const duration =
          (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60)
        return acc + duration
      }, 0)

      // Calculate utilization (assuming 8 hours per day, 5 days per week)
      const availableHours = 40 // 8 hours * 5 days
      const utilization = Math.min((totalHours / availableHours) * 100, 100)

      return {
        id: resource.id,
        name: resource.name,
        totalBookings,
        upcomingBookings,
        ongoingBookings,
        totalHours: Math.round(totalHours * 10) / 10,
        utilization: Math.round(utilization),
        isActive: ongoingBookings > 0,
      }
    })

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((resource) => resource.name.toLowerCase().includes(query))
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((resource) => {
        switch (statusFilter) {
          case "active":
            return resource.isActive
          case "available":
            return !resource.isActive
          case "has-bookings":
            return resource.totalBookings > 0
          case "no-bookings":
            return resource.totalBookings === 0
          default:
            return true
        }
      })
    }

    // Apply utilization filter
    if (utilizationFilter !== "all") {
      filtered = filtered.filter((resource) => {
        switch (utilizationFilter) {
          case "high":
            return resource.utilization >= 80
          case "medium":
            return resource.utilization >= 40 && resource.utilization < 80
          case "low":
            return resource.utilization < 40
          default:
            return true
        }
      })
    }

    return filtered
  }, [resources, searchQuery, statusFilter, utilizationFilter])

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

  const clearAllFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setUtilizationFilter("all")
  }

  const hasActiveFilters = searchQuery || statusFilter !== "all" || utilizationFilter !== "all"

  if (isLoadingResources) {
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
        <p className="text-muted-foreground">
          Monitor resource utilization and booking statistics ({filteredResourceStats.length} of {resources.length}{" "}
          resources)
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resources.length}</div>
                <p className="text-xs text-muted-foreground">Available for booking</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredResourceStats.filter((r) => r.isActive).length}</div>
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
                  {filteredResourceStats.length > 0
                    ? Math.round(
                        filteredResourceStats.reduce((acc, r) => acc + r.utilization, 0) / filteredResourceStats.length,
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Across filtered resources</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredResourceStats.reduce((acc, r) => acc + r.totalHours, 0)}h
                </div>
                <p className="text-xs text-muted-foreground">Booked this period</p>
              </CardContent>
            </Card>
          </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                !
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="flex items-center gap-1">
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Currently Active</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="has-bookings">Has Bookings</SelectItem>
                    <SelectItem value="no-bookings">No Bookings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Utilization</Label>
                <Select value={utilizationFilter} onValueChange={setUtilizationFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="high">High (80%+)</SelectItem>
                    <SelectItem value="medium">Medium (40-79%)</SelectItem>
                    <SelectItem value="low">Low (&lt;40%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={clearAllFilters} className="w-full bg-transparent">
                  Clear All Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results Message */}
      {filteredResourceStats.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No resources found matching your criteria.</p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearAllFilters} className="mt-2 bg-transparent">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Resource Cards */}
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResourceStats.map((resource) => (
              <Card key={resource.id} className={resource.isActive ? "border-primary" : ""}>
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
                    <Progress
                      value={resource.utilization}
                      className={`h-2 ${getUtilizationBg(resource.utilization)}`}
                    />
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

          
        </>
      )}
    </div>
  )
}

export default ResourcesPage
