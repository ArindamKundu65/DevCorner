import express from "express";

const app = express();
const port = 3000;


app.use("/test",(req, res)=>{
    res.send('<h1>This is test page</h>')
})

app.use("/",(req, res)=> {
    res.send("<h1>This is home page</h>")
})

app.listen(port, (req, res)=> {
    console.log(`Server is listening on port:${port}`)
})