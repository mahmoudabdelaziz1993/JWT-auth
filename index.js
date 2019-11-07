const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routes/users')
require('dotenv').config();

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true ,useCreateIndex: true});
mongoose.connection.on('open', () => { console.log(" connected to db "); })
const app = express();
app.use(express.json());
app.use('/users',userRouter);

app.listen(process.env.PORT)
    .on('listening', () => console.log(` app is on live now on http://localhost:${process.env.PORT}`))
