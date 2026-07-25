import express from "express";
import connectDB from "./config/database.js"
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import requestRouter from "./routes/request.js";
import userRouter from "./routes/user.js";
import cors from "cors"
import "dotenv/config"


const app = express();
const port = process.env.PORT

app.use(express.json());
app.use(cookieParser())
const allowedOrigins = [
    "https://dev-front-ruby.vercel.app",
    "https://dev-front-elbm8p2op-devcorner.vercel.app",
    "https://dev-front-5fr143jwk-devcorner.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/", userRouter);

app.get("/", (req, res) => {
    res.send("DevCorner Backend is running");
});

connectDB()
    .then(() => {
        console.log("Database connection established")

        app.listen(port, (req, res) => {
            console.log(`Server is listening on port:${port}`)
        })
    }

    )
    .catch((err) => {
        console.error("Database cannot be connected"+ err.message);
    })
