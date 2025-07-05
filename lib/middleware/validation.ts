import type { NextRequest } from "next/server"
import { z } from "zod"

export async function validateBody<T>(request: NextRequest, schema: z.ZodSchema<T>): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")
      throw new Error(`Validation error: ${errorMessage}`)
    }
    throw new Error("Invalid request body")
  }
}

export function validateQuery<T>(searchParams: URLSearchParams, schema: z.ZodSchema<T>): T {
  try {
    const params = Object.fromEntries(searchParams.entries())
    return schema.parse(params)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")
      throw new Error(`Validation error: ${errorMessage}`)
    }
    throw new Error("Invalid query parameters")
  }
}
