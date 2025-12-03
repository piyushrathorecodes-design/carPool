"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAuth = exports.verifyEmail = exports.logout = exports.getMe = exports.login = exports.register = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const auth_utils_1 = require("../utils/auth.utils");
const email_utils_1 = require("../utils/email.utils");
const crypto_1 = __importDefault(require("crypto"));
const firebase_admin_service_1 = require("../services/firebase-admin.service");
const register = async (req, res) => {
    try {
        const { name, email, password, phone, gender, year, branch } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
            return;
        }
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            res.status(400).json({
                success: false,
                message: 'Please enter a valid email'
            });
            return;
        }
        const existingUser = await User_model_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
            return;
        }
        const hashedPassword = await (0, auth_utils_1.hashPassword)(password);
        const emailVerificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const user = await User_model_1.default.create({
            name,
            email,
            password: hashedPassword,
            phone: phone || 'N/A',
            gender: gender || 'Other',
            year: year || 'N/A',
            branch: branch || 'N/A',
            emailVerificationToken,
            emailVerificationExpires,
            isEmailVerified: false
        });
        try {
            await (0, email_utils_1.sendEmailVerification)(user, emailVerificationToken);
            res.status(201).json({
                success: true,
                message: 'User registered successfully. Please check your email for verification link.',
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email
                    }
                }
            });
        }
        catch (emailError) {
            console.error('Email sending failed:', emailError);
            res.status(201).json({
                success: true,
                message: 'User registered successfully. Email verification may be delayed.',
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email
                    }
                }
            });
        }
    }
    catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Please provide an email and password'
            });
            return;
        }
        const user = await User_model_1.default.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        if (!user.isEmailVerified) {
            res.status(401).json({
                success: false,
                message: 'Please verify your email before logging in'
            });
            return;
        }
        const isMatch = await (0, auth_utils_1.comparePassword)(password, user.password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        (0, auth_utils_1.sendTokenResponse)(user, 200, res);
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await User_model_1.default.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.getMe = getMe;
const logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        data: {}
    });
};
exports.logout = logout;
const verifyEmail = async (req, res) => {
    try {
        const { token, userId } = req.query;
        if (!token || !userId) {
            res.status(400).json({
                success: false,
                message: 'Invalid verification link'
            });
            return;
        }
        const user = await User_model_1.default.findOne({
            _id: userId,
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
            return;
        }
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    }
    catch (err) {
        console.error('Email verification error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.verifyEmail = verifyEmail;
const firebaseAuth = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            res.status(400).json({
                success: false,
                message: 'ID token is required'
            });
            return;
        }
        const decodedToken = await (0, firebase_admin_service_1.verifyFirebaseIdToken)(idToken);
        let email;
        let name;
        if (decodedToken.email) {
            email = decodedToken.email;
        }
        else if (decodedToken.payload?.email) {
            email = decodedToken.payload.email;
        }
        else if (decodedToken.firebase?.identities?.email?.[0]) {
            email = decodedToken.firebase.identities.email[0];
        }
        if (decodedToken.name) {
            name = decodedToken.name;
        }
        else if (decodedToken.displayName) {
            name = decodedToken.displayName;
        }
        else if (decodedToken.payload?.name) {
            name = decodedToken.payload.name;
        }
        else if (decodedToken.payload?.displayName) {
            name = decodedToken.payload.displayName;
        }
        if (!email) {
            console.error('Decoded token structure:', JSON.stringify(decodedToken, null, 2));
            res.status(400).json({
                success: false,
                message: 'Invalid Firebase token: missing email'
            });
            return;
        }
        let user = await User_model_1.default.findOne({ email });
        if (!user) {
            const userName = name || email.split('@')[0] || 'Firebase User';
            const phone = `FB_${Date.now()}`;
            user = await User_model_1.default.create({
                name: userName,
                email,
                password: await (0, auth_utils_1.hashPassword)(crypto_1.default.randomBytes(20).toString('hex')),
                phone,
                gender: 'Other',
                year: 'N/A',
                branch: 'N/A',
                isEmailVerified: true,
                emailVerificationToken: undefined,
                emailVerificationExpires: undefined
            });
        }
        else if (!user.isEmailVerified) {
            user.isEmailVerified = true;
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            await user.save();
        }
        (0, auth_utils_1.sendTokenResponse)(user, 200, res);
    }
    catch (err) {
        console.error('Firebase auth error:', err);
        res.status(401).json({
            success: false,
            message: 'Firebase authentication failed: ' + (err.message || 'Unknown error')
        });
    }
};
exports.firebaseAuth = firebaseAuth;
//# sourceMappingURL=auth.controller.js.map