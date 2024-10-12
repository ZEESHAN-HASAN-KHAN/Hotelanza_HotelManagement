require('dotenv').config()
const express = require('express');

const userRouter = require('./routes/user');
const adminRouter=require('./routes/admin')
const app = express();

const PORT = 4000;

app.use(express.json());
app.use('/api/v1/user', userRouter);
app.use('/api/v1/admin', adminRouter);
app.listen(PORT,
    ()=>console.log(`App is Running on the port ${PORT}`)
)