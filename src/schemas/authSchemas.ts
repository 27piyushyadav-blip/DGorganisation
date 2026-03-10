import * as z from "zod";

// ENFORCED PASSWORD SECURITY
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().regex(passwordRegex, {
    message:
      "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
