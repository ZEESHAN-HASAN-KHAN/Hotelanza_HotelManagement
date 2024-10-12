const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

const { MONGO_URI } = require('./config');

async function connect() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('App is connected to Database');

    }
    catch (e)
    {
        console.log('Error while connectting ' + e);
       
    }
}
connect();

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password:String
})

const userModel = mongoose.model('user', userSchema);



const hotelSchema = new mongoose.Schema({
    name: String,
    price: Number,
    adminId:ObjectId
})

const hotelModel = mongoose.model('hotels', hotelSchema)
const adminSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password:String
})

const adminModel = mongoose.model('admin', adminSchema);



module.exports = {
    userModel,
    hotelModel,
    adminModel
}