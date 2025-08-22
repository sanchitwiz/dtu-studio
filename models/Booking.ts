import mongoose, { type Document, Schema } from "mongoose"

export interface IBooking extends Document {
  slotId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  department: string
  purpose: string
  override: boolean
}

const BookingSchema = new Schema<IBooking>(
  {
    slotId: {
      type: Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    override: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Prevent double booking - one user cannot book the same slot twice
BookingSchema.index({ slotId: 1, userId: 1 }, { unique: true })

export default mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema)
