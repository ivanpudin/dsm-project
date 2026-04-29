import { Router, type Request, type Response } from "express"
import { getPool } from "../db/index.js"
import { type Customer } from "../types/schema.js"

const router = Router()

router.get("/get-all", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)

const query = `
select customer.*, location.address, location.country
from customer
join location on customer.lid = location.lid
`
    const result = await activePool.query(query)
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
    const { name, email, lid } = req.body

const query = `
insert into customer (name, email, lid)
values ($1, $2, $3)
returning *
`
    const result = await activePool.query<Customer>(query, [name, email, lid])
    res.status(201).json(result.rows[0])
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.delete("/:id/delete", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const customerId = req.params.id

const query = `
delete from customer
where cid = $1
`
    await activePool.query<Customer>(query, [customerId])
    res.json({ success: true })

  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

export default router
