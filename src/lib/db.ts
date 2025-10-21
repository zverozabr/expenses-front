import { neon } from '@neondatabase/serverless'
import { Pool } from 'pg'

let sqlInstance: ReturnType<typeof neon> | null = null
let pgPool: Pool | null = null

// Check if we should use local PostgreSQL (for tests)
function useLocalPostgres(): boolean {
  const url = process.env.POSTGRES_URL || ''
  return url.includes('localhost') || url.includes('127.0.0.1')
}

export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is not set')
  }

  const cleanConnectionString = process.env.POSTGRES_URL.replace(/^["']|["']$/g, '')

  // Use pg for local PostgreSQL, neon for remote
  if (useLocalPostgres()) {
    if (!pgPool) {
      pgPool = new Pool({
        connectionString: cleanConnectionString,
      })
    }

    // Build the parameterized query from template strings
    // Replace template literal placeholders with PostgreSQL $1, $2, etc.
    let query = strings[0]
    for (let i = 0; i < values.length; i++) {
      query += `$${i + 1}` + strings[i + 1]
    }

    const result = await pgPool.query(query, values)
    return result.rows
  } else {
    if (!sqlInstance) {
      sqlInstance = neon(cleanConnectionString)
    }
    return sqlInstance(strings, ...values)
  }
}
