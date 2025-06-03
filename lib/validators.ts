import { z } from "zod"

// Contact form validation schema
export const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  service: z.string().min(1, { message: "Please select a service" }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
})

// Booking form validation schema
export const bookingFormSchema = z.object({
  userId: z.string().nullable(),
  bookingDate: z.string().min(1, { message: "Please select a date" }),
  machineType: z.string().min(1, { message: "Please select a machine type" }),
  packageType: z.string().min(1, { message: "Please select a package type" }),
  flavors: z.array(z.string()).min(1, { message: "Please select at least one flavor" }),
  eventType: z.string().min(1, { message: "Please select an event type" }),
  guestCount: z.number().int().positive({ message: "Guest count must be a positive number" }),
  userName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  userEmail: z.string().email({ message: "Please enter a valid email address" }),
  userPhone: z.string().min(10, { message: "Please enter a valid phone number" }),
  address: z.string().min(5, { message: "Please enter a valid address" }),
  comments: z.string().optional(),
  totalPrice: z.number().positive({ message: "Total price must be a positive number" }),
})

// Payment validation schema
export const paymentSchema = z.object({
  bookingId: z.string().uuid({ message: "Invalid booking ID" }),
  amount: z.number().positive({ message: "Amount must be a positive number" }),
})

// Profile update validation schema
export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  receiveMarketing: z.boolean().optional(),
})

// Validate function to use with server actions
export async function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): Promise<{
  success: boolean
  data?: T
  errors?: Record<string, string[]>
}> {
  try {
    const validData = await schema.parseAsync(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}

      error.errors.forEach((err) => {
        const path = err.path.join(".")
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })

      return { success: false, errors }
    }

    return {
      success: false,
      errors: { _form: ["An unexpected error occurred during validation"] },
    }
  }
}
