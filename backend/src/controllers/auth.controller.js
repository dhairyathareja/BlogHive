import User from "../model/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import ErrorWrapper from "../utils/ErrorWrapper.js";

export const signUpController = ErrorWrapper(async (req,res,next) => {

    const {name,email,username,password} = req.body;  

    if(!name || !email || !username || !password){
        throw new ErrorHandler(401,`Please Enter the details....`);
    }
    
    let regex = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/;
    let validEmail = regex.test(email);
    
    if(!validEmail){
        throw new ErrorHandler(401,`Please Enter a Valid Email `);
    }

    let existingUser = await User.findOne({
        $or:[
            {username:username},
            {email:email}
        ]}
    );
    if(existingUser){
        throw new ErrorHandler(400,`User Already Exists`);
    }

    try {
            
            let newUser= await User.create({
                name,
                email,
                username,
                password
            });

            let user= await User.findOne({_id:newUser._id}).select('-password');

            res.status(201).json({
                message: "SignUp Successful",
                user:user
            })    

        } catch (error) {
            throw new ErrorHandler(501,`Internal Server Error Found`);
        }    
    

    
})

const generateAccessAndRefreshToken=async(userId)=>{
    try {
        
        let user= await User.findOne({
            _id:userId
        })
        //
        const accessToken=await user.generateAccessToken();
        const refreshToken= await user.generateRefreshToken();
        return {refreshToken,accessToken}

    } catch (error) {
        throw new ErrorHandler(501,`Error is While Generating Refresh And Access Token`);
    }
}

export const loginController = ErrorWrapper(async (req,res,next) => {

    const{email,password}=req.body;

    if(!email || !password){
        throw new ErrorHandler(401,`Please Enter the Details`);
    }
    
    let user=await User.findOne({email:email});
    if(!user){
        throw new ErrorHandler(401,`User Does Not Exists`);
    }

    if(user.password!=password){
        throw new ErrorHandler(401,`Incorrect Password`);
    }

    const{accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
    user.refreshToken=refreshToken;
    await user.save();

    user= await User.findOne({_id:user._id}).select('-password');
    res.status(200)
       .cookie("RefreshToken",refreshToken).cookie("AccessToken",accessToken)
       .json({
        message:"Login Successful",
        user:user
    })



})