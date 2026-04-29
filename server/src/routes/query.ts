import { Router, type Request, type Response } from "express"
import { getPool } from "../db/index.js"

const router = Router()

router.get("/occupation-status", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
const query = `
select * from employeeprojectcustomerview
`
    const result = await activePool.query(query)
    res.json(result.rows)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.get("/country-coverage", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
const query = `
select distinct country from location
`
    const result = await activePool.query(query)
    res.json(result.rows)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.get("/upcoming-projects", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
const query = `
select name, budget, startdate, deadline 
from project 
where startdate > current_date
`
    const result = await activePool.query(query)
    res.json(result.rows)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.get("/current-projects", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
const query = `
select name, budget, startdate, deadline 
from project 
where (current_date <= deadline or deadline is null) 
and current_date >= startdate
`
    const result = await activePool.query(query)
    res.json(result.rows)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.post("/investors", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const { number } = req.body
const query = `
select c.name, sum(budget) as total_investment 
from customer c 
join project p on c.cid = p.cid 
group by c.cid, c.name 
having sum(budget) > $1
`
    const result = await activePool.query(query, [number || 0])
    res.json(result.rows)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.post("/projects-by-employees", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
    const { number } = req.body
const query = `
select p.name as project_name, count(w.empid) as assigned_empoyees 
from works w 
right join project p on w.prid = p.prid 
group by p.prid, p.name 
having count(w.empid) >= $1 
order by assigned_empoyees desc
`
    const result = await activePool.query(query, [number || 0])
    res.json(result.rows)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.get("/available-employees", async (req: Request, res: Response) => {
  try {
    const role = req.headers['x-role'] as string
    const activePool = getPool(role)
const query = `
select empid, name, email from employee 
except 
select e.empid, e.name, e.email 
from employee e 
join works w on e.empid = w.empid 
join project p on w.prid = p.prid 
where current_date >= p.startdate 
and (current_date <= p.deadline or p.deadline is null)
`
    const result = await activePool.query(query)
    res.json(result.rows)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

export default router
