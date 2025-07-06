/**
 * Database client re-export
 * Some legacy code imports `sql` from "lib/db" instead of "lib/database"
 * This file provides compatibility by re-exporting the database client
 */
export * from "./database"
export { sql } from "./database"
