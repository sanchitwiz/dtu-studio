import mongoose from "mongoose"

declare global {
  var mongooseConnection: {
    conn: mongoose.Connection | null
    promise: Promise<mongoose.Connection> | null
  }
}

export {}
