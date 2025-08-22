"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { toast } from "sonner"  // ✅ Replace useToast with sonner
import axios from "axios"  // ✅ Added axios import
import { Calendar, Clock, MapPin, FileText, Trash2, Shield } from "lucide-react"
import { format } from "date-fns"

interface BookingData {
  _id: string
  department: string
  purpose: string
  override: boolean
  createdAt: string
  slot: {
    _id: string
    date: string
    startTime: string
    endTime: string
  }
  user: {
    _id: string
    name: string
    email: string
  }
}

export function BookingManagement() {
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    department: "",
  })
  // ✅ Removed const { toast } = useToast()

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      // ✅ Using axios with query parameters
      const params = new URLSearchParams()
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)
      if (filters.department) params.append("department", filters.department)

      const response = await axios.get(`/api/admin/bookings?${params}`)
      setBookings(response.data)  // ✅ Axios automatically parses JSON
      
    } catch (error) {
      console.error("Error fetching bookings:", error)
      
      if (axios.isAxiosError(error)) {
        toast.error("Failed to load bookings", {
          description: error.response?.data?.error || "Unable to fetch bookings",
        })
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while loading bookings",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      // ✅ Using axios DELETE request
      await axios.delete(`/api/admin/bookings/${bookingId}`)

      // ✅ Updated to use Sonner success toast
      toast.success("Booking Deleted", {
        description: "Booking has been successfully deleted.",
      })
      
      fetchBookings()

    } catch (error) {
      console.error("Delete booking error:", error)
      
      // ✅ Enhanced error handling with axios
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Failed to delete booking"
        toast.error("Delete Failed", {
          description: errorMessage,
        })
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while deleting the booking",
        })
      }
    }
  }

  const handleToggleOverride = async (bookingId: string, currentOverride: boolean) => {
    try {
      // ✅ Using axios PATCH request
      await axios.patch(`/api/admin/bookings/${bookingId}`, {
        override: !currentOverride,
      })

      // ✅ Updated to use Sonner success toast
      toast.success("Booking Updated", {
        description: `Override ${!currentOverride ? "enabled" : "disabled"} for booking.`,
      })
      
      fetchBookings()

    } catch (error) {
      console.error("Toggle override error:", error)
      
      // ✅ Enhanced error handling with axios
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Failed to update booking"
        toast.error("Update Failed", {
          description: errorMessage,
        })
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while updating the booking",
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Bookings</CardTitle>
          <CardDescription>Filter bookings by date range and department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input
                placeholder="Filter by department..."
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchBookings} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>View and manage all system bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No bookings found</div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{booking.user.name}</h3>
                      <Badge variant="outline">{booking.user.email}</Badge>
                      {booking.override && <Badge variant="secondary">Override</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleOverride(booking._id, booking.override)}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        {booking.override ? "Remove Override" : "Add Override"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBooking(booking._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(booking.slot.date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {booking.slot.startTime} - {booking.slot.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{booking.purpose}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    Booked on {format(new Date(booking.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
