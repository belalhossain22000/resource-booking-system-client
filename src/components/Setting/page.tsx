"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Shield, Calendar, MapPin } from "lucide-react"
import { BOOKING_RULES, RESOURCES } from "@/constants/resources"


export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">System configuration and booking rules</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Available Resources
            </CardTitle>
            <CardDescription>Resources available for booking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {RESOURCES.map((resource) => (
              <div key={resource} className="flex items-center justify-between">
                <span className="text-sm">{resource}</span>
                <Badge variant="secondary">Active</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

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
              <p>• Automatic buffer time enforcement</p>
              <p>• Real-time availability checking</p>
              <p>• Overlap prevention with existing bookings</p>
              <p>• Future booking validation</p>
            </div>
          </CardContent>
        </Card>

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
