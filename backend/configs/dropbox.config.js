const Dropbox = require('dropbox').Dropbox;
const User = require('../models/user.model');

async function getDropbox(agentToken) {
    try {
        const user = await User.findOne({ agentToken });

        if (!user || !user.storageCredentials.dropbox) {
            throw new Error("Dropbox credentials not found for this user");
        }

        const dropbox = new Dropbox({
            accessToken: user.storageCredentials.dropbox.access_token
        });

        return dropbox;
    } catch (error) {
        console.error("Dropbox error:", error);
        return null;
    }
}

module.exports = getDropbox;
