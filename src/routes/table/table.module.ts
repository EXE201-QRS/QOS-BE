import { Module } from '@nestjs/common'
import { TableController } from './table.controller'
import { TableRepo } from './table.repo'
import { TableService } from './table.service'

@Module({
  controllers: [TableController],
  providers: [TableService, TableRepo]
})
export class TableModule {}
