import { UnprocessableEntityException } from '@nestjs/common'

export const DishSnapshotAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.DishSnapshotAlreadyExists',
    path: 'name'
  }
])

export const CategoryNotExistsException = new UnprocessableEntityException([
  {
    message: 'Error.CategoryNotExists',
    path: 'categoryId'
  }
])
