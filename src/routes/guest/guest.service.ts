import { GUEST_MESSAGE } from '@/common/constants/message'
import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helpers'
import { TokenService } from '@/shared/services/token.service'
import { AccessTokenPayloadCreateGuest } from '@/shared/types/jwt.type'
import { Injectable } from '@nestjs/common'
import { TableStatus } from '@prisma/client'
import { TableService } from '../table/table.service'
import {
  GuestAlreadyExistsException,
  TableInvalidTokenException,
  TableNotReadyException
} from './guest.error'
import { CreateGuestBodyType, GetGuestsQueryType } from './guest.model'
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
      const { token, ...guestData } = data

      // check table co khong || token valid, va co status khac cleaning va unavailable khong
      const validTable = await this.tableService.findByNumber(data.tableNumber)

      if (!validTable || validTable.token != token) {
        throw TableInvalidTokenException
      }
      if (
        validTable.status === TableStatus.CLEANING ||
        validTable.status === TableStatus.UNAVAILABLE
      ) {
        throw TableNotReadyException
      }

      //tạo khách để lấy id
      const guest = await this.guestRepo.create({
        data: {
          ...guestData
        }
      })

      // tạo token cho khách mời
      const generateToken = await this.generateTokens({
        guestId: guest.id,
        tableNumber: guest.tableNumber,
        tableToken: validTable.token
      })

      // update lai guest với token
      const updatedGuest = await this.guestRepo.update({
        id: guest.id,
        data: {
          name: guest.name,
          tableNumber: guest.tableNumber,
          refreshToken: generateToken.refreshToken,
          refreshTokenExpiresAt: new Date(generateToken.expireAt)
        }
      })
      return {
        data: {
          ...updatedGuest,
          accessToken: generateToken.accessToken,
          refreshToken: generateToken.refreshToken
        },
        message: GUEST_MESSAGE.CREATED_SUCCESS
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
    guestId,
    tableNumber,
    tableToken
  }: AccessTokenPayloadCreateGuest) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessTokenToGuest({
        guestId,
        tableNumber,
        tableToken
      }),
      this.tokenService.signRefreshTokenToGuest({
        userId: guestId
      })
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)

    return { accessToken, refreshToken, expireAt: decodedRefreshToken.exp * 1000 }
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
