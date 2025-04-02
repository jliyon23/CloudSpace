const getCloudinary = require("../configs/cloudinary.config")
const getDropbox = require("../configs/dropbox.config");
const {getMega} = require('../configs/mega.config')
const fs = require("fs-extra");
const User = require("../models/user.model");
const File = require("../models/file.model");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { computeFileHash } = require('../utils/crypto');
const Notification = require('../models/notification.model');

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const filePath = req.file.path;
        const fileName = req.file.originalname;

        const fileHash = await computeFileHash(filePath);


        // Find user based on agentToken
        const user = await User.findOne({ agentToken: req.body.agentToken });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingFile = await File.findOne({ hash: fileHash, user: user._id });

        if (existingFile) {
            // If file already exists, return existing URL instead of uploading
            await fs.remove(filePath);

            // Notify user of existing file
            const notification = new Notification({
                user: user._id,
                message: `File '${fileName}' already exists in your account.`,
                status: "error"
            });
            await notification.save();

            return res.json({ 
                message: "File already uploaded", 
                url: existingFile.url, 
                platform: existingFile.platform 
            });
        }

        if (user.preferredPlatform === "cloudinary") {
            const cloudinary = await getCloudinary(req.body.agentToken);
            if (!cloudinary) {
                return res.status(500).json({ message: "Error getting Cloudinary instance" });
            }

            const existingFile = await File.findOne({ name: fileName, platform: "cloudinary" });
            if (existingFile) {
                const publicId = existingFile.url.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
                await File.deleteOne({ _id: existingFile._id });
                console.log(`Old file '${fileName}' deleted from Cloudinary and database.`);
            }

            const result = await cloudinary.uploader.upload(filePath, { resource_type: "auto" });
            const newFile = new File({
                user: user._id,
                name: fileName,
                size: req.file.size,
                type: req.file.mimetype,
                platform: "cloudinary",
                url: result.secure_url,
                hash: fileHash
            });
            await newFile.save();
            await fs.remove(filePath);

            // Notify user of uploaded file
            const notification = new Notification({
                user: user._id,
                message: `File '${fileName}' uploaded successfully.`,
                status: "success"
            });
            await notification.save();

            return res.json({ message: "File uploaded successfully", cloudinaryUrl: result.secure_url });
        }
        
        else if (user.preferredPlatform === "dropbox") {
            const dropbox = await getDropbox(req.body.agentToken);
            if (!dropbox) {
                return res.status(500).json({ message: "Error getting Dropbox instance" });
            }

            const existingFile = await File.findOne({ name: fileName, platform: "dropbox" });
            if (existingFile) {
                try {
                    await dropbox.filesDeleteV2({ path: `/${fileName}` });
                    await File.deleteOne({ _id: existingFile._id });
                    console.log(`Deleted old file: ${fileName}`);
                } catch (error) {
                    console.error("Dropbox file deletion error:", error);
                }
            }

            const fileBuffer = await fs.readFile(filePath);
            await dropbox.filesUpload({ path: `/${fileName}`, contents: fileBuffer, mode: { ".tag": "overwrite" } });
            let dropboxUrl = "";
            
            try {
                const existingLinks = await dropbox.sharingListSharedLinks({ path: `/${fileName}` });
                if (existingLinks?.result?.links?.length > 0) {
                    dropboxUrl = existingLinks.result.links[0].url.replace("?dl=0", "?raw=1");
                } else {
                    const sharedLinkResponse = await dropbox.sharingCreateSharedLinkWithSettings({ path: `/${fileName}` });
                    if (sharedLinkResponse?.result?.url) {
                        dropboxUrl = sharedLinkResponse.result.url.replace("?dl=0", "?raw=1");
                    }
                }
                console.log("Dropbox File URL:", dropboxUrl);
            } catch (error) {
                console.error("Dropbox shared link error:", error);
                return res.status(500).json({ message: "Error generating Dropbox shared link", error });
            }

            if (!dropboxUrl) {
                return res.status(500).json({ message: "Failed to generate Dropbox link" });
            }

            const newFile = new File({
                user: user._id,
                name: fileName,
                size: req.file.size,
                type: req.file.mimetype,
                platform: "dropbox",
                url: dropboxUrl,
                hash: fileHash
            });
            await newFile.save();

            // Notify user of uploaded file
            const notification = new Notification({
                user: user._id,
                message: `File '${fileName}' uploaded successfully.`,
                status: "success"
            });
            await notification.save();

            await fs.remove(filePath);
            return res.json({ message: "File uploaded successfully", dropboxUrl });
        }
        
        else if (user.preferredPlatform === "mega") {
            const mega = await getMega(req.body.agentToken);
            if (!mega) {
                return res.status(500).json({ message: "Error getting MEGA instance" });
            }
        
            try {
                const fileStream = fs.createReadStream(filePath);
                const fileSize = fs.statSync(filePath).size; // Get file size
        
                // Upload file with explicit file size
                const uploadStream = mega.upload({ name: fileName, size: fileSize });
        
                fileStream.pipe(uploadStream);
                const megaFile = await uploadStream.complete; // Wait for upload completion
        
                // Get the public link
                const megaUrl = await new Promise((resolve, reject) => {
                    megaFile.link((err, url) => {
                        if (err) return reject(err);
                        resolve(url);
                    });
                });
        
                // Save file details to database
                const newFile = new File({
                    user: user._id,
                    name: fileName,
                    size: req.file.size,
                    type: req.file.mimetype,
                    platform: "mega",
                    url: megaUrl,
                    hash: fileHash
                });
                await newFile.save();

                // Notify user of uploaded file
                const notification = new Notification({
                    user: user._id,
                    message: `File '${fileName}' uploaded successfully.`,
                    status: "success"
                });
                await notification.save();

                await fs.remove(filePath);
        
                return res.json({ message: "File uploaded successfully", megaUrl });
            } catch (error) {
                console.error("MEGA Upload Error:", error);
                return res.status(500).json({ message: "Error uploading file to MEGA", error: error.message });
            }
        }
        
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ message: "Error uploading file", error: error.message });
    }
};


