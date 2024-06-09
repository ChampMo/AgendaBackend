
import express from 'express';
import cookieSession from'cookie-session';
import bodyParser from'body-parser';
import session from 'express-session'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv';
import cors from 'cors';

const port = 8000;
dotenv.config();

const app = express();

app.use(cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());

app.use(cookieParser())

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }))





// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });


app.get('/get', (req, res) => {
    res.send('Hello World');

});


app.use(session({
    name: 'secret',
    secret: '1234',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS only
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24 * 7, // One week
    },
}));


import login from './routes/login.js';
app.use("/", login);

import db from './routes/db.js';
app.use("/", db);

import allwork from './routes/allwork.js';
app.use("/", allwork);

import setting from './routes/setting.js';
app.use("/", setting);

import addtask from './routes/addtask.js';
app.use("/", addtask);

import showtask from './routes/showtask.js';
app.use("/", showtask);

// import datadb from './routes/model/datadb.js';
// app.use("/", datadb);


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
