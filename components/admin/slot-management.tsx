"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { toast } from "sonner"  // ✅ Replace useToast with sonner
import axios from "axios"  // ✅ Added axios import
import { Calendar, Clock, Users, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface SlotData {
  _id: string
  date: string
  startTime: string
  endTime: string
  capacity: number
  createdBy: {
    name: string
    email: string
  }
}

interface SlotManagementProps {
  onStatsUpdate: () => void
}

export function SlotManagement({ onStatsUpdate }: SlotManagementProps) {
  const [slots, setSlots] = useState<SlotData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<{[key: string]: boolean}>({})
  // ✅ Removed const { toast } = useToast()

  // Form state
  const [newSlot, setNewSlot] = useState({
    date: "",
    startTime: "",
    endTime: "",
    capacity: "",
  })

  const fetchSlots = async () => {
    setIsLoading(true)
    try {
      // ✅ Using axios instead of fetch
      const response = await axios.get("/api/admin/slots")
      setSlots(response.data)  // ✅ Axios automatically parses JSON
      
    } catch (error) {
      console.error("Error fetching slots:", error)
      
      // ✅ Enhanced error handling with axios
      if (axios.isAxiosError(error)) {
        toast.error("Failed to load slots", {
          description: error.response?.data?.error || "Unable to fetch slots",
        })
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while loading slots",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [])

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      // ✅ Using axios POST request
      await axios.post("/api/admin/slots", newSlot)

      // ✅ Updated to use Sonner success toast
      toast.success("Slot Created", {
        description: "New time slot has been successfully created.",
      })
      
      setNewSlot({ date: "", startTime: "", endTime: "", capacity: "" })
      fetchSlots()
      onStatsUpdate()

    } catch (error) {
      console.error("Create slot error:", error)
      
      // ✅ Enhanced error handling with axios
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Failed to create slot"
        toast.error("Creation Failed", {
          description: errorMessage,
        })
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while creating the slot",
        })
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    setDeleteLoading(prev => ({ ...prev, [slotId]: true }))
    
    try {
      // ✅ Using axios DELETE request
      await axios.delete(`/api/admin/slots/${slotId}`)

      // ✅ Updated to use Sonner success toast
      toast.success("Slot Deleted", {
        description: "Time slot and associated bookings have been deleted.",
      })
      
      fetchSlots()
      onStatsUpdate()

    } catch (error) {
      console.error("Delete slot error:", error)
      
      // ✅ Enhanced error handling with axios
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Failed to delete slot"
        toast.error("Delete Failed", {
          description: errorMessage,
        })
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred while deleting the slot",
        })
      }
    } finally {
      setDeleteLoading(prev => ({ ...prev, [slotId]: false }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Create New Slot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Slot
          </CardTitle>
          <CardDescription>Add a new time slot for booking</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSlot} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                required
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={newSlot.startTime}
                onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                required
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={newSlot.endTime}
                onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                required
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={newSlot.capacity}
                onChange={(e) => setNewSlot({ ...newSlot, capacity: e.target.value })}
                required
                disabled={isCreating}
              />
            </div>

            <div className="flex items-end">
              <Button type="submit" disabled={isCreating} className="w-full">
                {isCreating ? "Creating..." : "Create Slot"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Slots */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Slots</CardTitle>
          <CardDescription>Manage existing time slots</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading slots...</div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No slots created yet</div>
          ) : (
            <div className="space-y-3">
              {slots.map((slot) => (
                <div key={slot._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{format(new Date(slot.date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Capacity: {slot.capacity}</span>
                    </div>
                    <Badge variant="outline">By: {slot.createdBy.name}</Badge>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSlot(slot._id)}
                    disabled={deleteLoading[slot._id]}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleteLoading[slot._id] && <span className="ml-1">...</span>}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
