import { Module } from '@nestjs/common'
import { TableModule } from '../table/table.module'
import { GuestController } from './guest.controller'
import { GuestRepo } from './guest.repo'
import { GuestService } from './guest.service'

@Module({
  imports: [TableModule],
  controllers: [GuestController],
  providers: [GuestService, GuestRepo],
  exports: [GuestService]
})
export class GuestModule {}
