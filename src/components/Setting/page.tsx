"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Shield, Calendar, MapPin, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import { BOOKING_RULES } from "@/constants/resources"

import type { Resource } from "@/types/resources"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useGetAllResourcesQuery } from "@/redux/api/resourceApi"

export function SettingsPage() {
  const { data: resourcesResponse, isLoading: isLoadingResources, error } = useGetAllResourcesQuery({})
  const router = useRouter()

  // Extract resources array from API response
  const resources: Resource[] = resourcesResponse?.data?.data || []
  const totalResources = resourcesResponse?.data?.meta?.total || 0
  const currentPage = resourcesResponse?.data?.meta?.page || 1
  const limit = resourcesResponse?.data?.meta?.limit || 10

  // Calculate active bookings for each resource (excluding cancelled)
  const getActiveBookingsCount = (resource: Resource) => {
    if (!resource.bookings) return 0
    return resource.bookings.filter((booking) => booking.status !== "cancelled").length
  }

  // Calculate total active bookings across all resources
  const totalActiveBookings = resources.reduce((total, resource) => {
    return total + getActiveBookingsCount(resource)
  }, 0)

  const handleSeeAllResources = () => {
    router.push("/resources")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">System configuration and booking rules</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Booking Rules Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Booking Rules
            </CardTitle>
            <CardDescription>Current system rules and limitations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Minimum booking duration</span>
              <Badge variant="outline">{BOOKING_RULES.MIN_DURATION_MINUTES} minutes</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Maximum booking duration</span>
              <Badge variant="outline">{BOOKING_RULES.MAX_DURATION_HOURS} hours</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Buffer time</span>
              <Badge variant="outline">{BOOKING_RULES.BUFFER_MINUTES} minutes</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Advance booking limit</span>
              <Badge variant="outline">{BOOKING_RULES.ADVANCE_BOOKING_DAYS} days</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Available Resources Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Available Resources
            </CardTitle>
            <CardDescription>Resources available for booking ({totalResources} total)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingResources ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading resources...</span>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to load resources</AlertDescription>
              </Alert>
            ) : resources.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No resources available</p>
              </div>
            ) : (
              <>
                {/* Show first few resources */}
                {resources.slice(0, 3).map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1 mr-2">{resource.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="secondary">Active</Badge>
                      {/* {resource.bookings && resource.bookings.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {getActiveBookingsCount(resource)} active
                        </Badge>
                      )} */}
                    </div>
                  </div>
                ))}

                {/* Show "See All" button if there are more resources */}
                {totalResources > 3 && (
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSeeAllResources}
                      className="w-full flex items-center gap-2 bg-transparent"
                    >
                      <ExternalLink className="h-4 w-4" />
                      See All Resources ({totalResources})
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Conflict Detection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Conflict Detection
            </CardTitle>
            <CardDescription>How the system prevents booking conflicts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p>• Automatic buffer time enforcement ({BOOKING_RULES.BUFFER_MINUTES} minutes)</p>
              <p>• Real-time availability checking</p>
              <p>• Overlap prevention with existing bookings</p>
              <p>• Future booking validation</p>
              <p>• Cancelled booking exclusion</p>
            </div>
          </CardContent>
        </Card>

        {/* System Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              System Information
            </CardTitle>
            <CardDescription>Current system status and information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">System Status</span>
              <Badge variant="default">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Resources</span>
              <Badge variant="outline">{totalResources}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Bookings</span>
              <Badge variant="outline">{totalActiveBookings}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Resources Loaded</span>
              <Badge variant="outline">
                {resources.length} of {totalResources}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Updated</span>
              <Badge variant="outline">Just now</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Version</span>
              <Badge variant="outline">v1.0.0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Environment</span>
              <Badge variant="outline">Development</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage
