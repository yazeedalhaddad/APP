import bcrypt from "bcryptjs"
import { sql } from "@/lib/database"

interface UserSeed {
  id: string
  name: string
  email: string
  password: string
  role: string
  department: string
}

const users: UserSeed[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "System Administrator",
    email: "admin@medprep.com",
    password: "Admin123!@#",
    role: "admin",
    department: "IT",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@medprep.com",
    password: "Manager123!@#",
    role: "management",
    department: "Management",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Michael Chen",
    email: "michael.chen@medprep.com",
    password: "Production123!@#",
    role: "production",
    department: "Production",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@medprep.com",
    password: "Lab123!@#",
    role: "lab",
    department: "Laboratory",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "James Wilson",
    email: "james.wilson@medprep.com",
    password: "Production456!@#",
    role: "production",
    department: "Production",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    name: "Dr. Lisa Park",
    email: "lisa.park@medprep.com",
    password: "Lab456!@#",
    role: "lab",
    department: "Laboratory",
  },
]

export async function seedUsers() {
  console.log("Starting user seeding...")

  for (const user of users) {
    try {
      // Check if user already exists
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${user.email}
      `

      if (existingUser.length > 0) {
        console.log(`User ${user.email} already exists, skipping...`)
        continue
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 12)

      // Insert user
      await sql`
        INSERT INTO users (id, name, email, password, role, department, status)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword}, ${user.role}, ${user.department}, 'active')
      `

      console.log(`Created user: ${user.email}`)
    } catch (error) {
      console.error(`Failed to create user ${user.email}:`, error)
    }
  }

  console.log("User seeding completed!")
}

// Run if called directly
if (require.main === module) {
  seedUsers().catch(console.error)
}
