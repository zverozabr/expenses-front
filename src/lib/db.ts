import { neon } from '@neondatabase/serverless'

let sqlInstance: ReturnType<typeof neon> | null = null

export function sql(strings: TemplateStringsArray, ...values: any[]) {
  if (!sqlInstance) {
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set')
    }
    sqlInstance = neon(process.env.POSTGRES_URL)
  }
  return sqlInstance(strings, ...values)
}
