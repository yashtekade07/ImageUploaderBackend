import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHanlder.js";
import cloudinary from "cloudinary"
import getDataUri from "../utils/dataUri.js";
import { sendToken } from "../utils/sendToken.js";

export const register= catchAsyncError(async(req,res,next)=>{
    const {name,email,password} = req.body;
    const file=req.file;
    if(!name || !email ||  !password||!file) 
        return next( new ErrorHandler('Please fill required Fields',400))

    let user= await User.findOne({email});
    if(user) return next(new ErrorHandler("User already Exist",409))    ;
    
    const fileUri = getDataUri(file);
    const mycloud= await cloudinary.v2.uploader.upload(fileUri.content);
    user= await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:mycloud.public_id,
            url:mycloud.secure_url,
        }
    });
    sendToken(res,user,"Registered Successfully",201)
})

export const login= catchAsyncError(async(req,res,next)=>{
const {email,password} = req.body;

if( !email ||  !password) 
    return next( new ErrorHandler('Please fill required Fields',400))

const user= await User.findOne({email}).select("+password");
if(!user) return next(new ErrorHandler("Incorrect Email or Password",401))    ;

const isMatch= await user.comparePassword(password);

if(!isMatch) return next(new ErrorHandler("Incorrect Email or Password",401))    ;

sendToken(res,user,`Welcome back ${user.name}`,200)
})

export const logout = catchAsyncError(async(req,res,next)=>{
res.status(200).cookie("token",null,{
    expires:new Date(Date.now()),
    httpOnly:true,
    secure:true,
    sameSite:"none",
}).json({
    success:true,
    message:"Logged out Successfully "
})
})
export const getMyProfile = catchAsyncError(async(req,res,next)=>{
    const user= await User.findById(req.user._id);
    res.status(200).json({
        success:true, 
        user,
    })
})

export const changePassword = catchAsyncError(async(req,res,next)=>{
    const {oldPassword,newPassword}=req.body;
    if(!oldPassword ||  !newPassword) 
    return next( new ErrorHandler('Please fill required Fields',400))
    const user= await User.findById(req.user._id).select("+password");
    const isMatch= await user.comparePassword(oldPassword);
    if(!isMatch)  return next( new ErrorHandler('Incorrect Old Password',400))

    user.password=newPassword;
    await user.save();

    res.status(200).json({
        success:true, 
        message:"Password Changed Successfully",
    })
})

export const updateProfile = catchAsyncError(async(req,res,next)=>{
    const {name,email}=req.body;
    const user= await User.findById(req.user._id);

    if(name) user.name=name;
    if(email) user.email=email;
    
    await user.save();

    res.status(200).json({
        success:true, 
        message:"Profile Updated Successfully",
    })
})

export const updateProfilePicture = catchAsyncError(async(req,res,next)=>{
    const user= await User.findById(req.user._id);
    const file=req.file;
    const fileUri = getDataUri(file);
    const mycloud= await cloudinary.v2.uploader.upload(fileUri.content);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id)
    user.avatar={
        public_id:mycloud.public_id, 
        url:mycloud.secure_url,
    }
    await user.save();
    res.status(200).json({
        success:true, 
        message:"Profile Picture Updated Successfully",
    })
})


export const upload = catchAsyncError(async(req,res,next)=>{
    const user= await User.findById(req.user._id);
    const file=req.file;
    const fileUri = getDataUri(file);
    const mycloud= await cloudinary.v2.uploader.upload(fileUri.content);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id)
    user.uploads.push({
        public_id:mycloud.public_id, 
        url:mycloud.secure_url,
    })
    await user.save();
    res.status(200).json({
        success:true, 
        message:"Image Uploaded Successfully",
    })
})

export const deleteMyProfile = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user._id);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    await user.deleteOne();
    
    res.status(200).cookie("token",null,{
        expires:new Date(Date.now()),
    }).json({
        success:true,
        message:"User Deleted Successfully "
    })
})

