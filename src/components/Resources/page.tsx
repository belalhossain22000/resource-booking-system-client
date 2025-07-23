"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Clock, Calendar, Loader2, Search, Filter, X, BarChart3, Activity, Database } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useGetAllResourcesQuery } from "@/redux/api/resourceApi"
import type { Resource } from "@/types/resources"

export function ResourcesPage() {
  const { data: resourcesResponse, isLoading: isLoadingResources, error } = useGetAllResourcesQuery({})

  // Extract resources array from API response
  const resources: Resource[] = resourcesResponse?.data?.data || []
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [utilizationFilter, setUtilizationFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  const filteredResourceStats = useMemo(() => {
    let filtered =
      resources?.map((resource) => {
        // Use bookings directly from the resource object
        const resourceBookings = resource?.bookings || []
        const now = new Date()
        const totalBookings = resourceBookings?.length || 0

        // Filter out cancelled bookings for active calculations
        const activeBookings = resourceBookings?.filter((booking) => booking?.status !== "cancelled") || []
        const upcomingBookings =
          activeBookings?.filter((booking) => new Date(booking?.startTime || "") > now)?.length || 0
        const ongoingBookings =
          activeBookings?.filter((booking) => {
            const start = new Date(booking?.startTime || "")
            const end = new Date(booking?.endTime || "")
            return now >= start && now <= end
          })?.length || 0

        // Calculate total hours booked (excluding cancelled bookings)
        const totalHours =
          activeBookings?.reduce((acc, booking) => {
            const duration =
              (new Date(booking?.endTime || "").getTime() - new Date(booking?.startTime || "").getTime()) /
              (1000 * 60 * 60)
            return acc + duration
          }, 0) || 0

        // Calculate utilization (assuming 8 hours per day, 5 days per week)
        const availableHours = 40 // 8 hours * 5 days
        const utilization = Math.min((totalHours / availableHours) * 100, 100)

        return {
          id: resource?.id || "",
          name: resource?.name || "Unknown Resource",
          totalBookings,
          upcomingBookings,
          ongoingBookings,
          totalHours: Math.round(totalHours * 10) / 10,
          utilization: Math.round(utilization),
          isActive: ongoingBookings > 0,
        }
      }) || []

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((resource) => resource?.name?.toLowerCase()?.includes(query))
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((resource) => {
        switch (statusFilter) {
          case "active":
            return resource?.isActive
          case "available":
            return !resource?.isActive
          case "has-bookings":
            return resource?.totalBookings > 0
          case "no-bookings":
            return resource?.totalBookings === 0
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
            return resource?.utilization >= 80
          case "medium":
            return resource?.utilization >= 40 && resource?.utilization < 80
          case "low":
            return resource?.utilization < 40
          default:
            return true
        }
      })
    }

    return filtered
  }, [resources, searchQuery, statusFilter, utilizationFilter])

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return "text-red-600 dark:text-red-400"
    if (utilization >= 60) return "text-orange-600 dark:text-orange-400"
    return "text-green-600 dark:text-green-400"
  }

  const getUtilizationBg = (utilization: number) => {
    if (utilization >= 80) return "bg-gradient-to-r from-red-500 to-red-600"
    if (utilization >= 60) return "bg-gradient-to-r from-orange-500 to-orange-600"
    return "bg-gradient-to-r from-green-500 to-green-600"
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setUtilizationFilter("all")
  }

  const hasActiveFilters = searchQuery || statusFilter !== "all" || utilizationFilter !== "all"

  if (isLoadingResources) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Loading Resources</h3>
            <p className="text-slate-600 dark:text-slate-400">Fetching resource data and statistics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-0 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 shadow-lg">
        <AlertDescription className="text-red-800 dark:text-red-200 font-medium text-lg">
          Failed to load resources. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-3xl -z-10"></div>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl mb-6 shadow-lg">
          <Database className="h-10 w-10" />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Resources Overview
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed">
            Monitor <span className="font-semibold text-blue-600">resource utilization</span> and{" "}
            <span className="font-semibold text-green-600">booking statistics</span> (
            {filteredResourceStats?.length || 0} of {resources?.length || 0} resources)
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Total Resources</CardTitle>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{resources?.length || 0}</div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Available for booking</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Active Now</CardTitle>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {filteredResourceStats?.filter((r) => r?.isActive)?.length || 0}
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">Currently in use</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">
              Avg Utilization
            </CardTitle>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              {filteredResourceStats?.length > 0
                ? Math.round(
                    filteredResourceStats.reduce((acc, r) => acc + (r?.utilization || 0), 0) /
                      filteredResourceStats.length,
                  )
                : 0}
              %
            </div>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">Across filtered resources</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">Total Hours</CardTitle>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {filteredResourceStats?.reduce((acc, r) => acc + (r?.totalHours || 0), 0) || 0}h
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Booked this period</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-800"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 border-2 transition-all duration-200 ${
                  showFilters || hasActiveFilters
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                    : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                }`}
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5">
                    {[searchQuery, statusFilter !== "all", utilizationFilter !== "all"].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-blue-700 dark:text-blue-300">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400">
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
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-blue-700 dark:text-blue-300">Utilization</Label>
                <Select value={utilizationFilter} onValueChange={setUtilizationFilter}>
                  <SelectTrigger className="border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400">
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
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="w-full border-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 bg-transparent"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results Message */}
      {filteredResourceStats?.length === 0 ? (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Database className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No resources found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {hasActiveFilters
                ? "No resources match your current filter criteria."
                : "No resources are available at the moment."}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 bg-transparent"
              >
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Resource Cards */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResourceStats?.map((resource) => (
            <Card
              key={resource?.id}
              className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.02] ${
                resource?.isActive
                  ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 ring-2 ring-green-500"
                  : "bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700"
              }`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
              <CardHeader className="pb-4 relative">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="flex items-center gap-3 text-lg min-w-0 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        resource?.isActive
                          ? "bg-green-500/20 text-green-600 dark:text-green-400"
                          : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="truncate text-slate-900 dark:text-slate-100">{resource?.name}</span>
                  </CardTitle>
                  {resource?.isActive && (
                    <Badge className="bg-green-500 text-white animate-pulse shadow-lg">● Active</Badge>
                  )}
                </div>
                <CardDescription className="text-slate-600 dark:text-slate-400 ml-11">
                  Resource utilization and booking statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span>Total Bookings</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {resource?.totalBookings || 0}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>Total Hours</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {resource?.totalHours || 0}h
                    </div>
                  </div>
                </div>

                {/* Utilization */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Utilization</span>
                    <span className={`font-bold text-lg ${getUtilizationColor(resource?.utilization || 0)}`}>
                      {resource?.utilization || 0}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress
                      value={resource?.utilization || 0}
                      className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
                    />
                    <div
                      className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getUtilizationBg(
                        resource?.utilization || 0,
                      )}`}
                      style={{ width: `${resource?.utilization || 0}%` }}
                    />
                  </div>
                </div>

                {/* Upcoming Bookings */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Upcoming Bookings</span>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                  >
                    {resource?.upcomingBookings || 0} booking{(resource?.upcomingBookings || 0) !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ResourcesPage
