import { Injectable } from '@nestjs/common'
import { GuestCreateBodyType, GuestType } from 'src/routes/guest/guest.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class GuestRepo {
  constructor(private prismaService: PrismaService) {}

  create({ data }: { data: GuestCreateBodyType }): Promise<GuestType> {
    return this.prismaService.guest.create({
      data
    })
  }

  update({ id, data }: { id: number; data: Partial<GuestType> }): Promise<GuestType> {
    return this.prismaService.guest.update({
      where: { id },
      data
    })
  }

  findById(id: number): Promise<GuestType | null> {
    return this.prismaService.guest.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }
}
