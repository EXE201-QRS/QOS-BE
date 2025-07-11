import { UnprocessableEntityException } from '@nestjs/common'

export const CategoryAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.CategoryAlreadyExists',
    path: 'name'
  }
])
