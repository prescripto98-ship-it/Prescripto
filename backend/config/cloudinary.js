import {v2 as cloudinary} from 'cloudinary'

const connectCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINNARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET_KEY
    })
}

export default connectCloudinary