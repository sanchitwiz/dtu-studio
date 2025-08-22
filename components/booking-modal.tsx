"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { toast } from "sonner"
import axios from "axios"  // ✅ Added axios import
import { Loader2, Calendar, Clock } from "lucide-react"

interface SlotData {
  _id: string
  date: string
  startTime: string
  endTime: string
  capacity: number
  bookingCount: number
}

interface BookingModalProps {
  slot: SlotData | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BookingModal({ slot, isOpen, onClose, onSuccess }: BookingModalProps) {
  const [department, setDepartment] = useState("")
  const [purpose, setPurpose] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slot) return

    setIsLoading(true)

    try {
      // ✅ Using axios instead of fetch
      const response = await axios.post("/api/bookings", {
        slotId: slot._id,
        department,
        purpose,
      })

      // ✅ Success - axios automatically parses JSON
      toast.success("Booking Confirmed", {
        description: "Your time slot has been successfully booked.",
      })
      
      setDepartment("")
      setPurpose("")
      onSuccess()

    } catch (error) {
      console.error("Booking error:", error)
      
      // ✅ Enhanced error handling with axios
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Failed to book the time slot"
        toast.error("Booking Failed", {
          description: errorMessage,
        })
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while booking the slot",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setDepartment("")
    setPurpose("")
    onClose()
  }

  if (!slot) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Book Time Slot
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {slot.startTime} - {slot.endTime} on {new Date(slot.date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4 mt-4"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              className="space-y-2"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Photography, Videography, Marketing"
                required
                disabled={isLoading}
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Brief description of what you'll be doing..."
                required
                disabled={isLoading}
                rows={3}
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </motion.div>

            <motion.div
              className="flex justify-end gap-2 pt-4"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button type="submit" disabled={isLoading}>
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                      >
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </motion.div>
                    ) : (
                      <motion.span key="book" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        Book Slot
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </motion.div>
          </motion.form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
