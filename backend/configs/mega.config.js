const { Storage } = require('megajs'); 
const User = require('../models/user.model');

const getMega = async (agentToken) => {
    try {
        const user = await User.findOne({ agentToken });
        if (!user || !user.storageCredentials?.mega) {
            return null;
        }

        const { email, password } = user.storageCredentials.mega;
        const mega = new Storage({
            email,
            password,
            keepalive: false, // Disables persistent connection
        });

        await mega.ready; 

        return mega;
        
    } catch (error) {
        console.error("MEGA error:", error);
        return null;
    }
}

module.exports = { getMega };
