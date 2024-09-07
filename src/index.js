import 'dotenv/config';
import mongoose from 'mongoose';
import { DB_NAME } from './constants.js';
import express from 'express';
import app from './app.js';
;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log(error)
        })
        app.listen(process.env.PORT,()=>{
            console.log(`app is listening at ${process.env.PORT}`)
        })
    } catch (error) {
        console.log("error aa gyi h")
        throw(error)
    }
})()