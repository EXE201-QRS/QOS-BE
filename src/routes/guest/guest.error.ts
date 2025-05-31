import { UnprocessableEntityException } from '@nestjs/common'

export const GuestAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.GuestAlreadyExists',
    path: 'name'
  }
])
