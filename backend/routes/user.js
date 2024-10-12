const express = require('express');

const userRouter = express.Router();
const { userModel, hotelModel } = require('../db');

const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

const zod = require('zod');
const { JWT_USER_PASSWORD } = require('../config');
const {userMiddleware} =require('../middleware/user')
//SingUp EndPoint-----POST METHOD
userRouter.post('/signup', async (req, res) => {
    //Input Validation
    const signupBody = zod.object({
        email: zod.string().email(),
        firstName: zod.string(),
        lastName: zod.string(),
        password:zod.string()
    })

    const { success } = signupBody.safeParse(req.body);

    if (!success)
    {
        return res.status(400).json({
            message:'Invalid Input/Format'
        })
    }
    const existingUser = await userModel.findOne({
        email:req.body.email
    });
    if (existingUser)
    {
        return res.status(409).json({
            message:"User Already Exist Please Sign in"
        })
    }
    //Salting the Original Password
    try {
        const hashPassword = await bcrypt.hash(req.body.password, 5);
        const user = await userModel.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password:hashPassword
        })
        // Printing the User
        console.log(user);
        const userId = user._id;
        const token = jwt.sign({ userId }, JWT_USER_PASSWORD)
        
        console.log(`Token is ${token}`);

        return res.json({
            message: "Account is Created",
            token:token
        })
    } catch (e)
    {
        console.log(`Error is ${e}`);
        return res.status(500).json({
            message:"Unable to create Account"
        })
    }
    

})  

//SignIn End Point-------POST METHOD
userRouter.post('/signin', async (req, res) => {
    const signinBody = zod.object({
        email: zod.string().email(),
        password: zod.string()
    })

    const { success } = signinBody.safeParse(req.body);
    if (!success)
    {
        res.status(400).json({
            message: "Invalid Inputs"
        })
    }

    const user = await userModel.findOne({
        email:req.body.email
    })
    console.log('User is ' + user);
    if (!user)
    {
       return  res.status(400).json({
            message:"Invalid Inputs/Email is not present SingUp"
        })
    }
    console.log('Testing1')
    const compare = await bcrypt.compare(req.body.password, user.password);


    if (!compare)
    {
        return res.status(401).json({
            message:"Invalid Credentials"
        })
    }
    const userId = user._id;
    const token = jwt.sign({ userId }, JWT_USER_PASSWORD);
    const decoded = jwt.verify(token, JWT_USER_PASSWORD);
    console.log('Decoded Value is '+ JSON.stringify(decoded));
    res.json({
        message: "User Authenticated Successfully",
        token:token
    })

})

//List of Hotels
userRouter.get('/hotels', userMiddleware,async (req, res) => {
  
    

    const hotels = await hotelModel.find();
    if (hotels.length == 0)
    {
        return res.status(200).json({
            message:"Currently No hotels are available"
        })
    }
    return res.status(200).json({
        hotels:hotels
    })
})



module.exports = userRouter;