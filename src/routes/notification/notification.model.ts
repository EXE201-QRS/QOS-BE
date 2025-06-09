import { NOTIFICATION_MESSAGE } from '@/common/constants/message'
import { NotificationType } from '@/common/constants/notification.constant'
import { checkIdSchema } from '@/shared/utils/id.validation'
import { z } from 'zod'

export const NotificationnSchema = z
  .object({
    id: z.number(),
    type: z.enum([
      NotificationType.ORDER,
      NotificationType.PAYMENT,
      NotificationType.SUPPORT
    ]),
    message: z.string().default(''),
    room: z.string(),
    isRead: z.boolean().default(false),
    tableNumber: z.number().int().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .strict()

//list categories
export const GetNotificationnsResSchema = z.object({
  data: z.array(NotificationnSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetNotificationnParamsSchema = z
  .object({
    notificationId: checkIdSchema(NOTIFICATION_MESSAGE.ID_IS_INVALID)
  })
  .strict()

export const GetNotificationnDetailResSchema = z.object({
  data: NotificationnSchema,
  message: z.string()
})

export const CreateNotificationSchema = NotificationnSchema.pick({
  type: true,
  message: true,
  room: true
})
  .strict()
  .extend({
    tableNumber: z.number().int()
  })

export const UpdateNotificationnBodySchema = NotificationnSchema.pick({
  isRead: true
}).strict()

export type NotificationnType = z.infer<typeof NotificationnSchema>
export type UpdateNotificationnBodyType = z.infer<typeof UpdateNotificationnBodySchema>
export type GetNotificationnParamsType = z.infer<typeof GetNotificationnParamsSchema>
export type GetNotificationnDetailResType = z.infer<
  typeof GetNotificationnDetailResSchema
>
export type CreateNotificationType = z.infer<typeof CreateNotificationSchema>
export type GetNotificationnsResType = z.infer<typeof GetNotificationnsResSchema>
