"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Plus, CheckCircle, AlertTriangle, Loader2, Building } from "lucide-react"
import { useCreateResourceMutation } from "@/redux/api/resourceApi"

// You'll need to create this API hook or replace with your actual API call
// import { useCreateResourceMutation } from "@/redux/api/resourceApi"

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
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-full mb-4">
          <Plus className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold text-black">Create New Resource</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Add a new resource to your booking system. Resources can be rooms, equipment, or any bookable item.
        </p>
      </div>

      {/* Success Alert */}
      {submitSuccess && (
        <Alert className="border-2 border-black bg-white">
          <CheckCircle className="h-4 w-4 text-black" />
          <AlertDescription className="text-black font-medium">
            Resource created successfully! It's now available for booking.
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
            <Building className="h-6 w-6" />
            Resource Details
          </CardTitle>
          <CardDescription className="text-gray-300">
            Fill in the information below to create a new resource for your booking system.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Resource Name - Required */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-base font-semibold text-black flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Resource Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Studio Room X, Conference Room A, Projector #1"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="h-12 text-base border-2 border-black focus:border-black transition-colors bg-white placeholder:text-gray-500"
                required
              />
              <p className="text-sm text-gray-600">This will be the display name for your resource</p>
            </div>
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold bg-black hover:bg-gray-800 text-white transition-colors duration-200 border-2 border-black"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Resource...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Plus className="h-5 w-5" />
                  <span>Create Resource</span>
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
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Easy Setup</h3>
            <p className="text-gray-600">Create resources in seconds with our simple form</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-black hover:bg-gray-50 transition-colors duration-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Flexible Resources</h3>
            <p className="text-gray-600">Support for rooms, equipment, and any bookable item</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-black hover:bg-gray-50 transition-colors duration-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Instant Availability</h3>
            <p className="text-gray-600">Resources are immediately available for booking</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateNewResource
