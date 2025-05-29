import express from "express";
import pool from "./config/db-config.js";
import router from "./routes/route.js";
import monitor from 'express-status-monitor'
const app = express();
import bodyParser from 'body-parser'
import dotenv from 'dotenv';
import cors from 'cors'
import http from 'http'
const server = http.createServer(app);
const port = process.env.PORT || 8000;
dotenv.config();
app.use(monitor());
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(router);
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header('Access-Control-Allow-Origin', 'https://vmsbackend.comdata.in');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
// 
server.listen(port, () => {
    console.log("Server started on 8000");
})