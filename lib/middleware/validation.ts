import type { NextRequest } from "next/server"
import { z } from "zod"
import { ValidationError } from "@/lib/utils/errors"

export async function validateBody<T>(request: NextRequest, schema: z.ZodSchema<T>): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")
      throw new ValidationError(`Validation failed: ${message}`)
    }
    throw new ValidationError("Invalid request body")
  }
}

export function validateQuery<T>(request: NextRequest, schema: z.ZodSchema<T>): T {
  try {
    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams.entries())
    return schema.parse(query)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")
      throw new ValidationError(`Query validation failed: ${message}`)
    }
    throw new ValidationError("Invalid query parameters")
  }
}
