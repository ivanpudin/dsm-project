import { Router, type Request, type Response } from "express"
import { getPool } from "../db/index.js"
import { type Role } from "../types/schema.js"

const router = Router()

router.get("/get-all", async (req: Request, res: Response) => {
  try {
    const appRole = req.headers['x-role'] as string
    const activePool = getPool(appRole)

    const result = await activePool.query<Role>('select * from role')
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get("/:id/get-all-filtered", async (req: Request, res: Response) => {
  try {
    const appRole = req.headers['x-role'] as string
    const activePool = getPool(appRole)
    const empid = req.params.id

const query = `
select * from role 
where roleid not in (
select roleid from has where empid = $1
)
`

    const result = await activePool.query<Role>(query, [empid])
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/create", async (req: Request, res: Response) => {
  try {
    const appRole = req.headers['x-role'] as string
    const activePool = getPool(appRole)
    const { name } = req.body
const query = `
insert into role (name)
values ($1)
returning *
`
    const result = await activePool.query<Role>(query, [name])
    res.status(201).json(result.rows[0])
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
