import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "../../../../lib/mongodb"
import Booking from "../../../../models/Booking"
import { authOptions } from "../../../../lib/auth"

export async function DELETE(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as { user?: { id: string; role?: string } }
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // ✅ Await params before accessing properties
    const { id } = await context.params

    const booking = await Booking.findById(id)
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Only allow users to cancel their own bookings (unless admin)
    if (booking.userId.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await Booking.findByIdAndDelete(id)

    return NextResponse.json({ message: "Booking cancelled successfully" })
  } catch (error) {
    console.error("Cancel booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
