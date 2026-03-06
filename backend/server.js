import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'

// App Config - Wrap in async IIFE
const startServer = async () => {
const app = express()
const port = process.env.PORT || 4000
await connectDB()
connectCloudinary()

// Middlewares
app.use(cors())
app.use(express.json())

// API Endpoints
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

app.get('/', (req, res) => {
    res.send('Hello from the backend server')
})

// Listener
app.listen(port, () => {
    console.log("Server started",port)
})
}

startServer().catch(err => {
    console.log('Failed to start server:', err.message)
    process.exit(1)
})