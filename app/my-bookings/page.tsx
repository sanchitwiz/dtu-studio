"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { AuthGuard } from "../../components/auth-guard"
import { Navigation } from "../../components/navigation"
import { PageTransition } from "../../components/ui/page-transition"
import { AnimatedCard } from "../../components/ui/animated-card"
import { toast } from "sonner"  // ✅ Replace useToast with sonner
import axios from "axios"  // ✅ Added axios import
import { Clock, Calendar, MapPin, FileText, Trash2, BookOpen } from "lucide-react"
import { format } from "date-fns"

interface BookingData {
  _id: string
  department: string
  purpose: string
  override: boolean
  createdAt: string
  slotId: {
    _id: string
    date: string
    startTime: string
    endTime: string
  }
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState<{[key: string]: boolean}>({})
  // ✅ Removed const { toast } = useToast()

  const fetchBookings = async () => {
    try {
      // ✅ Using axios instead of fetch
      const response = await axios.get("/api/bookings")
      setBookings(response.data)  // ✅ Axios automatically parses JSON
      
    } catch (error) {
      console.error("Error fetching bookings:", error)
      
      // ✅ Enhanced error handling with axios
      if (axios.isAxiosError(error)) {
        toast.error("Failed to load bookings", {
          description: error.response?.data?.error || "Unable to fetch your bookings",
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

  const handleCancelBooking = async (bookingId: string) => {
    setCancelLoading(prev => ({ ...prev, [bookingId]: true }))
    
    try {
      // ✅ Using axios DELETE request
      await axios.delete(`/api/bookings/${bookingId}`)

      // ✅ Updated to use Sonner success toast
      toast.success("Booking Cancelled", {
        description: "Your booking has been successfully cancelled.",
      })
      
      fetchBookings()

    } catch (error) {
      console.error("Cancel booking error:", error)
      
      // ✅ Enhanced error handling with axios
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Failed to cancel booking"
        toast.error("Cancellation Failed", {
          description: errorMessage,
        })
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while cancelling the booking",
        })
      }
    } finally {
      setCancelLoading(prev => ({ ...prev, [bookingId]: false }))
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Navigation />
        <PageTransition>
          <div className="container mx-auto p-6">
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                My Bookings
              </h1>
              <p className="text-muted-foreground">View and manage your scheduled bookings</p>
            </motion.div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="inline-block"
                  >
                    <BookOpen className="h-8 w-8 text-primary" />
                  </motion.div>
                  <p className="mt-4 text-muted-foreground">Loading bookings...</p>
                </motion.div>
              ) : bookings.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <AnimatedCard>
                    <CardContent className="text-center py-12">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      </motion.div>
                      <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't made any bookings. Visit the schedule page to book time slots.
                      </p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button onClick={() => (window.location.href = "/schedule")}>Go to Schedule</Button>
                      </motion.div>
                    </CardContent>
                  </AnimatedCard>
                </motion.div>
              ) : (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-4"
                >
                  {bookings.map((booking, index) => (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="transition-all duration-200"
                    >
                      <Card className="bg-card/50 backdrop-blur-sm hover:bg-card/80">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-primary" />
                              {format(new Date(booking.slotId.date), "EEEE, MMMM d, yyyy")}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              {booking.override && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                  <Badge variant="secondary">Override</Badge>
                                </motion.div>
                              )}
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelBooking(booking._id)}
                                  disabled={cancelLoading[booking._id]}  // ✅ Added loading state
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  {cancelLoading[booking._id] ? "Cancelling..." : "Cancel"}
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                          <CardDescription>
                            Booked on {format(new Date(booking.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <motion.div
                              className="flex items-center gap-2"
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.1 + 0.1 }}
                            >
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {booking.slotId.startTime} - {booking.slotId.endTime}
                              </span>
                            </motion.div>
                            <motion.div
                              className="flex items-center gap-2"
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.1 + 0.2 }}
                            >
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.department}</span>
                            </motion.div>
                            <motion.div
                              className="flex items-center gap-2"
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.1 + 0.3 }}
                            >
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{booking.purpose}</span>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </PageTransition>
      </div>
    </AuthGuard>
  )
}
