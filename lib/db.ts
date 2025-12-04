import { Pool } from "@neondatabase/serverless"

if (!process.env.NEON_DATABASE_URL) {
  throw new Error("NEON_DATABASE_URL environment variable is required")
}

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL })

export async function query(text: string, params: any[] = []) {
  const client = await pool.connect()

  try {
    const result = await client.query(text, params)
    return result.rows
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  } finally {
    client.release()
  }
}

export async function transaction<T>(
  callback: (txQuery: (text: string, params?: any[]) => Promise<any>) => Promise<T>
): Promise<T> {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const txQuery = async (text: string, params: any[] = []) => {
      const result = await client.query(text, params)
      return result.rows
    }

    const result = await callback(txQuery)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("[v0] Transaction error:", error)
    throw error
  } finally {
    client.release()
  }
}

export default pool
