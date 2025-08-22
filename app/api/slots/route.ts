import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "../../../lib/mongodb"
import Slot from "../../../models/Slot"
import Booking from "../../../models/Booking"
import { authOptions } from "../../../lib/auth"
import { Session } from "next-auth"

export async function GET(request: NextRequest) {
  try {
    const session : Session|null = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ error: "Date parameter required" }, { status: 400 })
    }

    await dbConnect()

    // Get slots for the specific date
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const slots = await Slot.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ startTime: 1 })

    // Get booking counts for each slot
    const slotsWithBookings = await Promise.all(
      slots.map(async (slot) => {
        const bookingCount = await Booking.countDocuments({ slotId: slot._id })
        const userBooking = await Booking.findOne({
          slotId: slot._id,
          userId: (session.user?.id),
        })

        return {
          _id: slot._id,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          capacity: slot.capacity,
          bookingCount,
          available: bookingCount < slot.capacity,
          userBooked: !!userBooking,
        }
      }),
    )

    return NextResponse.json(slotsWithBookings)
  } catch (error) {
    console.error("Get slots error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
