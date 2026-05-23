import type { ZodError } from "zod";

export function zodFirstError(error: ZodError, fallback = "Validation failed") {
  return error.issues[0]?.message ?? fallback;
}
