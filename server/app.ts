import express, { type Express, type Request, type Response } from "express"
import path from "path"
import router from "./src/routes/index.js"
import projectRouter from "./src/routes/project.js"
import employeeRouter from "./src/routes/employee.js"
import customerRouter from "./src/routes/customer.js"
import cors, { type CorsOptions } from "cors"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: Express = express()
const port: number = 1234

app.use(express.json())

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('..', '..', 'client', 'build')))
    app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.resolve('..', '..', 'client', 'build', 'index.html'))
    })
} else {
    const corsOptions: CorsOptions = {
        origin: 'http://localhost:3000',
        allowedHeaders: ['Content-Type', 'x-role'],
        optionsSuccessStatus: 200
    }
    app.use(cors(corsOptions))
}

app.use(express.static(path.join(__dirname, "../public")))
app.use("/", router)
app.use("/api/project", projectRouter)
app.use("/api/employee", employeeRouter)
app.use("/api/customer", customerRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
