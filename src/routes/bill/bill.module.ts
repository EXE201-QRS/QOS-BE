import { Module } from '@nestjs/common'
import { PayOSService } from '../../shared/payos.service'
import { BillController } from './bill.controller'
import { BillRepository } from './bill.repo'
import { BillService } from './bill.service'

@Module({
  controllers: [BillController],
  providers: [BillService, BillRepository, PayOSService],
  exports: [BillService, BillRepository, PayOSService]
})
export class BillModule {}
