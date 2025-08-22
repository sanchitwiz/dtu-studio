import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "../../../../../lib/mongodb"
import Booking from "../../../../../models/Booking"
import { authOptions } from "../../../../../lib/auth"

export async function DELETE(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions) as { user?: { id?: string; role?: string } }
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    
    // ✅ Await context.params directly
    const { id } = await context.params
    
    await Booking.findByIdAndDelete(id)

    return NextResponse.json({ message: "Booking deleted successfully" })
  } catch (error) {
    console.error("Delete booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: any) {
  try {
    const session = await getServerSession(authOptions) as { user?: { id?: string; role?: string } }
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { override } = await request.json()

    await dbConnect()
    
    // ✅ Await context.params directly
    const { id } = await context.params
    
    const booking = await Booking.findByIdAndUpdate(id, { override }, { new: true })

    return NextResponse.json({ message: "Booking updated successfully", booking })
  } catch (error) {
    console.error("Update booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
