import envConfig from '@/config/env.config'
import { Injectable } from '@nestjs/common'

import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class HealthRepo {
  constructor(private prismaService: PrismaService) {}

  async getUsedStorage(): Promise<string | null> {
    const db = new URL(envConfig.DATABASE_URL).pathname.replace('/', '')

    if (!db) {
      return null
    }

    const result: Array<{ size_pretty: string }> = await this.prismaService
      .$queryRawUnsafe(`
      SELECT pg_size_pretty(pg_database_size('${db}')) AS size_pretty
      FROM pg_database
      WHERE datname = '${db}';
    `)

    const usedPretty = result[0]?.size_pretty || null

    return usedPretty
  }
}
