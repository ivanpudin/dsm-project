import { Router, type Request, type Response } from "express"
import { getPool } from "../db/index.js"
import { type Department } from "../types/schema.js"

const router = Router()

router.get("/get-all", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    
    const result = await activePool.query<Department>('select * from department')
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get("/:id/get-all-filtered", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const currentDepId = req.params.id
const query = `
select * from department
where depid != $1
`
    const result = await activePool.query<Department>(query, [currentDepId])
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/create", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const { name, lid } = req.body
const query = `
insert into department (name, lid)
values ($1, $2)
returning *
`
    const result = await activePool.query<Department>(query, [name, lid])
    res.status(201).json(result.rows[0])
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router