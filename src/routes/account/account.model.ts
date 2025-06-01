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

//PUT
export const UpdateAccountBodySchema = CreateAccountBodySchema

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

//types
export type CreateAccountBodyType = z.infer<typeof CreateAccountBodySchema>
export type UpdateAccountBodyType = z.infer<typeof UpdateAccountBodySchema>
export type GetAccountsResType = z.infer<typeof GetAccountsResSchema>
export type GetAccountParamsType = z.infer<typeof GetAccountParamsSchema>
export type AccountType = z.infer<typeof UserSchema>
