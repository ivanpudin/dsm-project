import { Router, type Request, type Response } from "express"
import { getPool } from "../db/index.js"
import { type Customer } from "../types/schema.js"

const router = Router()

router.get("/get-all", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)

const query = `
select *
from customer
`
    const result = await activePool.query<Customer>(query)
    res.json(result.rows)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

export default router
