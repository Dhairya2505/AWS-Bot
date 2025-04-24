import dotenv from 'dotenv';
dotenv.config();

import mongoose from "mongoose";

;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/AWS_BOT`);
        console.log('connection successfull');
    } catch (error) {
        console.log(error)
    }
})()

const UsersSchema = new mongoose.Schema({
    userName : String,
    Password : String
})

const User = mongoose.model('user',UsersSchema);

export default { User }