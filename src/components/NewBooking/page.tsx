"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, User, MapPin, AlertTriangle, CheckCircle, Loader2, Plus } from "lucide-react"
import { validateBooking } from "@/lib/utils"
import { BOOKING_RULES } from "@/constants/resources"
import { useGetAllResourcesQuery } from "@/redux/api/resourceApi"
import { useCreateBookingMutation, useGetBookingsQuery } from "@/redux/api/bookingApi"
import PageLoading from "../shared/PageLoading"

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
      <div className="flex items-center justify-center h-64">
        <PageLoading />
        <span className="ml-2">Loading resources...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-full mb-4">
          <Plus className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold text-black">Create New Booking</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Reserve your space with our simple booking system. Maximum duration: {BOOKING_RULES?.MAX_DURATION_HOURS || 8}{" "}
          hours
        </p>
      </div>

      {/* Success Alert */}
      {submitSuccess && (
        <Alert className="border-2 border-black bg-white">
          <CheckCircle className="h-4 w-4 text-black" />
          <AlertDescription className="text-black font-medium">
            Booking created successfully! Check your dashboard to view the booking.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {errors.length > 0 && (
        <Alert className="border-2 border-black bg-gray-100">
          <AlertTriangle className="h-4 w-4 text-black" />
          <AlertDescription className="text-black">
            <div className="font-medium mb-2">Please fix the following issues:</div>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <Card className="border-2 border-black shadow-lg">
        <CardHeader className="border-b-2 border-black bg-black text-white">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <MapPin className="h-6 w-6" />
            Booking Details
          </CardTitle>
          <CardDescription className="text-gray-300">
            Fill in the information below to create your booking. A {BOOKING_RULES?.BUFFER_MINUTES || 15}-minute buffer
            will be automatically applied.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Resource and Name Row */}
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="resource" className="text-base font-semibold text-black flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Resource
                </Label>
                <Select value={formData.resource} onValueChange={handleResourceChange}>
                  <SelectTrigger className="w-full h-12 text-base border-2 border-black focus:border-black transition-colors bg-white">
                    <SelectValue placeholder="Select a resource" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black bg-white">
                    {resources.map((resource: any) => (
                      <SelectItem
                        key={resource?.id}
                        value={resource?.name || ""}
                        className="text-base py-3 text-black hover:bg-gray-100"
                      >
                        {resource?.name || "Unknown Resource"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="requestedBy" className="text-base font-semibold text-black flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Requested By
                </Label>
                <Input
                  id="requestedBy"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.requestedBy}
                  onChange={(e) => handleInputChange("requestedBy", e.target.value)}
                  className="h-12 text-base border-2 border-black focus:border-black transition-colors bg-white placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Time Row */}
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="startTime" className="text-base font-semibold text-black flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange("startTime", e.target.value)}
                  className="h-12 text-base border-2 border-black focus:border-black transition-colors bg-white"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="endTime" className="text-base font-semibold text-black flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  End Time
                </Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  className="h-12 text-base border-2 border-black focus:border-black transition-colors bg-white"
                />
              </div>
            </div>

            {/* Duration Info */}
            {durationInfo && (
              <Card
                className={`border-2 transition-all duration-300 ${
                  durationInfo.isValid ? "border-black bg-white" : "border-black bg-gray-100"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 text-lg font-semibold text-black">
                    <div className="p-3 rounded-full bg-black text-white">
                      <Clock className="h-5 w-5" />
                    </div>
                    <span>Duration: {durationInfo.formatted}</span>
                  </div>
                  <p className="text-sm mt-3 text-gray-700">
                    {durationInfo.isValid
                      ? `Perfect! A ${BOOKING_RULES?.BUFFER_MINUTES || 15}-minute buffer will be automatically applied before and after your booking.`
                      : `Duration must be between ${BOOKING_RULES?.MIN_DURATION_MINUTES || 30} minutes and ${BOOKING_RULES?.MAX_DURATION_HOURS || 8} hours.`}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold bg-black hover:bg-gray-800 text-white transition-colors duration-200 border-2 border-black"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Booking...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Plus className="h-5 w-5" />
                  <span>Create Booking</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-2 border-black hover:bg-gray-50 transition-colors duration-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Quick Booking</h3>
            <p className="text-gray-600">Create bookings in under a minute</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-black hover:bg-gray-50 transition-colors duration-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Conflict Detection</h3>
            <p className="text-gray-600">Automatic validation prevents overlaps</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-black hover:bg-gray-50 transition-colors duration-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Buffer Protection</h3>
            <p className="text-gray-600">Automatic buffer time between bookings</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default NewBookingPage
