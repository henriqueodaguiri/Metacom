import express from "express";
const app = express();
const port = 3000;

app.get("/", (req, res) => {
    console.log(req.rawHeaders);
    res.send("hello")
})

app.get("/home", (req, res) => {
    console.log(req.rawHeaders);
    res.send("hello")
})

app.listen(port, () => {
    console.log('Server started on port ' + port);
})