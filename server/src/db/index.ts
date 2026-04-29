import pg from "pg"
import dotenv from "dotenv"

dotenv.config()
const { Pool } = pg

const baseConfig = {
  host: process.env.PG_HOST || "localhost",
  database: process.env.PG_DATABASE || "bidi_db",
  port: 5432
}

export const adminPool = new Pool({
  ...baseConfig,
  user: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD
})

export const alicePool = new Pool({
  ...baseConfig,
  user: process.env.ALICE_USERNAME,
  password: process.env.ALICE_PASSWORD
})

export const bobPool = new Pool({
  ...baseConfig,
  user: process.env.BOB_USERNAME,
  password: process.env.BOB_PASSWORD
})

adminPool.on("error", (err) => {
  console.error("Unexpected error on idle admin client", err)
})

alicePool.on("error", (err) => {
  console.error("Unexpected error on idle alice client", err)
})

bobPool.on("error", (err) => {
  console.error("Unexpected error on idle bob client", err)
})

const logConnectionDetails = async (client: pg.PoolClient, roleName: string) => {
  try {

    const query = `
select current_database() as db_name, current_schema() as schema_name, string_agg(tablename, ', ') as tables
from pg_tables
where schemaname = current_schema() and has_table_privilege(schemaname || '.' || tablename, 'select')
`
    const result = await client.query(query)
    const info = result.rows[0]
    
    console.log(`[${roleName}] Connected to DB: ${info.db_name} | Schema: ${info.schema_name} | Accessible Tables: ${info.tables || 'None'}`)
    
  } catch (err) {
    console.error(`Failed to fetch connection details for ${roleName}`, err)
  }
}

adminPool.on("connect", (client) => {
  logConnectionDetails(client, "ADMIN")
})

alicePool.on("connect", (client) => {
  logConnectionDetails(client, "ALICE")
})

bobPool.on("connect", (client) => {
  logConnectionDetails(client, "BOB")
})

export const getPool = (role?: string | string[]) => {
  if (role === "ALICE") return alicePool
  if (role === "BOB") return bobPool
  return adminPool
}
