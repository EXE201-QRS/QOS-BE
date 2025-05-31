import { GUEST_MESSAGE } from '@/common/constants/message'
import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helpers'
import { TokenService } from '@/shared/services/token.service'
import { AccessTokenPayloadCreate } from '@/shared/types/jwt.type'
import { Injectable } from '@nestjs/common'
import { TableStatus } from '@prisma/client'
import { TableService } from '../table/table.service'
import { GuestAlreadyExistsException, TableNotReadyException } from './guest.error'
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
    private readonly tokenService: TokenService,
    private readonly tableService: TableService
  ) {}

  async create({ data }: { data: CreateGuestBodyType }) {
    try {
      // check table co khong va co status khac cleaning va unavailable khong
      const validTable = await this.tableService.findByNumber(data.tableNumber)

      if (
        !validTable ||
        validTable.status === TableStatus.CLEANING ||
        validTable.status === TableStatus.UNAVAILABLE
      ) {
        throw TableNotReadyException
      }

      //tạo khách để lấy id
      const guest = await this.guestRepo.create({
        data
      })

      // tạo token cho khách mời
      const token = await this.generateTokens({
        userId: guest.id,
        deviceId: 0,
        roleId: 0,
        roleName: '',
        tableNumber: guest.tableNumber
      })
      // update lai guest với token
      const updatedGuest = await this.guestRepo.update({
        id: guest.id,
        data: {
          ...guest,
          refreshToken: token.refreshToken,
          refreshTokenExpiresAt: new Date(token.expireAt)
        }
      })
      return {
        ...updatedGuest,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken
      }
    } catch (error) {
      // Handle unique constraint error (token)
      if (isUniqueConstraintPrismaError(error)) {
        throw GuestAlreadyExistsException
      }
      throw error
    }
  }

  async generateTokens({
    userId,
    deviceId,
    roleId,
    roleName,
    tableNumber
  }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        deviceId,
        roleId,
        roleName,
        tableNumber
      }),
      this.tokenService.signRefreshToken({
        userId
      })
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.guestRepo.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId
    })
    return { accessToken, refreshToken, expireAt: decodedRefreshToken.exp * 1000 }
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
