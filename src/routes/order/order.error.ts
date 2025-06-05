import { UnprocessableEntityException } from '@nestjs/common'

export const OrderAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.OrderAlreadyExists',
    path: 'name'
  }
])

export const TableNotReadyException = new UnprocessableEntityException([
  {
    message: 'Error.TableNotReady',
    path: 'tableNumber'
  }
])

export const GuestNotExistsException = new UnprocessableEntityException([
  {
    message: 'Error.GuestNotExists',
    path: 'guestId'
  }
])
