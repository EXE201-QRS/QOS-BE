import { GUEST_MESSAGE } from '@/common/constants/message'
import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helpers'
import { TokenService } from '@/shared/services/token.service'
import { Injectable } from '@nestjs/common'
import { GuestAlreadyExistsException } from './guest.error'
import {
  CreateGuestBodyType,
  GetGuestsQueryType,
  UpdateGuestBodyType
} from './guest.model'
import { GuestRepo } from './guest.repo'

@Injectable()
export class GuestService {
  constructor(
    private guestRepo: GuestRepo,
    private readonly tokenService: TokenService
  ) {}

  async create({
    data,
    userAgent,
    ip
  }: {
    data: CreateGuestBodyType
    userAgent: string
    ip: string
  }) {
    try {
      //tạo khách để lấy id
      const guest = await this.guestRepo.create({
        data
      })

      // tạo token cho khách mời

      // const token = await this.tokenService.signGuestToken({
      //   guestId: guest.id,
      //   tableNumber: guest.tableNumber
      // })
    } catch (error) {
      // Handle unique constraint error (token)
      if (isUniqueConstraintPrismaError(error)) {
        throw GuestAlreadyExistsException
      }
      throw error
    }
  }

  async update({ id, data }: { id: number; data: UpdateGuestBodyType }) {
    try {
      const guest = await this.guestRepo.update({
        id,
        data
      })
      return guest
    } catch (error) {
      // Handle not found pn (id)
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      if (isUniqueConstraintPrismaError(error)) {
        throw GuestAlreadyExistsException
      }
      throw error
    }
  }

  async list(pagination: GetGuestsQueryType) {
    const data = await this.guestRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const guest = await this.guestRepo.findById(id)
    if (!guest) {
      throw NotFoundRecordException
    }
    return guest
  }

  async delete({ id }: { id: number }) {
    try {
      await this.guestRepo.delete({
        id
      })
      return {
        message: GUEST_MESSAGE.DELETED_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
