import { RoleName } from '@/common/constants/role.constant'
import {
  CannotUpdateOrDeleteYourselfException,
  RoleNotFoundException,
  UserAlreadyExistsException
} from '@/routes/account/account.error'
import {
  ChangePasswordBodyType,
  CreateAccountBodyType,
  UpdateAccountBodyType
} from '@/routes/account/account.model'
import { AccountRepository } from '@/routes/account/account.repo'
import { InvalidPasswordException, NotFoundRecordException } from '@/shared/error'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from '@/shared/helpers'
import { PaginationQueryType } from '@/shared/models/request.model'
import { SharedRoleRepository } from '@/shared/repositories/shared-role.repo'
import { SharedUserRepository } from '@/shared/repositories/shared-user.repo'
import { EmailService } from '@/shared/services/email.service'
import { HashingService } from '@/shared/services/hashing.service'
import { ForbiddenException, Injectable } from '@nestjs/common'

@Injectable()
export class AccountService {
  constructor(
    private accountRepo: AccountRepository,
    private hashingService: HashingService,
    private sharedUserRepository: SharedUserRepository,
    private sharedRoleRepository: SharedRoleRepository,
    private emailService: EmailService
  ) {}

  //Get All
  list(pagination: PaginationQueryType) {
    return this.accountRepo.list(pagination)
  }

  //get by id
  async findById(id: number) {
    const account = await this.sharedUserRepository.findUniqueIncludeRolePermissions({
      id
    })
    if (!account) {
      throw NotFoundRecordException
    }
    return account
  }

  //create
  async create({
    data,
    createdById,
    createdByRoleName
  }: {
    data: CreateAccountBodyType
    createdById: number
    createdByRoleName: string
  }) {
    try {
      await this.verifyRole({
        roleNameAgent: createdByRoleName,
        roleIdTarget: data.roleId
      })
      const password = this.generatePassword()
      //send mail to user with password
      await this.emailService.sendCreateAccountEmail({
        email: data.email,
        password
      })
      const hashedPassword = await this.hashingService.hash(password)

      const user = await this.accountRepo.create({
        createdById,
        data: {
          ...data,
          password: hashedPassword
        }
      })
      return {
        data: user,
        message: 'Tạo tài khoản thành công'
      }
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException
      }

      if (isUniqueConstraintPrismaError(error)) {
        throw UserAlreadyExistsException
      }
      throw error
    }
  }

  //update
  async update({
    id,
    data,
    updatedById,
    updatedByRoleName
  }: {
    id: number
    data: UpdateAccountBodyType
    updatedById: number
    updatedByRoleName: string
  }) {
    try {
      // Không thể cập nhật chính mình
      this.verifyYourself({
        userAgentId: updatedById,
        userTargetId: id
      })

      // Lấy roleId ban đầu của người được update để kiểm tra xem liệu người update có quyền update không
      // Không dùng data.roleId vì dữ liệu này có thể bị cố tình truyền sai
      const roleIdTarget = await this.getRoleIdByUserId(id)
      await this.verifyRole({
        roleNameAgent: updatedByRoleName,
        roleIdTarget
      })

      const updatedUser = await this.sharedUserRepository.update(
        { id },
        {
          ...data,
          updatedById
        }
      )
      return {
        data: updatedUser,
        message: 'Cập nhật tài khoản thành công'
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw UserAlreadyExistsException
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException
      }
      throw error
    }
  }

  private async getRoleIdByUserId(userId: number) {
    const currentUser = await this.sharedUserRepository.findUnique({
      id: userId
    })
    if (!currentUser) {
      throw NotFoundRecordException
    }
    return currentUser.roleId
  }

  private verifyYourself({
    userAgentId,
    userTargetId
  }: {
    userAgentId: number
    userTargetId: number
  }) {
    if (userAgentId === userTargetId) {
      throw CannotUpdateOrDeleteYourselfException
    }
  }

  //delete
  async delete({
    id,
    deletedById,
    deletedByRoleName
  }: {
    id: number
    deletedById: number
    deletedByRoleName: string
  }) {
    try {
      // Không thể xóa chính mình
      this.verifyYourself({
        userAgentId: deletedById,
        userTargetId: id
      })

      const roleIdTarget = await this.getRoleIdByUserId(id)
      await this.verifyRole({
        roleNameAgent: deletedByRoleName,
        roleIdTarget
      })

      await this.accountRepo.delete({
        id,
        deletedById
      })
      return {
        message: 'Delete successfully'
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  //change password
  async changePassword({ id, data }: { id: number; data: ChangePasswordBodyType }) {
    //1. Lấy user hiện tại
    const currentUser = await this.sharedUserRepository.findUnique({
      id
    })

    if (!currentUser) {
      throw NotFoundRecordException
    }
    //2. Kiểm tra mật khẩu cũ có đúng không
    const { oldPassword, newPassword } = data

    const isOldPasswordValid = await this.hashingService.compare(
      oldPassword,
      currentUser.password
    )

    if (!isOldPasswordValid) {
      throw InvalidPasswordException
    }

    // Cập nhật mật khẩu mới
    const hashedNewPassword = await this.hashingService.hash(newPassword)
    await this.sharedUserRepository.update(
      { id },
      {
        password: hashedNewPassword
      }
    )

    return {
      message: 'Đổi mật khẩu thành công'
    }
  }

  /**
   * Function này kiểm tra xem người thực hiện có quyền tác động đến người khác không.
   * Vì chỉ có người thực hiện là admin role mới có quyền sau: Tạo admin user, update roleId thành admin, xóa admin user.
   * Còn nếu không phải admin thì không được phép tác động đến admin
   */
  private async verifyRole({ roleNameAgent, roleIdTarget }) {
    // Agent là admin thì cho phép
    if (roleNameAgent === RoleName.Admin) {
      return true
    } else {
      // Agent không phải admin thì roleIdTarget phải khác admin
      const adminRoleId = await this.sharedRoleRepository.getAdminRoleId()
      if (roleIdTarget === adminRoleId) {
        throw new ForbiddenException()
      }
      return true
    }
  }

  /**
   * Function generate password
   * @returns {string} - A random password string
   */
  private generatePassword(): string {
    const length = 10
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?'
    let password = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }
    return password
  }
}
