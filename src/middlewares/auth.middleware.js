import { User } from "../model/usermodel.js";
import { Apierrors } from "../utils/APIerrors.js";
import asyncmaker from "../utils/asyncmaker.js";
import jwt from "jsonwebtoken"

export const authenticate=asyncmaker(async(req,res,next)=>{
    const accessToken=req.cookies?.accessToken
    if(!accessToken){
        throw new Apierrors(401,"unauthorised user")
    }
    const token=jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
    const user=await User.findById(token?._id).select("-password -refreshToken")
    if(!user){
        throw new Apierrors(401,"invalid access token")
    }
    req.user=user
    next()
})