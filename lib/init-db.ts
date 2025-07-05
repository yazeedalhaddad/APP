import { sql } from "./database"

export async function initializeDatabase() {
  try {
    console.log("Initializing database...")

    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    if (tables.length === 0) {
      console.log("No tables found. Database needs to be initialized.")
      console.log("Please run the SQL scripts in the scripts/ folder:")
      console.log("1. scripts/001-create-tables.sql")
      console.log("2. scripts/002-seed-data.sql")
      return false
    }

    console.log("Database initialized successfully")
    return true
  } catch (error) {
    console.error("Database initialization error:", error)
    return false
  }
}

export async function checkDatabaseHealth() {
  try {
    await sql`SELECT 1`
    return { healthy: true, message: "Database connection successful" }
  } catch (error) {
    return {
      healthy: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
