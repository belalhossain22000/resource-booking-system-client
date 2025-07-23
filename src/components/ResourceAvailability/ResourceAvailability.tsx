"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarDays, Clock, Search, Loader2, CheckCircle, AlertTriangle, MapPin } from "lucide-react"
import { useCheckResourceAvailabilityMutation, useGetAllResourcesQuery } from "@/redux/api/resourceApi"
import PageLoading from "../shared/PageLoading"

// Type definitions
interface Resource {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

interface AvailableSlot {
  start: string
  end: string
  duration: number
}

interface AvailabilityResponse {
  success: boolean
  message: string
  data: {
    totalSlots: number
    availableSlots: AvailableSlot[]
  }
}

interface ResourcesResponse {
  success: boolean
  message: string
  data: {
    data: Resource[]
  }
}

const DURATION_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
]

const ResourceAvailability = () => {
  const { data: resourcesResponse, isLoading: isLoadingResources } = useGetAllResourcesQuery({})
  const resources = resourcesResponse?.data?.data || []
  const [checkAvailability] = useCheckResourceAvailabilityMutation()

  const [searchParams, setSearchParams] = useState({
    resourceId: "",
    date: "",
    minDuration: "30",
  })

  const [availabilityData, setAvailabilityData] = useState<AvailabilityResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchParams?.resourceId || !searchParams?.date) {
      setError("Please select both a resource and date")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Prepare request data
      const requestData = {
        resourceId: searchParams?.resourceId,
        date: new Date(searchParams?.date).toISOString(),
        minDuration: searchParams?.minDuration,
      }

      console.log("Sending request:", requestData)

      // Check availability
      const response = await checkAvailability(requestData).unwrap()

      // Mock API response for demo
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setAvailabilityData(response)
    } catch (error: any) {
      console.error("Failed to fetch availability:", error)
      setError(error?.data?.message || "Failed to fetch availability. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }))

    // Clear previous results when search params change
    if (availabilityData) {
      setAvailabilityData(null)
    }
    if (error) {
      setError(null)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}m`
    }
  }

  const selectedResource = resources?.find((r: any) => r?.id === searchParams?.resourceId)

  if (isLoadingResources) {
    return <PageLoading />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-full mb-4">
          <Search className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold text-black">Resource Availability</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Check real-time availability for your resources and find the perfect time slot for your booking.
        </p>
      </div>

      {/* Search Form */}
      <Card className="border-2 border-black shadow-lg">
        <CardHeader className="border-b-2 border-black bg-black text-white">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <Search className="h-6 w-6" />
            Search Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6 bg-white">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Resource Selection */}
            <div className="space-y-3">
              <Label htmlFor="resource" className="text-base font-semibold text-black flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Resource
              </Label>
              <Select
                value={searchParams?.resourceId || ""}
                onValueChange={(value) => handleInputChange("resourceId", value)}
              >
                <SelectTrigger className="w-full h-12 text-base border-2 border-black focus:border-black transition-colors bg-white">
                  <SelectValue placeholder="Select a resource" />
                </SelectTrigger>
                <SelectContent className="border-2 border-black bg-white">
                  {resources?.map((resource: any) => (
                    <SelectItem
                      key={resource?.id}
                      value={resource?.id || ""}
                      className="text-base py-3 text-black hover:bg-gray-100"
                    >
                      {resource?.name || "Unknown Resource"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-3">
              <Label htmlFor="date" className="text-base font-semibold text-black flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={searchParams?.date || ""}
                onChange={(e) => handleInputChange("date", e?.target?.value || "")}
                className="h-12 text-base border-2 border-black focus:border-black transition-colors bg-white"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Duration Selection */}
            <div className="space-y-3">
              <Label htmlFor="duration" className="text-base font-semibold text-black flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Minimum Duration
              </Label>
              <Select
                value={searchParams?.minDuration || "30"}
                onValueChange={(value) => handleInputChange("minDuration", value)}
              >
                <SelectTrigger className="w-full h-12 text-base border-2 border-black focus:border-black transition-colors bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-2 border-black bg-white">
                  {DURATION_OPTIONS?.map((option) => (
                    <SelectItem
                      key={option?.value}
                      value={option?.value || ""}
                      className="text-base py-3 text-black hover:bg-gray-100"
                    >
                      {option?.label || "Unknown Duration"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="w-full h-14 text-lg font-semibold bg-black hover:bg-gray-800 text-white transition-colors duration-200 border-2 border-black"
            disabled={isLoading || !searchParams?.resourceId || !searchParams?.date}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Checking Availability...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5" />
                <span>Check Availability</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-2 border-black bg-gray-100">
          <AlertTriangle className="h-4 w-4 text-black" />
          <AlertDescription className="text-black font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {availabilityData && (
        <Card className="border-2 border-black shadow-lg">
          <CardHeader className="border-b-2 border-black bg-black text-white">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <CheckCircle className="h-6 w-6" />
              Availability Results
            </CardTitle>
            {selectedResource && searchParams?.date && (
              <div className="text-gray-300">
                <p className="font-medium">{selectedResource?.name || "Unknown Resource"}</p>
                <p>{formatDate(searchParams?.date)}</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-8 bg-white">
            {availabilityData?.data?.totalSlots === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">No Available Slots</h3>
                <p className="text-gray-600">
                  No time slots are available for the selected resource, date, and minimum duration.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-black">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black">
                        {availabilityData?.data?.totalSlots || 0} Available Slot
                        {(availabilityData?.data?.totalSlots || 0) !== 1 ? "s" : ""}
                      </h3>
                      <p className="text-gray-600">
                        Minimum duration: {formatDuration(Number.parseInt(searchParams?.minDuration || "30"))}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-black text-white text-base px-4 py-2">
                    {availabilityData?.data?.totalSlots || 0} slot
                    {(availabilityData?.data?.totalSlots || 0) !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* Available Slots */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-black">Available Time Slots</h4>
                  <div className="grid gap-4">
                    {availabilityData?.data?.availableSlots?.map((slot, index) => (
                      <Card key={index} className="border-2 border-black hover:bg-gray-50 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-4 text-lg font-semibold text-black">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-5 w-5" />
                                  <span>
                                    {formatTime(slot?.start || "")} - {formatTime(slot?.end || "")}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Duration: {formatDuration(slot?.duration || 0)}</span>
                                <span>•</span>
                                <span>
                                  {new Date(slot?.start || "").toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            <Badge className="bg-black text-white px-4 py-2">Available</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )) || []}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ResourceAvailability
