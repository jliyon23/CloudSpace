const cloudinary = require('cloudinary').v2;
const User = require('../models/user.model');

async function getCloudinary(agentToken) {
    try {
        const user = await User.findOne({
            agentToken
        });
    
        cloudinary.config({
            cloud_name: user.storageCredentials.cloudinary.cloud_name,
            api_key: user.storageCredentials.cloudinary.api_key,
            api_secret: user.storageCredentials.cloudinary.api_secret
        });
    
        return cloudinary;
    } catch (error) {
        console.error("Cloudinary error:", error);
        return null;
    }
    
}

module.exports = getCloudinary;
