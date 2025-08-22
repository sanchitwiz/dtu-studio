import dotenv from "dotenv";
dotenv.config({ path: ".env" }); 
import dbConnect from "../lib/mongodb"
import User from "../models/User"

async function listUsers() {
  try {
    await dbConnect()
    console.log("🔌 Connected to database")
    
    const users = await User.find({})
    console.log(`📊 Total users in database: ${users.length}`)
    
    if (users.length === 0) {
      console.log("❌ No users found! Seeding might have failed.")
    } else {
      console.log("\n👥 Users in database:")
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: "${user.email}"`)
        console.log(`   Name: ${user.name}`)
        console.log(`   Role: ${user.role}`)
        console.log(`   HasPassword: ${user.passwordHash ? 'YES' : 'NO'}`)
        console.log('---')
      })
    }
    
  } catch (error) {
    console.error("Error:", error)
  }
  process.exit(0)
}

listUsers()
