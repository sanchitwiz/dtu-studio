import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "../../../../lib/mongodb"
import Booking from "../../../../models/Booking"
import { authOptions } from "../../../../lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { id?: string; role?: string } }
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const department = searchParams.get("department")

    await dbConnect()

    const matchQuery: any = {}

    // Build aggregation pipeline to filter by slot date
    const pipeline: any[] = [
      {
        $lookup: {
          from: "slots",
          localField: "slotId",
          foreignField: "_id",
          as: "slot",
        },
      },
      {
        $unwind: "$slot",
      },
    ]

    // Add date filter if provided
    if (startDate && endDate) {
      matchQuery["slot.date"] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    // Add department filter if provided
    if (department) {
      matchQuery.department = { $regex: department, $options: "i" }
    }

    if (Object.keys(matchQuery).length > 0) {
      pipeline.push({ $match: matchQuery })
    }

    // Populate user information
    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $sort: { "slot.date": -1, "slot.startTime": -1 },
      },
    )

    const bookings = await Booking.aggregate(pipeline)

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Get admin bookings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
