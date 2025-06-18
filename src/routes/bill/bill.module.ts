import { Module } from '@nestjs/common'
import { BillController } from './bill.controller'
import { BillRepository } from './bill.repo'
import { BillService } from './bill.service'

@Module({
  controllers: [BillController],
  providers: [BillService, BillRepository],
  exports: [BillService, BillRepository]
})
export class BillModule {}
