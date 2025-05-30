import { UnprocessableEntityException } from '@nestjs/common'

export const DishAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.DishAlreadyExists',
    path: 'name'
  }
])

export const CategoryNotExistsException = new UnprocessableEntityException([
  {
    message: 'Error.CategoryNotExists',
    path: 'categoryId'
  }
])
