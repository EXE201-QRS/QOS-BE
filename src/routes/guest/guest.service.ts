import { RoleName } from '@/common/constants/role.constant'
import { GuestLoginBodyType } from '@/routes/guest/guest.model'
import { isUniqueConstraintPrismaError } from '@/shared/helpers'
import { TokenService } from '@/shared/services/token.service'
import { GuestAccessTokenPayloadCreate } from '@/shared/types/jwt.type'
import { Injectable } from '@nestjs/common'
import { TableStatus } from '@prisma/client'
import { TableService } from '../table/table.service'
import {
  GuestAlreadyExistsException,
  TableInvalidTokenException,
  TableNotReadyException
} from './guest.error'
import { GuestRepo } from './guest.repo'

@Injectable()
export class GuestService {
  constructor(
    private guestRepo: GuestRepo,
    private readonly tokenService: TokenService,
    private readonly tableService: TableService
  ) {}

  async login({ data }: { data: GuestLoginBodyType }) {
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
      const guest = await this.guestRepo.create({ data: guestData })

      // tạo token cho khách mời
      const generateToken = await this.generateTokens({
        guestId: guest.id,
        roleName: RoleName.Guest,
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
          refreshTokenExpiresAt: generateToken.expireAt
        }
      })
      return {
        data: {
          accessToken: generateToken.accessToken,
          refreshToken: generateToken.refreshToken,
          guest: {
            id: updatedGuest.id,
            name: updatedGuest.name,
            role: RoleName.Guest,
            tableNumber: updatedGuest.tableNumber,
            createdAt: updatedGuest.createdAt,
            updatedAt: updatedGuest.updatedAt
          }
        },
        message: 'Đăng nhập thành công'
      }
    } catch (error) {
      // Handle unique constraint error (token)
      if (isUniqueConstraintPrismaError(error)) {
        throw GuestAlreadyExistsException
      }
      throw error
    }
  }

  async logout(refreshToken: string) {
    const decode = await this.tokenService.verifyGuestRefreshToken(refreshToken)
    await this.guestRepo.update({
      id: decode.guestId,
      data: {
        refreshToken: '',
        refreshTokenExpiresAt: null
      }
    })
    return {
      message: 'Đăng xuất thành công'
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      // 1. Verify refresh token
      const decodedRefreshToken =
        await this.tokenService.verifyGuestRefreshToken(refreshToken)

      // 2. Find guest by id
      const guest = await this.guestRepo.findById(decodedRefreshToken.guestId)
      if (!guest) {
        throw GuestAlreadyExistsException
      }
      const validTable = await this.tableService.findByNumber(guest.tableNumber)
      if (
        validTable.status === TableStatus.CLEANING ||
        validTable.status === TableStatus.UNAVAILABLE
      ) {
        throw TableNotReadyException
      }
      // 3. Generate new tokens
      const newTokens = await this.generateTokens({
        guestId: guest.id,
        roleName: RoleName.Guest,
        tableNumber: guest.tableNumber,
        tableToken: validTable.token
      })

      // 4. Update guest with new refresh token and expiration
      await this.guestRepo.update({
        id: guest.id,
        data: {
          refreshToken: newTokens.refreshToken,
          refreshTokenExpiresAt: newTokens.expireAt
        }
      })

      return {
        data: {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken
        },
        message: 'Làm mới token thành công'
      }
    } catch (error) {
      throw error
    }
  }

  async generateTokens({
    guestId,
    roleName,
    tableNumber,
    tableToken
  }: GuestAccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signGuestAccessToken({
        guestId,
        roleName,
        tableNumber,
        tableToken
      }),
      this.tokenService.signGuestRefreshToken({
        guestId,
        roleName
      })
    ])
    const decodedRefreshToken =
      await this.tokenService.verifyGuestRefreshToken(refreshToken)

    return {
      accessToken,
      refreshToken,
      expireAt: new Date(decodedRefreshToken.exp * 1000)
    }
  }
}
