import { z } from 'zod'

// Schema for individual receipt item (following Makro format)
export const receiptItemSchema = z.object({
  "#": z.number().int().positive("Item number must be positive integer"),
  Qty: z.number().positive("Quantity must be positive number"),
  Unit: z.string().min(1, "Unit cannot be empty").max(20, "Unit too long"),
  Price: z.number().nonnegative("Price must be non-negative"),
  Art: z.string().max(50, "Article number too long"),
  Item: z.string().min(1, "Item name cannot be empty").max(200, "Item name too long"),
  Net: z.number().nonnegative("Net amount must be non-negative"),
  VAT: z.number().nonnegative("VAT must be non-negative"),
  Total: z.number().nonnegative("Total must be non-negative")
})

// Schema for receipt data (array of items)
export const receiptDataSchema = z.array(receiptItemSchema)
  .min(1, "Receipt must contain at least one item")
  .max(1000, "Receipt cannot contain more than 1000 items")

// Schema for API request validation
export const updateReceiptRequestSchema = z.object({
  session_id: z.string().uuid("Invalid session ID format"),
  data: receiptDataSchema
})

// Schema for session ID validation
export const sessionIdSchema = z.string().uuid("Invalid session ID format")

// Type exports for TypeScript
export type ReceiptItem = z.infer<typeof receiptItemSchema>
export type ReceiptData = z.infer<typeof receiptDataSchema>
export type UpdateReceiptRequest = z.infer<typeof updateReceiptRequestSchema>

// Validation functions
export function validateReceiptItem(item: unknown): ReceiptItem {
  return receiptItemSchema.parse(item)
}

export function validateReceiptData(data: unknown): ReceiptData {
  return receiptDataSchema.parse(data)
}

export function validateUpdateRequest(request: unknown): UpdateReceiptRequest {
  return updateReceiptRequestSchema.parse(request)
}

export function validateSessionId(sessionId: string): string {
  return sessionIdSchema.parse(sessionId)
}

// Safe validation (returns error instead of throwing)
export function safeValidateReceiptData(data: unknown): {
  success: true;
  data: ReceiptData;
} | {
  success: false;
  error: string;
} {
  try {
    const validatedData = validateReceiptData(data)
    return { success: true, data: validatedData }
  } catch (error) {
    return {
      success: false,
      error: error instanceof z.ZodError
        ? error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        : 'Invalid data format'
    }
  }
}
