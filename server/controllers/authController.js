import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, username, email, password } = req.body;

    try {
        let userByEmail = await User.findOne({ email });
        if (userByEmail) {
            return res.status(400).json({ message: "An account with this email already exists" });
        }
        let userByUsername = await User.findOne({ username });
        if(userByUsername){
            return res.status(400).json({ message: "This username is already taken" });
        }

        const user = await User.create({ name, username, email, password });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select("+password");
        if(user && (await user.matchPassword(password))) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleAuthCallback = (req, res) => {
    const user = req.user;
    const token = generateToken(user._id);
    res.redirect(`${process.env.CLIENT_URL}/login/success?token=${token}`);
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user){
        return res.status(200).json({ message: "If the email exists, you will receive a reset link" });
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const message = `Hello ${user.name},\n\nYou requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n\nThank you!`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            message,
        });
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending email:", error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500).json({ message: "Email could not be sent", error: error.message });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex");
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            message: "Password has been reset successfully",
        });
        
    } catch (error) {
        console.error("Error in resetPassword controller:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: "Server error", error: error.message });
        
    }
};

// @desc    Get current user's profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = (req, res) => {
    res.status(200).json(req.user);
};