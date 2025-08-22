import mongoose, { type Document, Schema } from "mongoose"

export interface ISlot extends Document {
  date: Date
  startTime: string
  endTime: string
  capacity: number
  createdBy: mongoose.Types.ObjectId
}

const SlotSchema = new Schema<ISlot>(
  {
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to prevent duplicate slots for same date/time
SlotSchema.index({ date: 1, startTime: 1, endTime: 1 }, { unique: true })

export default mongoose.models.Slot || mongoose.model<ISlot>("Slot", SlotSchema)
