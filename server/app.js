import express, { json } from "express";
import cors from "cors";
import authRouter from "./routes/auth.routers.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", authRouter);

export default app;