const addCredentials = async (req, res) => {
    try {
        const { credentials, platform, token } = req.body;

        if (!credentials || !platform) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Decode token to get userId
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId; // Ensure the token contains 'id'

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Dynamically update the storageCredentials
        if (['cloudinary', 'dropbox', 'mega'].includes(platform)) {
            user.storageCredentials[platform] = credentials;
            await user.save();

            // Notify user of added credentials
            const notification = new Notification({
                user: user._id,
                message: `Credentials for ${platform.charAt(0).toUpperCase() + platform.slice(1)} added successfully.`,
                status: "success"
            });
            await notification.save();

            return res.status(200).json({ message: "Credentials added successfully" });
        } else {
            return res.status(400).json({ message: "Invalid platform" });
        }

    } catch (error) {
        console.error("Error adding credentials:", error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const fetchCredentials = async (req, res) => {
    try {
        const { token } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const credentials = user.storageCredentials;
        res.status(200).json({ credentials });

    } catch (error) {
        console.error("Error fetching credentials:", error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const listFiles = async (req, res) => {
    try {
        const { token } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        //fetch all files in descending order of createdAt
        const files = await File.find({ user: userId }).sort({ createdAt: -1 });

        res.status(200).json({ files });


    } catch (error) {

    }
};

const changePreferredPlatform = async (req, res) => {
    try {
        const { token, preferredPlatform } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if credentials exist for the selected platform
        const platformCredentials = user.storageCredentials[preferredPlatform];

        if (!platformCredentials || Object.values(platformCredentials).some(value => value === null)) {
            // Notify user
            await new Notification({
                user: user._id,
                message: `Credentials for ${preferredPlatform} are not added. Please add them first.`,
                status: "error"
            }).save();
            return res.status(400).json({ message: `Credentials for ${preferredPlatform} are not added. Please add them first.` });
        }

        // Update preferred platform
        user.preferredPlatform = preferredPlatform;
        await user.save();

        // Notify user of the change
        await new Notification({
            user: user._id,
            message: `Preferred platform changed to ${preferredPlatform}.`,
            status: "success"
        }).save();

        res.status(200).json({ message: "Preferred platform changed successfully" });

    } catch (error) {
        console.error("Error changing preferred platform:", error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const fetchNotifications = async (req, res) => {
    try {
        const { token } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const notifications = await Notification.find({ user: userId }).sort({ date: -1 });

        res.status(200).json({ notifications });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const fetchPreferredPlatform = async (req, res) => {
    try {
        const { token } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId = decoded.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const preferredPlatform = user.preferredPlatform;
        res.status(200).json({ preferredPlatform });

    } catch (error) {
        console.error("Error fetching preferred platform:", error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const deleteFile = async (req, res) => {
    try {
        const { token, id } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const file = await File.findById(id);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (file.user.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await file.deleteOne();

        res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { uploadFile, addCredentials, listFiles, fetchCredentials, changePreferredPlatform, fetchNotifications, fetchPreferredPlatform, deleteFile };