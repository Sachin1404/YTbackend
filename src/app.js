import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app=express()
app.use(cors({
    origin:process.env.CORS_ORIGIN
}))
app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({limit:"20kb"}))
app.use(cookieParser())
app.use(express.static("public"))
console.log("tranferring the control")
import userRouter from './routes/user.router.js';
app.use('/api/v1/users',userRouter)
export default app;