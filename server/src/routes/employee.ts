import { Router, type Request, type Response } from "express"
import { getPool } from "../db/index.js"
import { type Employee } from "../types/schema.js"

const router = Router()

export interface ExtendedEmployee extends Employee {
  department_name: string
  roles: string[]
  user_groups: string[]
}

router.get("/get-all", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)

const query = `
select e.empid, e.name, e.email, e.depid, d.name as department_name,
coalesce(r.roles, '{}') as roles,
coalesce(g.groups, '{}') as user_groups
from employee e
join department d on e.depid = d.depid
left join (
  select empid, array_agg(rl.name) as roles
  from has h
  join role rl on h.roleid = rl.roleid
  group by empid
) r on e.empid = r.empid
left join (
  select empid, array_agg(ug.name) as groups
  from partof p
  join usergroup ug on p.grid = ug.grid
  group by empid
) g on e.empid = g.empid
`
    const result = await activePool.query<ExtendedEmployee>(query)
    res.json(result.rows)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

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

router.get("/:id/get-roles", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const empid = req.params.id

const query = `
select r.* from role r
join has h on r.roleid = h.roleid
where h.empid = $1
`

    const result = await activePool.query(query, [empid])
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get("/:id/get-groups", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const empid = req.params.id

const query = `
select ug.* from usergroup ug
join partof p on ug.grid = p.grid
where p.empid = $1
`

    const result = await activePool.query(query, [empid])
    res.json(result.rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/add-role", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const { empid, roleid } = req.body

const query = `insert into has (empid, roleid) values ($1, $2)`

    await activePool.query(query, [empid, roleid])
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/remove-role", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const { empid, roleid } = req.body

const query = `delete from has where empid = $1 and roleid = $2`

    await activePool.query(query, [empid, roleid])
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/add-group", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const { empid, grid } = req.body

const query = `insert into partof (empid, grid) values ($1, $2)`

    await activePool.query(query, [empid, grid])
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/remove-group", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const { empid, grid } = req.body

const query = `delete from partof where empid = $1 and grid = $2`

    await activePool.query(query, [empid, grid])
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// Use SQL transaction since we are inserting into 3 tables
router.post("/create", async (req: Request, res: Response) => {
  const role = req.headers['x-role'] as string
  const activePool = getPool(role)
  const { name, email, depid, roles, groups } = req.body

  // For transactions, we must checkout a single client from the pool
  const client = await activePool.connect()

  try {
    await client.query('BEGIN')

    // 1. Create the employee
    const empQuery = `
      insert into employee (name, email, depid)
      values ($1, $2, $3)
      returning *
    `
    const empRes = await client.query(empQuery, [name, email, depid])
    const newEmployee = empRes.rows[0]
    const empid = newEmployee.empid

    // 2. Assign Roles
    if (roles && roles.length > 0) {
      for (const roleid of roles) {
        await client.query(`insert into has (empid, roleid) values ($1, $2)`, [empid, roleid])
      }
    }

    // 3. Assign Groups
    if (groups && groups.length > 0) {
      for (const grid of groups) {
        await client.query(`insert into partof (empid, grid) values ($1, $2)`, [empid, grid])
      }
    }

    await client.query('COMMIT')
    res.status(201).json(newEmployee)
  } catch (err: any) {
    await client.query('ROLLBACK')
    console.error('Transaction rolled back due to error:', err)
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

router.delete("/:id/delete", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const empid = req.params.id

const query = `
delete from employee
where empid = $1
`
    await activePool.query(query, [empid])
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post("/change-department", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const { empid, depid } = req.body

const query = `
update employee
set depid = $2
where empid = $1
`
    await activePool.query(query, [empid, depid])
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
