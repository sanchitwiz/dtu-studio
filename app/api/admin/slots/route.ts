import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "../../../../lib/mongodb"
import Slot from "../../../../models/Slot"
import { authOptions } from "../../../../lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { id?: string; role?: string } }
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { date, startTime, endTime, capacity } = await request.json()

    if (!date || !startTime || !endTime || !capacity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    // Check for existing slot at same date/time
    const existingSlot = await Slot.findOne({
      date: new Date(date),
      startTime,
      endTime,
    })

    if (existingSlot) {
      return NextResponse.json({ error: "Slot already exists for this time" }, { status: 400 })
    }

    const slot = await Slot.create({
      date: new Date(date),
      startTime,
      endTime,
      capacity: Number.parseInt(capacity),
      createdBy: session.user.id,
    })

    return NextResponse.json({ message: "Slot created successfully", slot })
  } catch (error) {
    console.error("Create slot error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { id?: string; role?: string } }
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    await dbConnect()

    let query = {}
    if (startDate && endDate) {
      query = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      }
    }

    const slots = await Slot.find(query).populate("createdBy", "name email").sort({ date: 1, startTime: 1 })

    return NextResponse.json(slots)
  } catch (error) {
    console.error("Get slots error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
