import express, { json } from "express";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./routes/auth.routers.js";
import parkingRouter from "./routes/parking.routers.js";
import flatRateRouter from "./routes/flatRates.routers.js";
import userRouter from "./routes/user.routers.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/parking", parkingRouter);
app.use("/flatRates", flatRateRouter);

export default app;
