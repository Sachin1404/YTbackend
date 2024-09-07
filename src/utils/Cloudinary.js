import { v2 as cloudinary } from 'cloudinary';
import fs, { existsSync } from 'fs';
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadCloudinary=async function(localfile){
    try {
        if(!localfile) return null
        const response=await cloudinary.uploader.upload(localfile,{resource_type:"auto"})
        console.log("file has been uploaded",response.url)
        if (fs.existsSync(localfile)) {
            fs.unlinkSync(localfile);
        }
        return response
    } catch (error) {
        if(fs.existsSync(localfile)){
            fs.unlinkSync(localfile)
        }
        return null
    }
}
export {uploadCloudinary}