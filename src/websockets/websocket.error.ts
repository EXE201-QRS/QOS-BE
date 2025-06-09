import { UnauthorizedException } from '@nestjs/common'

export const MissingTokenException = new UnauthorizedException([
  {
    message: 'Error.MissingToken',
    path: 'auth'
  }
])

export const InvalidTokenException = new UnauthorizedException([
  {
    message: 'Error.InvalidTokenException',
    path: 'auth'
  }
])
