import { UnprocessableEntityException } from '@nestjs/common'

export const TableAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.TableAlreadyExists',
    path: 'number'
  }
])

export const TokenAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.TokenAlreadyExists',
    path: 'token'
  }
])
