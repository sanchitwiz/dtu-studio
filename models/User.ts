import mongoose, { type Document, Schema } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
  name: string
  email: string
  role: "faculty" | "admin"
  passwordHash: string
  forcePasswordChange: boolean
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["faculty", "admin"],
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    forcePasswordChange: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash)
}

UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next()

  const salt = await bcrypt.genSalt(12)
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
  next()
})

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
