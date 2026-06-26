import z from "zod";
import { UserStatus } from "../../../generated/prisma/enums";

const adminUpdateZodSchema = z.object({
  name: z.string().optional(),
  profilePhoto: z.url("Invalid URL format").optional(),
  contactNumber: z.string().optional(),
})

const changeUserStatusZodSchema = z.object({
  userId: z.string("User ID is required"),
  userStatus: z.nativeEnum(UserStatus, {
    error: "User status is required",
  }),
})

export const adminValidation = {
  adminUpdateZodSchema,
  changeUserStatusZodSchema,
}