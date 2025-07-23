"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Clock,
  Shield,
  Calendar,
  MapPin,
  Loader2,
  AlertCircle,
  ExternalLink,
  Settings,
  Activity,
  CheckCircle,
  Zap,
  Database,
  Globe,
} from "lucide-react"
import { BOOKING_RULES } from "@/constants/resources"
import type { Resource } from "@/types/resources"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useGetAllResourcesQuery } from "@/redux/api/resourceApi"

export function SettingsPage() {
  const { data: resourcesResponse, isLoading: isLoadingResources, error } = useGetAllResourcesQuery({})
  const router = useRouter()

  // Extract resources array from API response with optional chaining
  const resources: Resource[] = resourcesResponse?.data?.data || []
  const totalResources = resourcesResponse?.data?.meta?.total || resources?.length || 0
  const currentPage = resourcesResponse?.data?.meta?.page || 1
  const limit = resourcesResponse?.data?.meta?.limit || 10

  // Calculate active bookings for each resource (excluding cancelled)
  const getActiveBookingsCount = (resource: Resource) => {
    if (!resource?.bookings) return 0
    return resource.bookings.filter((booking) => booking?.status !== "cancelled").length
  }

  // Calculate total active bookings across all resources
  const totalActiveBookings =
    resources?.reduce((total, resource) => {
      return total + getActiveBookingsCount(resource)
    }, 0) || 0

  const handleSeeAllResources = () => {
    router.push("/resources")
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl -z-10"></div>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl mb-6 shadow-lg">
          <Settings className="h-10 w-10" />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed">
            Manage your <span className="font-semibold text-purple-600">booking system configuration</span>, view{" "}
            <span className="font-semibold text-blue-600">system rules</span>, and monitor{" "}
            <span className="font-semibold text-green-600">resource status</span>.
          </p>
        </div>
      </div>
      {/* Additional System Stats */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">System Performance</h3>
            <div className="grid gap-6 md:grid-cols-4 mt-8">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">99.9%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Uptime</div>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">&lt;100ms</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Response Time</div>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Database className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">100%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Data Integrity</div>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Security Issues</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Booking Rules Card */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>

            <div className="relative z-10">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                Booking Rules
              </CardTitle>
              <CardDescription className="text-blue-100 text-base mt-2">
                Current system rules and limitations for all bookings
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6 relative">
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all duration-200">
                <span className="text-base font-medium text-blue-900 dark:text-blue-100">Minimum booking duration</span>
                <Badge className="bg-blue-500 text-white text-sm px-3 py-1 shadow-sm">
                  {BOOKING_RULES?.MIN_DURATION_MINUTES || 30} minutes
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-white dark:bg-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all duration-200">
                <span className="text-base font-medium text-blue-900 dark:text-blue-100">Maximum booking duration</span>
                <Badge className="bg-blue-500 text-white text-sm px-3 py-1 shadow-sm">
                  {BOOKING_RULES?.MAX_DURATION_HOURS || 8} hours
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-white dark:bg-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all duration-200">
                <span className="text-base font-medium text-blue-900 dark:text-blue-100">Buffer time</span>
                <Badge className="bg-blue-500 text-white text-sm px-3 py-1 shadow-sm">
                  {BOOKING_RULES?.BUFFER_MINUTES || 15} minutes
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-white dark:bg-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all duration-200">
                <span className="text-base font-medium text-blue-900 dark:text-blue-100">Advance booking limit</span>
                <Badge className="bg-blue-500 text-white text-sm px-3 py-1 shadow-sm">
                  {BOOKING_RULES?.ADVANCE_BOOKING_DAYS || 30} days
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Resources Card */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>

            <div className="relative z-10">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                Available Resources
              </CardTitle>
              <CardDescription className="text-green-100 text-base mt-2">
                Resources available for booking ({totalResources} total)
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6 relative">
            {isLoadingResources ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <span className="text-green-700 dark:text-green-300 font-medium">Loading resources...</span>
                </div>
              </div>
            ) : error ? (
              <Alert className="border-0 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200 font-medium">
                  Failed to load resources. Please try again later.
                </AlertDescription>
              </Alert>
            ) : resources?.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-green-600 dark:text-green-400 font-medium">No resources available</p>
                <p className="text-green-500 dark:text-green-500 text-sm mt-1">Add resources to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show first few resources */}
                {resources?.slice(0, 3)?.map((resource) => (
                  <div
                    key={resource?.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-green-800/30 rounded-xl border border-green-200 dark:border-green-700 hover:shadow-md transition-all duration-200"
                  >
                    <span className="text-base font-medium text-green-900 dark:text-green-100 truncate flex-1 mr-4">
                      {resource?.name || "Unknown Resource"}
                    </span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge className="bg-green-500 text-white shadow-sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                      {resource?.bookings && getActiveBookingsCount(resource) > 0 && (
                        <Badge
                          variant="outline"
                          className="text-green-700 dark:text-green-300 border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/30"
                        >
                          {getActiveBookingsCount(resource)} active
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}

                {/* Show "See All" button if there are more resources */}
                {totalResources > 3 && (
                  <div className="pt-4 border-t border-green-200 dark:border-green-700">
                    <Button
                      variant="outline"
                      onClick={handleSeeAllResources}
                      className="w-full flex items-center gap-3 bg-white dark:bg-green-800/30 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/50 hover:border-green-400 dark:hover:border-green-500 transition-all duration-200 h-12"
                    >
                      <ExternalLink className="h-4 w-4" />
                      See All Resources ({totalResources})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conflict Detection Card */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>

            <div className="relative z-10">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                Conflict Detection
              </CardTitle>
              <CardDescription className="text-orange-100 text-base mt-2">
                How the system prevents booking conflicts automatically
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6 relative">
            <div className="space-y-4">
              {[
                `Automatic buffer time enforcement (${BOOKING_RULES?.BUFFER_MINUTES || 15} minutes)`,
                "Real-time availability checking",
                "Overlap prevention with existing bookings",
                "Future booking validation",
                "Cancelled booking exclusion",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-orange-800/30 rounded-xl border border-orange-200 dark:border-orange-700 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-base text-orange-900 dark:text-orange-100">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Information Card */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>

            <div className="relative z-10">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                System Information
              </CardTitle>
              <CardDescription className="text-purple-100 text-base mt-2">
                Current system status and performance metrics
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6 relative">
            <div className="space-y-5">
              {[
                { label: "System Status", value: "Online", icon: Globe, color: "green" },
                { label: "Total Resources", value: totalResources.toString(), icon: MapPin, color: "blue" },
                { label: "Active Bookings", value: totalActiveBookings.toString(), icon: Calendar, color: "orange" },
                {
                  label: "Resources Loaded",
                  value: `${resources?.length || 0} of ${totalResources}`,
                  icon: Database,
                  color: "purple",
                },
                { label: "Last Updated", value: "Just now", icon: Clock, color: "green" },
                { label: "Version", value: "v1.0.0", icon: Zap, color: "blue" },
                { label: "Environment", value: "Development", icon: Settings, color: "orange" },
              ].map((item, index) => {
                const IconComponent = item.icon
                const colorClasses = {
                  green: "bg-green-500 text-white",
                  blue: "bg-blue-500 text-white",
                  orange: "bg-orange-500 text-white",
                  purple: "bg-purple-500 text-white",
                }

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white dark:bg-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-700 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[item.color as keyof typeof colorClasses]}`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="text-base font-medium text-purple-900 dark:text-purple-100">{item.label}</span>
                    </div>
                    <Badge className="bg-purple-500 text-white text-sm px-3 py-1 shadow-sm">{item.value}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      
    </div>
  )
}

export default SettingsPage
