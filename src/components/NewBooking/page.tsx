"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, User, MapPin, AlertTriangle, CheckCircle, Loader2, Plus, Shield, Zap } from "lucide-react"
import { validateBooking } from "@/lib/utils"
import { BOOKING_RULES } from "@/constants/resources"
import { useGetAllResourcesQuery } from "@/redux/api/resourceApi"
import { useCreateBookingMutation, useGetBookingsQuery } from "@/redux/api/bookingApi"

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

interface ResourcesResponse {
  success: boolean
  message: string
  data: {
    data: Resource[]
  }
}

export function NewBookingPage() {
  const { data: resourcesResponse, isLoading: isLoadingResources } = useGetAllResourcesQuery({}) as {
    data: ResourcesResponse | undefined
    isLoading: boolean
  }
  const { data: bookingsResponse } = useGetBookingsQuery({}) as {
    data: BookingsResponse | undefined
  }
  const [createBooking, { isLoading: isSubmitting }] = useCreateBookingMutation()

  // Extract resources from API response with optional chaining
  const resources = resourcesResponse?.data?.data || []

  // Extract and flatten existing bookings from API response
  const existingBookings = useMemo(() => {
    if (!bookingsResponse?.data) return []
    const allBookings: Booking[] = []
    Object.values(bookingsResponse?.data || {}).forEach((resourceBookings) => {
      allBookings.push(...(resourceBookings || []))
    })
    return allBookings
  }, [bookingsResponse])

  const [formData, setFormData] = useState({
    resource: "",
    resourceId: "",
    startTime: "",
    endTime: "",
    requestedBy: "",
  })
  const [errors, setErrors] = useState<string[]>([])
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitSuccess(false)

    const validationErrors = validateBooking(
      formData,
      existingBookings,
      BOOKING_RULES?.BUFFER_MINUTES || 15,
      BOOKING_RULES?.MAX_DURATION_HOURS || 8,
    )

    setErrors(validationErrors)

    if (validationErrors.length > 0) {
      return
    }

    try {
      // Create booking with resourceId instead of resource name
      const data = {
        resourceId: formData.resourceId,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        requestedBy: formData.requestedBy,
      }

      console.log(data)
      await createBooking(data).unwrap()

      // Reset form
      setFormData({
        resource: "",
        resourceId: "",
        startTime: "",
        endTime: "",
        requestedBy: "",
      })
      setSubmitSuccess(true)
      setErrors([])

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (error: any) {
      console.error("Failed to create booking:", error)
      setErrors(["Failed to create booking. Please try again."])
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleResourceChange = (resourceName: string) => {
    const selectedResource = resources.find((r: any) => r?.name === resourceName)
    setFormData((prev) => ({
      ...prev,
      resource: resourceName,
      resourceId: selectedResource?.id || "",
    }))
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const getDurationInfo = () => {
    if (formData.startTime && formData.endTime) {
      const durationMinutes =
        (new Date(formData.endTime).getTime() - new Date(formData.startTime).getTime()) / (1000 * 60)
      const hours = Math.floor(durationMinutes / 60)
      const minutes = durationMinutes % 60
      return {
        duration: durationMinutes,
        formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
        isValid:
          durationMinutes >= (BOOKING_RULES?.MIN_DURATION_MINUTES || 30) &&
          durationMinutes <= (BOOKING_RULES?.MAX_DURATION_HOURS || 8) * 60,
      }
    }
    return null
  }

  const durationInfo = getDurationInfo()

  if (isLoadingResources) {
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
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Loading Resources</h3>
            <p className="text-slate-600 dark:text-slate-400">Preparing the booking form...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-6">
      {/* Header */}
      <div className="text-center space-y-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-3xl -z-10"></div>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl mb-6 shadow-lg">
          <Plus className="h-10 w-10" />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Create New Booking
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed">
            Reserve your space with our intelligent booking system. Maximum duration:{" "}
            <span className="font-semibold text-green-600">{BOOKING_RULES?.MAX_DURATION_HOURS || 8} hours</span>
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {submitSuccess && (
        <Alert className="border-0 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-lg">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200 font-medium text-lg">
            🎉 Booking created successfully! Check your dashboard to view the booking.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {errors.length > 0 && (
        <Alert className="border-0 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 shadow-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <div className="font-semibold mb-3 text-lg">Please fix the following issues:</div>
            <ul className="list-disc list-inside space-y-2">
              {errors.map((error, index) => (
                <li key={index} className="text-base">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10">
            <CardTitle className="text-3xl font-bold flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              Booking Details
            </CardTitle>
            <CardDescription className="text-green-100 text-lg mt-3">
              Fill in the information below to create your booking. A{" "}
              <span className="font-semibold">{BOOKING_RULES?.BUFFER_MINUTES || 15}-minute buffer</span> will be
              automatically applied.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-10 space-y-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Resource and Name Row */}
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <Label
                  htmlFor="resource"
                  className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3"
                >
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  Resource
                </Label>
                <Select value={formData.resource} onValueChange={handleResourceChange}>
                  <SelectTrigger className="w-full h-14 text-lg border-2 border-slate-300 dark:border-slate-600 focus:border-green-500 dark:focus:border-green-400 transition-all duration-200 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md">
                    <SelectValue placeholder="Select a resource" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl">
                    {resources.map((resource: any) => (
                      <SelectItem
                        key={resource?.id}
                        value={resource?.name || ""}
                        className="text-lg py-4 text-slate-900 dark:text-slate-100 hover:bg-green-50 dark:hover:bg-green-950 focus:bg-green-50 dark:focus:bg-green-950"
                      >
                        {resource?.name || "Unknown Resource"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label
                  htmlFor="requestedBy"
                  className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Requested By
                </Label>
                <Input
                  id="requestedBy"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.requestedBy}
                  onChange={(e) => handleInputChange("requestedBy", e.target.value)}
                  className="h-14 text-lg border-2 border-slate-300 dark:border-slate-600 focus:border-green-500 dark:focus:border-green-400 transition-all duration-200 bg-white dark:bg-slate-800 placeholder:text-slate-400 shadow-sm hover:shadow-md"
                />
              </div>
            </div>

            {/* Time Row */}
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <Label
                  htmlFor="startTime"
                  className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3"
                >
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <CalendarDays className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange("startTime", e.target.value)}
                  className="h-14 text-lg border-2 border-slate-300 dark:border-slate-600 focus:border-green-500 dark:focus:border-green-400 transition-all duration-200 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md"
                />
              </div>

              <div className="space-y-4">
                <Label
                  htmlFor="endTime"
                  className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3"
                >
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  End Time
                </Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  className="h-14 text-lg border-2 border-slate-300 dark:border-slate-600 focus:border-green-500 dark:focus:border-green-400 transition-all duration-200 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md"
                />
              </div>
            </div>

            {/* Duration Info */}
            {durationInfo && (
              <Card
                className={`border-2 transition-all duration-300 shadow-lg ${
                  durationInfo.isValid
                    ? "border-green-300 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
                    : "border-red-300 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900"
                }`}
              >
                <CardContent className="p-8">
                  <div className="flex items-center gap-6 text-xl font-semibold">
                    <div
                      className={`p-4 rounded-2xl ${
                        durationInfo.isValid ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      }`}
                    >
                      <Clock className="h-6 w-6" />
                    </div>
                    <span
                      className={
                        durationInfo.isValid ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                      }
                    >
                      Duration: {durationInfo.formatted}
                    </span>
                  </div>
                  <p
                    className={`text-base mt-4 ${durationInfo.isValid ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}
                  >
                    {durationInfo.isValid
                      ? `✅ Perfect! A ${BOOKING_RULES?.BUFFER_MINUTES || 15}-minute buffer will be automatically applied before and after your booking.`
                      : `❌ Duration must be between ${BOOKING_RULES?.MIN_DURATION_MINUTES || 30} minutes and ${BOOKING_RULES?.MAX_DURATION_HOURS || 8} hours.`}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transition-all duration-300 border-0 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Creating Booking...</span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Plus className="h-6 w-6" />
                  <span>Create Booking</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 overflow-hidden group hover:scale-105">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-8 text-center relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3">Quick Booking</h3>
            <p className="text-blue-700 dark:text-blue-300 text-base">
              Create bookings in under a minute with our streamlined process
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 overflow-hidden group hover:scale-105">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-8 text-center relative">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-3">Conflict Detection</h3>
            <p className="text-orange-700 dark:text-orange-300 text-base">
              Intelligent validation prevents booking overlaps automatically
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 overflow-hidden group hover:scale-105">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-8 text-center relative">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-3">Buffer Protection</h3>
            <p className="text-green-700 dark:text-green-300 text-base">
              Automatic buffer time ensures smooth transitions between bookings
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default NewBookingPage
