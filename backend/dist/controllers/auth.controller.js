"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getMe = exports.login = exports.register = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const auth_utils_1 = require("../utils/auth.utils");
const register = async (req, res) => {
    try {
        const { name, email, password, phone, gender, year, branch } = req.body;
        if (!email.match(/^[^\s@]+@[^\s@]+\.(edu\.in|ac\.in)$/)) {
            res.status(400).json({
                success: false,
                message: 'Please use a valid educational email (.edu.in or .ac.in)'
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
        const user = await User_model_1.default.create({
            name,
            email,
            password: hashedPassword,
            phone,
            gender,
            year,
            branch
        });
        (0, auth_utils_1.sendTokenResponse)(user, 201, res);
    }
    catch (err) {
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
//# sourceMappingURL=auth.controller.js.map