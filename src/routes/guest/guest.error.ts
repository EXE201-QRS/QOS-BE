import { UnprocessableEntityException } from '@nestjs/common'

export const GuestAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.GuestAlreadyExists',
    path: 'name'
  }
])

export const TableInvalidTokenException = new UnprocessableEntityException([
  {
    message: 'Error.TableInvalidToken',
    path: 'token'
  }
])

export const TableNotReadyException = new UnprocessableEntityException([
  {
    message: 'Error.TableStatusNotReady',
    path: 'tableNumber'
  }
])
