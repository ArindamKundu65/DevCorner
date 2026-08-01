import express from "express";
import connectDB from "./config/database.js"
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import requestRouter from "./routes/request.js";
import userRouter from "./routes/user.js";
import cors from "cors"
import "dotenv/config"
import paymentRouter from "./routes/payment.js";
import initializeSocket from "./utils/socket.js";
import http from "http"


const app = express();
const port = process.env.PORT

app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: ["https://dev-front-ruby.vercel.app","http://localhost:5173" ],
    credentials: true
}));
app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/", userRouter);
app.use("/",paymentRouter);

app.get("/", (req, res) => {
    res.send("DevCorner Backend is running");
});

const server = http.createServer(app);
initializeSocket(server);

connectDB()
    .then(() => {
        console.log("Database connection established")

        server.listen(port, (req, res) => {
            console.log(`Server is listening on port:${port}`)
        })
    }

    )
    .catch((err) => {
        console.error("Database cannot be connected"+ err.message);
    })
