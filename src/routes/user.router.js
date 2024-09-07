import { Router } from "express";
import  {registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
const userRouter=Router()
console.log("control is transferred")
userRouter.route('/register').post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),
registerUser)
userRouter.route('/login').post(loginUser)
userRouter.route('/logout').post(authenticate,logoutUser)
userRouter.route('/refresh-token').post(refreshAccessToken)
export default userRouter;
