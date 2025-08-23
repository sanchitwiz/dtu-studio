import dotenv from "dotenv";
dotenv.config({ path: ".env" }); 
import dbConnect from "../lib/mongodb"
import User from "../models/User"
import bcrypt from "bcryptjs" // Add this import

const seedUsers = [
  {
    name: "John Smith",
    email: "john.smith@college.edu",
    role: "admin",
    password: "tempPassword123", // Keep as password for now
    forcePasswordChange: true,
  },
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@college.edu",
    role: "faculty",
    password: "tempPassword123",
    forcePasswordChange: true,
  },
  {
    name: "Mike Davis",
    email: "mike.davis@college.edu",
    role: "faculty",
    password: "tempPassword123",
    forcePasswordChange: true,
  },
  {
    name: "Emily Chen",
    email: "emily.chen@college.edu",
    role: "faculty",
    password: "tempPassword123",
    forcePasswordChange: true,
  },
  {
    name: "David Wilson",
    email: "david.wilson@college.edu",
    role: "admin",
    password: "tempPassword123",
    forcePasswordChange: true,
  },
  {
    name: "Sanchit Vohra",
    email: "sanchitvohra_23ec179@dtu.ac.in",
    role: "admin",
    password: "tempPassword123",
    forcePasswordChange: true,
  }
]

async function seedDatabase() {
  try {
    await dbConnect()

    // Clear existing users
    await User.deleteMany({})
    console.log("Cleared existing users")

    // Hash password and insert seed users
    const usersWithHashedPasswords = await Promise.all(
      seedUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(user.password, salt)
        
        return {
          name: user.name,
          email: user.email,
          role: user.role,
          passwordHash: passwordHash, // Use hashed password
          forcePasswordChange: user.forcePasswordChange,
        }
      })
    )

    // Insert the users
    const users = await User.insertMany(usersWithHashedPasswords)
    console.log(`Seeded ${users.length} users:`)
    users.forEach((user) => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`)
    })

    console.log("\nAll users have temporary password: tempPassword123")
    console.log("They will be forced to change password on first login")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    return
  }
}

seedDatabase()
