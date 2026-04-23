import { Router, type Request, type Response } from "express";

const router = Router()

router.get("/", (req: Request, res: Response) => {
    res.send("The server is live.")
})

export default router
