"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { Calendar } from "../../components/ui/calendar"
import { CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { AuthGuard } from "../../components/auth-guard"
import { BookingModal } from "../../components/booking-modal"
import { Navigation } from "../../components/navigation"
import { PageTransition } from "../../components/ui/page-transition"
import { AnimatedCard } from "../../components/ui/animated-card"
import { Clock, Users, CalendarIcon, Sparkles } from "lucide-react"
import { format } from "date-fns"

interface SlotData {
  _id: string
  date: string
  startTime: string
  endTime: string
  capacity: number
  bookingCount: number
  available: boolean
  userBooked: boolean
}

export default function SchedulePage() {
  const { data: session } = useSession()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [slots, setSlots] = useState<SlotData[]>([])
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchSlots = async (date: Date) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/slots?date=${format(date, "yyyy-MM-dd")}`)
      if (response.ok) {
        const data = await response.json()
        setSlots(data)
      }
    } catch (error) {
      console.error("Error fetching slots:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots(selectedDate)
  }, [selectedDate])

  const handleBookSlot = (slot: SlotData) => {
    setSelectedSlot(slot)
    setIsBookingModalOpen(true)
  }

  const handleBookingSuccess = () => {
    fetchSlots(selectedDate)
    setIsBookingModalOpen(false)
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
                Schedule Booking
              </h1>
              <p className="text-muted-foreground">Select a date and book available time slots</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <AnimatedCard className="lg:col-span-1" delay={0.1}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    Select Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-md border"
                  />
                </CardContent>
              </AnimatedCard>

              {/* Available Slots */}
              <AnimatedCard className="lg:col-span-2" delay={0.2}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Available Slots
                  </CardTitle>
                  <CardDescription>{format(selectedDate, "EEEE, MMMM d, yyyy")}</CardDescription>
                </CardHeader>
                <CardContent>
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
                          <Sparkles className="h-6 w-6 text-primary" />
                        </motion.div>
                        <p className="mt-2 text-muted-foreground">Loading slots...</p>
                      </motion.div>
                    ) : slots.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No slots available for this date</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="slots"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        {slots.map((slot, index) => (
                          <motion.div
                            key={slot._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                            className="flex items-center justify-between p-4 border rounded-lg bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {slot.bookingCount}/{slot.capacity}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {slot.userBooked ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                  <Badge variant="secondary">Booked</Badge>
                                </motion.div>
                              ) : slot.available ? (
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button onClick={() => handleBookSlot(slot)} size="sm">
                                    Book Slot
                                  </Button>
                                </motion.div>
                              ) : (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                  <Badge variant="destructive">Full</Badge>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </AnimatedCard>
            </div>
          </div>
        </PageTransition>

        <BookingModal
          slot={selectedSlot}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      </div>
    </AuthGuard>
  )
}
