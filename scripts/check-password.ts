import dotenv from "dotenv";
dotenv.config({ path: ".env" }); 
import dbConnect from "../lib/mongodb"
import User from "../models/User"
import bcrypt from "bcryptjs"

async function checkPassword() {
  try {
    await dbConnect()
    
    const user = await User.findOne({ email: "john.smith@college.edu" })
    if (!user) {
      console.log("❌ User not found")
      return
    }

    console.log("✅ User found:")
    console.log("- Email:", user.email)
    console.log("- PasswordHash:", user.passwordHash)
    console.log("- PasswordHash length:", user.passwordHash.length)
    
    // Test direct bcrypt comparison
    console.log("\n🧪 Testing password comparison:")
    const result1 = await bcrypt.compare("tempPassword123", user.passwordHash)
    console.log("- Direct bcrypt.compare('tempPassword123'):", result1)
    
    // Test the model method
    const result2 = await user.comparePassword("tempPassword123")
    console.log("- user.comparePassword('tempPassword123'):", result2)
    
    // Test wrong password
    const result3 = await user.comparePassword("wrongpassword")
    console.log("- user.comparePassword('wrongpassword'):", result3)
    
  } catch (error) {
    console.error("Error:", error)
  }
  process.exit(0)
}

checkPassword()
