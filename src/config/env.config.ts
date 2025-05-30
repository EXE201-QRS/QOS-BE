import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { z } from 'zod'

config({
  path: '.env'
})

if (!fs.existsSync(path.resolve('.env'))) {
  console.error('Not found .env file')
  process.exit(1)
}

const configSchema = z.object({
  //Application
  APP_NAME: z.string().default('My App'),
  APP_URL: z.string(),
  APP_PORT: z.coerce.number(),
  API_PREFIX: z.string(),
  APP_CORS_ORIGIN: z.string(),
  //Database
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  SECRET_API_KEY: z.string(),
  //mail
  RESEND_API_KEY: z.string(),
  //otp:
  OTP_EXPIRES_IN: z.string(),
  //Accounts:
  ADMIN_NAME: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_EMAIL: z.string(),
  PHONE_NUMBER: z.string(),
  MANAGER_NAME: z.string(),
  MANAGER_EMAIL: z.string(),
  CHEF_NAME: z.string(),
  CHEF_EMAIL: z.string(),
  STAFF_NAME: z.string(),
  STAFF_EMAIL: z.string()
  //Google OAuth
  // GOOGLE_CLIENT_ID: z.string(),
  // GOOGLE_CLIENT_SECRET: z.string(),
  // GOOGLE_REDIRECT_URI: z.string(),
  // GOOGLE_CLIENT_REDIRECT_URI: z.string(),
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  console.error('Invalid environment variables')
  console.error(configServer.error.format())
  process.exit(1)
}

const envConfig = configServer.data

export default envConfig
