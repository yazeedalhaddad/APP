export const config = {
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "fallback-secret-key-change-in-production",
  },
  app: {
    nodeEnv: process.env.NODE_ENV || "development",
  },
} as const

// Validate required environment variables
export function validateEnvironment() {
  const required = ["DATABASE_URL"]
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}
