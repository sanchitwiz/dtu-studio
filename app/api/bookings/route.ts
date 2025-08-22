import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "../../../lib/mongodb"
import Booking from "../../../models/Booking"
import Slot from "../../../models/Slot"
import { authOptions } from "../../../lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { id?: string } }
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slotId, department, purpose } = await request.json()

    if (!slotId || !department || !purpose) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    // Check if slot exists and has capacity
    const slot = await Slot.findById(slotId)
    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 })
    }

    // Check if user already booked this slot
    const existingBooking = await Booking.findOne({
      slotId,
      userId: session.user.id,
    })

    if (existingBooking) {
      return NextResponse.json({ error: "You have already booked this slot" }, { status: 400 })
    }

    // Check capacity
    const bookingCount = await Booking.countDocuments({ slotId })
    if (bookingCount >= slot.capacity) {
      return NextResponse.json({ error: "Slot is fully booked" }, { status: 400 })
    }

    // Create booking
    const booking = await Booking.create({
      slotId,
      userId: session.user.id,
      department,
      purpose,
      override: false,
    })

    return NextResponse.json({ message: "Booking created successfully", booking })
  } catch (error) {
    console.error("Create booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { id?: string } }
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const bookings = await Booking.find({ userId: session.user.id }).populate("slotId").sort({ createdAt: -1 })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Get bookings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
