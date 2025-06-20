import mongoose, { model, Schema } from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    name:String,
    email:String,
    username:String,
    password:String,
    refreshToken:String,
    friends:[{
        friendUsername:String
    }]
})

userSchema.methods.generateAccessToken= async function(){
    
    return jwt.sign(
        {
            userId: this._id,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_KEY,
        {
            expiresIn:process.env.TOKEN_EXPIRY    
        }
    );    
}

userSchema.methods.generateRefreshToken= async function(){
    return jwt.sign(
        {
            userId:this._id
        },
        process.env.REFRESH_TOKEN_KEY,
        {
            expiresIn:process.env.TOKEN_EXPIRY    
        }
    )    
}

const User = new model('User',userSchema);
export default User;