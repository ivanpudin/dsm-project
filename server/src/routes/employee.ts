import { Router, type Request, type Response } from "express"
import { getPool } from "../db/index.js"
import { type Employee } from "../types/schema.js"

const router = Router()

router.get("/:id/get-all-filtered", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const projectId = req.params.id

const query = `
select *
from employee
where empid not in (
select empid
from works
where prid = $1
)
`
    const result = await activePool.query<Employee>(query, [projectId])
    res.json(result.rows)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.post("/:id/remove", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const projectId = req.params.id
    const { empid } = req.body

const query = `
delete from works
where prid = $1 and empid = $2
`
    await activePool.query(query, [projectId, empid])
    res.json({ success: true })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.post("/:id/add", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const projectId = req.params.id
    const { empid } = req.body

const query = `
insert into works (prid, empid, started)
values ($1, $2, current_date)
`
    await activePool.query(query, [projectId, empid])
    res.json({ success: true })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

export default router
