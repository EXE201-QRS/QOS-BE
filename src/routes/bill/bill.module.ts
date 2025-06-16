import { Module } from '@nestjs/common'
import { BillController } from './bill.controller'
import { BillRepo } from './bill.repo'
import { BillService } from './bill.service'

@Module({
  controllers: [BillController],
  providers: [BillService, BillRepo],
  exports: [BillService, BillRepo]
})
export class BillModule {}
