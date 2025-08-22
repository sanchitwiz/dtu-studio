import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "../../../../../lib/mongodb"
import Slot from "../../../../../models/Slot"
import Booking from "../../../../../models/Booking"
import { authOptions } from "../../../../../lib/auth"

export async function DELETE(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions) as { user?: { id?: string, role?: string } }
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // ✅ Await context.params directly
    const { id } = await context.params

    // Delete all bookings for this slot first
    await Booking.deleteMany({ slotId: id })

    // Delete the slot
    await Slot.findByIdAndDelete(id)

    return NextResponse.json({ message: "Slot and associated bookings deleted successfully" })
  } catch (error) {
    console.error("Delete slot error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
