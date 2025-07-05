/**
 * Some legacy code imports `sql` from "lib/db".
 * This lightweight module simply re-exports the client
 * created in lib/database.ts so all imports resolve.
 */
export { sql } from "./database"
