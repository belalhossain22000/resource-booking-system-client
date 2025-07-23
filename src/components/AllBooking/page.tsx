"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, MapPin, Trash2, Filter, Search, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {  useGetBookingsQuery, useUpdateBookingStatusMutation } from "@/redux/api/bookingApi"
import { formatDateTime, formatDuration, getBookingStatus, getStatusColor } from "@/lib/utils"

// Type definitions based on your API response
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



export function BookingsPage() {
  const { data: bookingsResponse, isLoading, error } = useGetBookingsQuery({})
  const [updateBookingStatus, { isLoading: isCanceling,  }] = useUpdateBookingStatusMutation()

  const [resourceFilter, setResourceFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)

  // Extract bookings array from API response
  const bookings: Booking[] = bookingsResponse?.data || []

  // Get unique resources for filter dropdown
  const uniqueResources = useMemo(() => {
    return Array.from(new Set(bookings.map((booking) => booking.resource.name)))
  }, [bookings])

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = [...bookings]

    // Filter by resource
    if (resourceFilter !== "all") {
      filtered = filtered.filter((booking) => booking.resource.name === resourceFilter)
    }

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString()
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.startTime).toDateString()
        return bookingDate === filterDate
      })
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => {
        const status = getBookingStatus(booking.startTime, booking.endTime)
        return status === statusFilter
      })
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (booking) =>
          booking.resource.name.toLowerCase().includes(query) || booking.requestedBy.toLowerCase().includes(query),
      )
    }

    // Sort by start time (upcoming first)
    return filtered.sort((a, b) => {
      const aStart = new Date(a.startTime)
      const bStart = new Date(b.startTime)
      return aStart.getTime() - bStart.getTime()
    })
  }, [bookings, resourceFilter, dateFilter, statusFilter, searchQuery])

  const clearAllFilters = () => {
    setResourceFilter("all")
    setDateFilter("")
    setStatusFilter("all")
    setSearchQuery("")
  }

  const handleDelete = async (bookingId: string) => {
    try {
     await updateBookingStatus({ id: bookingId, status: { status: "cancelled" } }).unwrap()
    } catch (error) {
      console.error("Failed to delete booking:", error)
    }
  }

  if (isLoading) {
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

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Bookings</h2>
          <p className="text-muted-foreground">
            Manage and view all resource bookings ({filteredAndSortedBookings.length} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Resource</Label>
                <Select value={resourceFilter} onValueChange={setResourceFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resources</SelectItem>
                    {uniqueResources.map((resource) => (
                      <SelectItem key={resource} value={resource}>
                        {resource}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={clearAllFilters} className="w-full bg-transparent">
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings List */}
      {filteredAndSortedBookings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No bookings found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedBookings.map((booking) => {
            const status = getBookingStatus(booking.startTime, booking.endTime)
            return (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={getStatusColor(status)}>{status}</Badge>
                        <div className="flex items-center gap-2 text-lg font-semibold">
                          <MapPin className="h-4 w-4" />
                          {booking.resource.name}
                        </div>
                      </div>
                      <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>{formatDateTime(booking.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatDuration(booking.startTime, booking.endTime)}
                            <span className="ml-1">(until {formatDateTime(booking.endTime)})</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Requested by:</span>
                          <span>{booking.requestedBy}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(booking.id)}
                      disabled={isCanceling}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {isCanceling ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
