const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        agentToken: {
            type: String,
            unique: true,
            required: true,
            default: uuidv4
        },
        verificationToken: {
            type: String,
            default: null
        },
        verificationExpires: {
            type: Date,
            default: null
        },
        resetPasswordToken: {
            type: String,
            default: null
        },
        resetPasswordExpires: {
            type: Date,
            default: null
        },
        preferredPlatform: {
            type: String,
            enum: ['cloudinary', 'dropbox', 'mega'],
            default: 'cloudinary'
        },
        loggedInDevice: {
            type: String,
            default: null
        },
        storageCredentials: {
            cloudinary: {
                cloud_name: { type: String, default: null },
                api_key: { type: String, default: null },
                api_secret: { type: String, default: null }
            },
            dropbox: {
                access_token: { type: String, default: null }
            },
            mega: {
                email: { type: String, default: null },
                password: { type: String, default: null }
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);
