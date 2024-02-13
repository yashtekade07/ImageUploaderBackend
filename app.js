import express from 'express'
import {config} from "dotenv"
import ErrorMiddleware from "./middlewares/Error.js"
import cookieParser from "cookie-parser";
import user from "./routes/userRoutes.js"
import cors from 'cors'
config({
    path:"./config/config.env",
})
const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended:true,  // otherwise we cannot access req.body;
}))
app.use(cookieParser());
app.use(
    cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
    methods:["GET","POST","PUT","DELETE"],
}));
app.use("/api/v1",user);

export default app;

app.get("/",(req,res)=>res.send(`Server is working `))
app.use(ErrorMiddleware);