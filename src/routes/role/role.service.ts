import { RoleName } from '@/common/constants/role.constant'
import { Injectable } from '@nestjs/common'
import {
  ProhibitedActionOnBaseRoleException,
  RoleAlreadyExistsException
} from 'src/routes/role/role.error'
import {
  CreateRoleBodyType,
  GetRolesQueryType,
  UpdateRoleBodyType
} from 'src/routes/role/role.model'
import { RoleRepo } from 'src/routes/role/role.repo'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

@Injectable()
export class RoleService {
  constructor(private roleRepo: RoleRepo) {}

  async list(pagination: GetRolesQueryType) {
    const data = await this.roleRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const role = await this.roleRepo.findById(id)
    if (!role) {
      throw NotFoundRecordException
    }
    return role
  }

  async create({ data, createdById }: { data: CreateRoleBodyType; createdById: number }) {
    try {
      const role = await this.roleRepo.create({
        createdById,
        data
      })
      return {
        data: role,
        message: 'Tạo role thành công'
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      throw error
    }
  }

  /**
   * Kiểm tra xem role có phải là 1 trong 3 role cơ bản không
   */
  private async verifyRole(roleId: number) {
    const role = await this.roleRepo.findById(roleId)
    if (!role) {
      throw NotFoundRecordException
    }
    const baseRoles: string[] = [
      RoleName.Admin,
      RoleName.Chef,
      RoleName.Manager,
      RoleName.Staff
    ]

    if (baseRoles.includes(role.name)) {
      throw ProhibitedActionOnBaseRoleException
    }
  }

  async update({
    id,
    data,
    updatedById
  }: {
    id: number
    data: UpdateRoleBodyType
    updatedById: number
  }) {
    try {
      const updatedRole = await this.roleRepo.update({
        id,
        updatedById,
        data
      })
      return {
        data: updatedRole,
        message: 'Cập nhật role thành công'
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.verifyRole(id)
      await this.roleRepo.delete({
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
}
