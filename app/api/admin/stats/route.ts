import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "../../../../lib/mongodb"
import Slot from "../../../../models/Slot"
import Booking from "../../../../models/Booking"
import User from "../../../../models/User"
import { authOptions } from "../../../../lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { id?: string, role?: string } }
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalSlots, totalBookings, upcomingSlots, totalUsers] = await Promise.all([
      Slot.countDocuments(),
      Booking.countDocuments(),
      Slot.countDocuments({ date: { $gte: today } }),
      User.countDocuments({ role: "faculty" }),
    ])

    // Get booking rate
    const totalCapacity = await Slot.aggregate([{ $group: { _id: null, totalCapacity: { $sum: "$capacity" } } }])

    const bookingRate = totalCapacity[0]?.totalCapacity
      ? Math.round((totalBookings / totalCapacity[0].totalCapacity) * 100)
      : 0

    return NextResponse.json({
      totalSlots,
      totalBookings,
      upcomingSlots,
      totalUsers,
      bookingRate,
    })
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
