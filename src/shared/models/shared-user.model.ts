import { UserStatus } from '@/common/constants/auth.constant'
import { PermissionSchema } from 'src/shared/models/shared-permission.model'
import { RoleSchema } from 'src/shared/models/shared-role.model'
import { z } from 'zod'

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(6).max(100),
  phoneNumber: z.string().min(9).max(15),
  avatar: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE]),
  roleId: z.number().positive(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

/**
 * Áp dụng cho Response của api GET('profile') và GET('users/:userId')
 */
export const GetAccountProfileResSchema = UserSchema.omit({
  password: true
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true
  }).extend({
    permissions: z.array(
      PermissionSchema.pick({
        id: true,
        name: true,
        module: true,
        path: true,
        method: true
      })
    )
  })
})

/**
 * Áp dụng cho Response của api PUT('profile') và PUT('users/:userId')
 */
export const UpdateProfileResSchema = z.object({
  data: UserSchema.omit({
    password: true
  }),
  message: z.string()
})

export type UserType = z.infer<typeof UserSchema>
export type GetUserProfileResType = z.infer<typeof GetAccountProfileResSchema>
export type UpdateProfileResType = z.infer<typeof UpdateProfileResSchema>
