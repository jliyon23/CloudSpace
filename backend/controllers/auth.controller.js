const { sendVerificationEmail } = require('../middlewares/Email.js');
const { generateTokenAndSetCookies } = require('../middlewares/generateToken');
const User = require('../models/user.model.js');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log(req.body);
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate a unique agentToken for authentication with ElectronJS
        const agentToken = uuidv4(); 

        // Generate verification token (6-digit OTP)
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        // Create user with the generated tokens
        const user = new User({ username, email, password: hashedPassword, agentToken, verificationToken });
        await user.save();

        // Send verification email
        sendVerificationEmail(email, verificationToken);

        res.status(201).json({ 
            message: 'User registered successfully. Please verify your email.',
            agentToken // Send the token in the response if needed
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }

        //compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if(!user.isVerified){
            return res.status(401).json({ message: 'User is not verified', notVerified: true });
        }

        //generate token
        const token = await generateTokenAndSetCookies(res,user._id);

        res.status(200).json({ message: 'User logged in successfully', token, user });

    } catch (error) {
        res.status(500).json({ message: 'Error logging in user', error: error.message });
    }
};


const sendForgotPasswordCode = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email);
        if(!email){
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate verification token
        const resetPasswordToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();

        // Send verification email with correct token
        sendVerificationEmail(email, resetPasswordToken);

        res.status(200).json({ message: 'Verification code sent successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Error sending verification code', error: error.message });
    }
};


const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        if(!email || !code){
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }

        if(user.verificationToken !== code){
            return res.status(401).json({ message: 'Invalid verification code' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpiresAt = null;
        await user.save();

        res.status(200).json({ message: 'User verified successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Error verifying user', error: error.message });
    }
}

const verifyForgotPasswordCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        if(!email){
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }

        //verify code
        if(user.resetPasswordToken !== code){
            return res.status(401).json({ message: 'Invalid verification code' });
        }

        res.status(200).json({ message: 'Email verified successfully, now reset your password' });

    } catch (error) {
        res.status(500).json({ message: 'Error sending verification code', error: error.message });

    }
}

const updatePassword = async(req, res) => {
    try {
        const { email, newPassword } = req.body;
        if(!email || !newPassword){
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpiresAt = null;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        
    }
};


 
module.exports = { register, login, verifyEmail, sendForgotPasswordCode, verifyForgotPasswordCode, updatePassword };