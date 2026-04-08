import z from "zod";

const superAdminUpdateZodSchema = z.object({
  name: z.string().optional(),
  profilePhoto: z.url("Invalid URL format").optional(),
  contactNumber: z.string().optional(),
})

export const superAdminValidation = {
  superAdminUpdateZodSchema,
}