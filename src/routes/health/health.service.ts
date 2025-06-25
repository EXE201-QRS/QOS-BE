import { SharedUserRepository } from '@/shared/repositories/shared-user.repo'
import { Injectable } from '@nestjs/common'
import { OrderRepo } from '../order/order.repo'
import { TableRepo } from '../table/table.repo'
import { HealthRepo } from './health.repo'

@Injectable()
export class HealthService {
  constructor(
    private readonly tableRepo: TableRepo,
    private readonly sharedUserRepo: SharedUserRepository,
    private readonly orderRepo: OrderRepo,
    private readonly healthRepo: HealthRepo
  ) {}

  async getInfoHealth() {
    const [amountTable, amountUser, amountOrder, usedStorage] = await Promise.all([
      this.tableRepo.getAmount(),
      this.sharedUserRepo.getAmount(),
      this.orderRepo.getAmount(),
      this.healthRepo.getUsedStorage()
    ])
    return {
      data: {
        amountTable,
        amountUser,
        amountOrder,
        usedStorage
      },
      message: 'Get health info successfully'
    }
  }
}
