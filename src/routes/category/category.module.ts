import { Module } from '@nestjs/common'
import { CategoryController } from './category.controller'
import { CategoryRepo } from './category.repo'
import { CategoryService } from './category.service'

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepo],
  exports: [CategoryService]
})
export class CategoryModule {}
