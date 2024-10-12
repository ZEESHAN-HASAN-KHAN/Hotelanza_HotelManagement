const express = require('express');

const adminRouter = express.Router();
const {adminMiddleware} =require('../middleware/admin')
const { adminModel,hotelModel } = require('../db');

const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

const zod = require('zod');
const { JWT_ADMIN_PASSWORD } = require('../config');

// const {userMiddleware} =require('../middleware/user')


adminRouter.post('/signup', async (req, res) => {
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
    console.log('t')
    const existingUser = await adminModel.findOne({
        email:req.body.email
    });
    console.log('t'+existingUser)
    if (existingUser)
    {
        return res.status(409).json({
            message:"User Already Exist Please Sign in"
        })
    }
    //Salting the Original Password
    try {
        const hashPassword = await bcrypt.hash(req.body.password, 5);
        const admin = await adminModel.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password:hashPassword
        })
        // Printing the User
        console.log(admin);
        const adminId = admin._id;
        //Generating Token
        const token = jwt.sign({ adminId }, JWT_ADMIN_PASSWORD)
        
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
adminRouter.post('/signin', async (req, res) => {
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

    const admin = await adminModel.findOne({
        email:req.body.email
    })
    console.log('Admin is ' +admin);
    if (!admin)
    {
        res.status(400).json({
            message:"Invalid Inputs/Email is not present SingUp"
        })
    }
  
    const compare = await bcrypt.compare(req.body.password, admin.password);


    if (!compare)
    {
        return res.status(401).json({
            message:"Invalid Credentials"
        })
    }
    const adminId =admin._id;
    const token = jwt.sign({ adminId }, JWT_ADMIN_PASSWORD);
    const decoded = jwt.verify(token, JWT_ADMIN_PASSWORD);
    console.log('Decoded Value is '+ JSON.stringify(decoded));
    res.json({
        message: "ADMIN Authenticated Successfully",
        token:token
    })

})


//Admin Can Post the hotels
adminRouter.post('/hotel', adminMiddleware, async (req, res) => {

    const adminId = req.adminId;
    
    const hotel = await hotelModel.create({
        name: req.body.name,
        price: req.body.price,
        adminId:adminId
    })

    res.status(200).json({
        hotel
    })

})

//Admin Can Edit there hotels
adminRouter.put('/hotel/:id', adminMiddleware,async (req, res) => {
    try {
        const hotelId = req.params.id;
        const hotel = await hotelModel.findOneAndUpdate({ _id: hotelId }, { name:'testUpdate'})
        res.status(200).json({
            message: "You hotel is updated"
        })
    } catch (e)
    {
       return res.send(e);
    }
})

//admin can see all his listed Properties
adminRouter.get('/hotels', adminMiddleware, async(req, res) => {
    const hotels = await hotelModel.find();

    res.status(200).json({
        hotels
    })
})
module.exports = adminRouter;
