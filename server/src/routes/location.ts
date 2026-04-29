import { Router, type Request, type Response } from "express"
import { getPool } from "../db/index.js"
import { type Location } from "../types/schema.js"

const router = Router()

router.get("/get-all", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)

const query = `
select * from location
`
    const result = await activePool.query<Location>(query)
    res.json(result.rows)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.post("/create", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const { address, country } = req.body

    let query
    let params

    if (country && country.trim() !== '') {
query = `
insert into location (address, country)
values ($1, $2)
returning *
`
      params = [address, country]
    } else {
query = `
insert into location (address)
values ($1)
returning *
`
      params = [address]
    }

    const result = await activePool.query<Location>(query, params)
    res.status(201).json(result.rows[0])
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

export default router
