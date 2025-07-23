"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarDays, Clock, Search, Loader2, CheckCircle, AlertTriangle, MapPin, Zap, Target } from "lucide-react"
import { useCheckResourceAvailabilityMutation, useGetAllResourcesQuery } from "@/redux/api/resourceApi"

// Type definitions


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
            <p className="text-slate-600 dark:text-slate-400">Preparing availability search...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-3xl -z-10"></div>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl mb-6 shadow-lg">
          <Search className="h-10 w-10" />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Resource Availability
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed">
            Check <span className="font-semibold text-blue-600">real-time availability</span> for your resources and
            find the <span className="font-semibold text-green-600">perfect time slot</span> for your booking.
          </p>
        </div>
      </div>

      {/* Search Form */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10">
            <CardTitle className="text-3xl font-bold flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Search className="h-8 w-8 text-white" />
              </div>
              Search Availability
            </CardTitle>
            <p className="text-blue-100 text-lg mt-3">
              Select your resource, date, and minimum duration to find available time slots.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-10 space-y-8">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Resource Selection */}
            <div className="space-y-4">
              <Label
                htmlFor="resource"
                className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Resource
              </Label>
              <Select
                value={searchParams?.resourceId || ""}
                onValueChange={(value) => handleInputChange("resourceId", value)}
              >
                <SelectTrigger className="w-full h-14 text-lg border-2 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md">
                  <SelectValue placeholder="Select a resource" />
                </SelectTrigger>
                <SelectContent className="border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl">
                  {resources?.map((resource: any) => (
                    <SelectItem
                      key={resource?.id}
                      value={resource?.id || ""}
                      className="text-lg py-4 text-slate-900 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-blue-950 focus:bg-blue-50 dark:focus:bg-blue-950"
                    >
                      {resource?.name || "Unknown Resource"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-4">
              <Label
                htmlFor="date"
                className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3"
              >
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CalendarDays className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={searchParams?.date || ""}
                onChange={(e) => handleInputChange("date", e?.target?.value || "")}
                className="h-14 text-lg border-2 border-slate-300 dark:border-slate-600 focus:border-green-500 dark:focus:border-green-400 transition-all duration-200 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Duration Selection */}
            <div className="space-y-4">
              <Label
                htmlFor="duration"
                className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3"
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                Minimum Duration
              </Label>
              <Select
                value={searchParams?.minDuration || "30"}
                onValueChange={(value) => handleInputChange("minDuration", value)}
              >
                <SelectTrigger className="w-full h-14 text-lg border-2 border-slate-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-200 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl">
                  {DURATION_OPTIONS?.map((option) => (
                    <SelectItem
                      key={option?.value}
                      value={option?.value || ""}
                      className="text-lg py-4 text-slate-900 dark:text-slate-100 hover:bg-purple-50 dark:hover:bg-purple-950 focus:bg-purple-50 dark:focus:bg-purple-950"
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
            className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300 border-0 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            disabled={isLoading || !searchParams?.resourceId || !searchParams?.date}
          >
            {isLoading ? (
              <div className="flex items-center gap-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Checking Availability...</span>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Search className="h-6 w-6" />
                <span>Check Availability</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-0 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 shadow-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200 font-medium text-lg">{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {availabilityData && (
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative z-10">
              <CardTitle className="text-3xl font-bold flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                Availability Results
              </CardTitle>
              {selectedResource && searchParams?.date && (
                <div className="text-green-100 mt-4 space-y-1">
                  <p className="font-semibold text-lg">{selectedResource?.name || "Unknown Resource"}</p>
                  <p className="text-green-200">{formatDate(searchParams?.date)}</p>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-10">
            {availabilityData?.data?.totalSlots === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="h-10 w-10 text-slate-500 dark:text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">No Available Slots</h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  No time slots are available for the selected resource, date, and minimum duration.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Summary */}
                <Card className="border-0 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                          <CheckCircle className="h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">
                            {availabilityData?.data?.totalSlots || 0} Available Slot
                            {(availabilityData?.data?.totalSlots || 0) !== 1 ? "s" : ""}
                          </h3>
                          <p className="text-green-700 dark:text-green-300 text-lg">
                            Minimum duration: {formatDuration(Number.parseInt(searchParams?.minDuration || "30"))}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white text-lg px-6 py-3 shadow-lg">
                        {availabilityData?.data?.totalSlots || 0} slot
                        {(availabilityData?.data?.totalSlots || 0) !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Available Slots */}
                <div className="space-y-6">
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    Available Time Slots
                  </h4>
                  <div className="grid gap-6">
                    {availabilityData?.data?.availableSlots?.map((slot, index) => (
                      <Card
                        key={index}
                        className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 hover:scale-[1.02] overflow-hidden group"
                      >
                        <CardContent className="p-8">
                          <div className="flex items-center justify-between">
                            <div className="space-y-4 flex-1">
                              <div className="flex items-center gap-6 text-xl font-bold text-slate-900 dark:text-slate-100">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span>
                                  {formatTime(slot?.start || "")} - {formatTime(slot?.end || "")}
                                </span>
                              </div>
                              <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400 ml-16">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="font-medium">Duration: {formatDuration(slot?.duration || 0)}</span>
                                </div>
                                <span>•</span>
                                <span className="font-medium">
                                  {new Date(slot?.start || "").toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-lg px-6 py-3 shadow-lg">
                              Available
                            </Badge>
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

      {/* Info Cards */}
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 overflow-hidden group hover:scale-105">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-8 text-center relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3">Real-time Search</h3>
            <p className="text-blue-700 dark:text-blue-300 text-base">
              Get instant availability results with our lightning-fast search engine
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 overflow-hidden group hover:scale-105">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-8 text-center relative">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Target className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-3">Smart Filtering</h3>
            <p className="text-green-700 dark:text-green-300 text-base">
              Find exactly what you need with intelligent duration and date filtering
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 overflow-hidden group hover:scale-105">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-8 text-center relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-3">Detailed Results</h3>
            <p className="text-purple-700 dark:text-purple-300 text-base">
              View comprehensive slot information with precise timing and duration
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResourceAvailability
