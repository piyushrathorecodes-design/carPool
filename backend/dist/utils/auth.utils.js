"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTokenResponse = exports.comparePassword = exports.hashPassword = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: process.env.JWT_EXPIRE || '7d' });
};
exports.generateToken = generateToken;
const hashPassword = async (password) => {
    const salt = await bcryptjs_1.default.genSalt(12);
    return await bcryptjs_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    return await bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const sendTokenResponse = (user, statusCode, res) => {
    const token = (0, exports.generateToken)(user);
    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};
exports.sendTokenResponse = sendTokenResponse;
//# sourceMappingURL=auth.utils.js.map