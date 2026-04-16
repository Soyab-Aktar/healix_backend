import z from "zod";

const createSpecialityZodSchema = z.object({
  title: z.string("Title is Required"),
  description: z.string("Description is Required").optional(),

})

export const SpecialityValidation = {
  createSpecialityZodSchema,
}