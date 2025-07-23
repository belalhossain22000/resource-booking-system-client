"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Plus, CheckCircle, AlertTriangle, Loader2, Building, Zap, Settings } from "lucide-react"
import { useCreateResourceMutation } from "@/redux/api/resourceApi"

interface CreateResourceData {
  name: string
}

const CreateNewResource = () => {
  const [createResource, { isLoading: isSubmitting }] = useCreateResourceMutation()
  const [formData, setFormData] = useState<CreateResourceData>({
    name: "",
  })
  const [errors, setErrors] = useState<string[]>([])
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validateForm = (): string[] => {
    const validationErrors: string[] = []
    if (!formData.name?.trim()) {
      validationErrors.push("Resource name is required")
    }
    if (formData.name && formData.name.trim().length < 3) {
      validationErrors.push("Resource name must be at least 3 characters long")
    }
    if (formData.name && formData.name.trim().length > 50) {
      validationErrors.push("Resource name cannot exceed 50 characters")
    }
    return validationErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitSuccess(false)

    const validationErrors = validateForm()
    setErrors(validationErrors)

    if (validationErrors.length > 0) {
      return
    }

    try {
      // Prepare data to send - only include name as per your requirement
      const dataToSend = {
        name: formData.name.trim(),
      }

      await createResource(dataToSend).unwrap()

      // Simulate API call for demo
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Reset form on success
      setFormData({
        name: "",
      })
      setSubmitSuccess(true)
      setErrors([])

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (error: any) {
      console.error("Failed to create resource:", error)
      setErrors([error?.data?.message || "Failed to create resource. Please try again."])
    }
  }

  const handleInputChange = (field: keyof CreateResourceData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-6">
      {/* Header */}
      <div className="text-center space-y-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl -z-10"></div>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl mb-6 shadow-lg">
          <Plus className="h-10 w-10" />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Create New Resource
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed">
            Add a new resource to your booking system. Resources can be{" "}
            <span className="font-semibold text-blue-600">rooms</span>,{" "}
            <span className="font-semibold text-purple-600">equipment</span>, or any{" "}
            <span className="font-semibold text-green-600">bookable item</span>.
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {submitSuccess && (
        <Alert className="border-0 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-lg">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200 font-medium text-lg">
            🎉 Resource created successfully! It's now available for booking.
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
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10">
            <CardTitle className="text-3xl font-bold flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <Building className="h-8 w-8 text-white" />
              </div>
              Resource Details
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg mt-3">
              Fill in the information below to create a new resource for your booking system.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-10 space-y-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Resource Name - Required */}
            <div className="space-y-4">
              <Label
                htmlFor="name"
                className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Resource Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Studio Room X, Conference Room A, Projector #1"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="h-14 text-lg border-2 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-slate-800 placeholder:text-slate-400 shadow-sm hover:shadow-md"
                required
              />
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>This will be the display name for your resource</span>
              </div>

              {/* Character Counter */}
              <div className="flex justify-between items-center text-sm">
                <div className="text-slate-500 dark:text-slate-400">
                  {formData.name.length < 3 && formData.name.length > 0 && (
                    <span className="text-orange-600">Minimum 3 characters required</span>
                  )}
                  {formData.name.length >= 3 && <span className="text-green-600">✓ Valid length</span>}
                </div>
                <div
                  className={`text-sm ${formData.name.length > 40 ? "text-orange-600" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {formData.name.length}/50
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300 border-0 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Creating Resource...</span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Plus className="h-6 w-6" />
                  <span>Create Resource</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 overflow-hidden group hover:scale-105">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-8 text-center relative">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-3">Easy Setup</h3>
            <p className="text-green-700 dark:text-green-300 text-base">
              Create resources in seconds with our streamlined form process
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 overflow-hidden group hover:scale-105">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-8 text-center relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Settings className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-3">Flexible Resources</h3>
            <p className="text-purple-700 dark:text-purple-300 text-base">
              Support for rooms, equipment, and any bookable item you need
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 overflow-hidden group hover:scale-105">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-8 text-center relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3">Instant Availability</h3>
            <p className="text-blue-700 dark:text-blue-300 text-base">
              Resources are immediately available for booking after creation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Features Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">What happens next?</h3>
            <div className="grid gap-6 md:grid-cols-3 mt-8">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Resource Created</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                  Your resource is added to the system
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Available for Booking</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                  Users can immediately start booking this resource
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Manage & Monitor</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                  Track usage and manage bookings from your dashboard
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateNewResource
