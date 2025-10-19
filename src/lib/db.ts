import { neon } from '@neondatabase/serverless'

let sqlInstance: ReturnType<typeof neon> | null = null

export function sql(strings: TemplateStringsArray, ...values: any[]) {
  if (!sqlInstance) {
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set')
    }
    // Remove surrounding quotes and query parameters from the connection string
    const cleanConnectionString = process.env.POSTGRES_URL.replace(/^["']|["']$/g, '')
    const url = new URL(cleanConnectionString)
    const cleanUrl = `${url.protocol}//${url.host}${url.pathname}`
    sqlInstance = neon(cleanUrl)
  }
  return sqlInstance(strings, ...values)
}
