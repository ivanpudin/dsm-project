import { Router, type Request, type Response } from "express"
import { getPool } from "../db/index.js"
import { type Project, type Employee } from "../types/schema.js"

const router = Router()

router.get("/getAll", async (req: Request, res: Response) => {
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

export default router
