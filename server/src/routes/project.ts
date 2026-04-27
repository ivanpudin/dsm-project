import { Router, type Request, type Response } from "express"
import { getPool } from "../db/index.js"
import { type Project, type Employee } from "../types/schema.js"

const router = Router()

router.get("/get-all", async (req: Request, res: Response) => {
    try {
        const role = req.headers['x-role'] as string
        const activePool = getPool(role)
        
const query = `
select * from project
`
        const result = await activePool.query<Project>(query)
        res.json(result.rows)

    } catch (err: any) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

router.get("/:id/employees", async (req: Request, res: Response) => {
    try {
        const role = req.headers['x-role'] as string
        const activePool = getPool(role)
        const projectId = req.params.id

const query = `
select employee.*
from employee
join works on employee.empid = works.empid
where works.prid = $1
`
        const result = await activePool.query<Employee>(query, [projectId])
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
    const { name, startdate, deadline, budget, cid } = req.body

    let query
    let params

    if (budget !== null && budget !== undefined) {
query = `
insert into project (name, startdate, deadline, cid, budget)
values ($1, $2, $3, $4, $5)
returning *
`
      params = [name, startdate, deadline, cid, budget]
    } else {
query = `
insert into project (name, startdate, deadline, cid)
values ($1, $2, $3, $4)
returning *
`
      params = [name, startdate, deadline, cid]
    }

    const result = await activePool.query(query, params)
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
    const projectId = req.params.id

const query = `
delete from project
where prid = $1
`
    await activePool.query(query, [projectId])
    res.json({ success: true })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

export default router
