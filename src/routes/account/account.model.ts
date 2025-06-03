import { RoleSchema } from 'src/shared/models/shared-role.model'
import { UserSchema } from 'src/shared/models/shared-user.model'
import { z } from 'zod'

//POST
export const CreateAccountBodySchema = UserSchema.pick({
  email: true,
  name: true,
  phoneNumber: true,
  avatar: true,
  status: true,
  password: true,
  roleId: true
}).strict()

export const CreateAccountResSchema = z.object({
  data: UserSchema.omit({ password: true }),
  message: z.string()
})

//PUT
export const UpdateAccountBodySchema = CreateAccountBodySchema
export const UpdateAccountResSchema = CreateAccountResSchema

//GET
export const GetAccountsResSchema = z.object({
  data: z.array(
    UserSchema.omit({ password: true }).extend({
      role: RoleSchema.pick({
        id: true,
        name: true
      })
    })
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetAccountParamsSchema = z
  .object({
    accountId: z.coerce.number().int().positive()
  })
  .strict()

export const ChangePasswordBodySchema = z
  .object({
    oldPassword: z.string().min(6).max(100),
    newPassword: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100)
  })
  .strict()
  .superRefine(({ confirmPassword, newPassword }, ctx) => {
    if (confirmPassword !== newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Mật khẩu mới không khớp',
        path: ['confirmPassword']
      })
    }
  })

//types
export type CreateAccountBodyType = z.infer<typeof CreateAccountBodySchema>
export type CreateAccountResType = z.infer<typeof CreateAccountResSchema>
export type UpdateAccountBodyType = z.infer<typeof UpdateAccountBodySchema>
export type UpdateAccountResType = z.infer<typeof UpdateAccountResSchema>
export type GetAccountsResType = z.infer<typeof GetAccountsResSchema>
export type GetAccountParamsType = z.infer<typeof GetAccountParamsSchema>
export type AccountType = z.infer<typeof UserSchema>
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>
