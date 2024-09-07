import { User } from "../model/usermodel.js";
import { Apierrors } from "../utils/APIerrors.js";
import { Apiresponse } from "../utils/APIresponse.js";
import asyncmaker from "../utils/asyncmaker.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
import jwt from 'jsonwebtoken';
const createTokens=async(userid)=>{
    const user=await User.findById(userid)
    const accessToken=await user.AccessTokenGeneration()
    const refreshToken=await user.RefreshTokenGeneration()
    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false})
    return {accessToken,refreshToken}
}
const registerUser=asyncmaker(async (req,res)=>{
   //logic for registering user:-
   // get the info from the user
   //validate that info(not empty)
   //check if the user already exists
   //check for avatar and cover image
   //upload images on cloudinary
   //create user object that you store in db
   //i will get a response from db
   //while sending this response to the frontend guy, i have to remove password and token field
   //return the response
   const {username, email, fullname, password}=req.body
   console.log(username)
   if (!username || typeof username !== 'string' || username.trim() === "") {
    throw new Apierrors(400, "Username is required");
}
if (!email || typeof email !== 'string' || email.trim() === "") {
    throw new Apierrors(400, "Email is required");
}
if (!password || typeof password !== 'string' || password.trim() === "") {
    throw new Apierrors(400, "Password is required");
}
if (!fullname || typeof fullname !== 'string' || fullname.trim() === "") {
    throw new Apierrors(400, "Full name is required");
}

   const existingUser=await User.findOne({
    $or:[{username},{email}]
   })
   if(existingUser){
    throw new Apierrors(409,"User already exists")
   }
   const avatarlocalpath = req.files?.avatar?.[0]?.path;
const coverImagelocalpath = req.files?.coverImage?.[0]?.path;
   if(!avatarlocalpath){
    throw new Apierrors(400,"avatarlocalpath is required")
   }
   const avatar=await uploadCloudinary(avatarlocalpath)
   const coverImage=await uploadCloudinary(coverImagelocalpath)
   if(!avatar){
    throw new Apierrors(400,"avatar is required")
   }
   const user=await  User.create({
    username:username.toLowerCase(),
    fullname:fullname,
    email:email,
    password:password,
    avatar:avatar.url,
    coverImage:coverImage?.url || ""
   })
   const checkuser=await User.findById(user._id).select(
    "-password -refreshToken"
   )
   if(!checkuser){
    throw new Apierrors(500,"something went wrong while storing it in databse")
   }
   return res.status(201).json(
    new Apiresponse(200,checkuser,"user is registered seccessfully")
   )
})
const loginUser=asyncmaker(async(req,res)=>{
    //i will the user info
    //i will find the user in db by email or username
    //i will check the user info
    //i will generate tokens
    const {username,email,password}=req.body
    if(!username && !email){
        throw new Apierrors(400,"email or username is required")
    }
    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new Apierrors(404,"user not found")
    }
    const passcheck=await user.passwordCheck(password)
    if(!passcheck){
        throw new Apierrors(401,"incorrect password")
    }
    const {accessToken,refreshToken}=await createTokens(user._id)
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
        new Apiresponse(
            201,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User is logged in successfully"
        )
    )
})
const logoutUser=(async(req,res)=>{
    const user=req.user
    await User.findByIdAndUpdate(
        user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
        new Apiresponse(
            201,
            {},
            "user has been logged out"
        )
    )
})
const refreshAccessToken=asyncmaker(async(req,res)=>{
    const incomingrefreshToken=req.cookies?.refreshToken
    if(!incomingrefreshToken){
        throw new Apierrors(400,"refresh token not found")
    }
    const decodedToken=jwt.verify(incomingrefreshToken,REFRESH_TOKEN_SECRET)
    const user=await User.findById(decodedToken?._id)
    if(!user){
        throw new Apierrors(400,"invalid refresh token")
    }
    if(user.refreshToken!==incomingrefreshToken){
        throw new Apierrors(400,"refrsh token expired")
    }
    const {accessToken,refreshToken}=await createTokens(user._id)
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).res(
        new Apiresponse(
            200,
            {accessToken,refreshToken},
            "access token refreshed successfully"
        )
    )
})
export {registerUser,loginUser,logoutUser,refreshAccessToken};