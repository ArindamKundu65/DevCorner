import express from "express";
import connectDB from "./config/database.js"
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import requestRouter from "./routes/request.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser())

app.use("/",authRouter)
app.use("/",profileRouter)
app.use("/",requestRouter)













connectDB()
    .then(() => {
        console.log("Database connection established")

        app.listen(port, (req, res) => {
            console.log(`Server is listening on port:${port}`)
        })
    }

    )
    .catch((err) => {
        console.console.error("Database cannot be connected");
    })
