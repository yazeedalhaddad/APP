import { sql } from "@/lib/database"

export async function initializeDatabase() {
  try {
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    console.log(
      "Existing tables:",
      tables.map((t) => t.table_name),
    )

    if (tables.length === 0) {
      console.log("No tables found. Database needs to be initialized.")
      console.log("Please run the SQL scripts in the /scripts folder to set up the database.")
    } else {
      console.log("Database appears to be initialized.")
    }

    return { success: true, tableCount: tables.length }
  } catch (error) {
    console.error("Error checking database:", error)
    return { success: false, error: error.message }
  }
}
