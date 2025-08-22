import NextAuth from "next-auth"
import { authOptions } from "../../../../lib/auth"

// Type assertion workaround for NextAuth callable issue
const NextAuthHandler = NextAuth as any
const handler = NextAuthHandler(authOptions)

export { handler as GET, handler as POST }
