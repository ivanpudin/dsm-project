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

export const getPool = (role?: string | string[]) => {
  if (role === "ALICE") return alicePool
  if (role === "BOB") return bobPool
  return adminPool
}
