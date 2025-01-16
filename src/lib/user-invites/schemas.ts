import { z } from "zod";

export const UserInviteCreate = z.object({
  firstName: z.string().min(1, { message: "Required" }),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  email: z.string().min(1, { message: "Required" }).email({
    message: "Must be a valid email address",
  }),
  userId: z.string(),
  role: z.enum(["coach", "user"]),
});
export type UserInviteCreate = z.infer<typeof UserInviteCreate>;
