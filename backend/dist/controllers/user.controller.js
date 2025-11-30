"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserLocation = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUser = exports.getUsers = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const auth_utils_1 = require("../utils/auth.utils");
const getUsers = async (req, res) => {
    try {
        const users = await User_model_1.default.find();
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.getUsers = getUsers;
const getUser = async (req, res) => {
    try {
        const user = await User_model_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
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
exports.getUser = getUser;
const createUser = async (req, res) => {
    try {
        const user = await User_model_1.default.create(req.body);
        res.status(201).json({
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
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Not authorized to update this user'
            });
            return;
        }
        if (req.body.password) {
            req.body.password = await (0, auth_utils_1.hashPassword)(req.body.password);
        }
        const user = await User_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
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
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const user = await User_model_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.deleteUser = deleteUser;
const updateUserLocation = async (req, res) => {
    try {
        const { coordinates } = req.body;
        const user = await User_model_1.default.findByIdAndUpdate(req.user.id, { liveLocation: { coordinates } }, {
            new: true,
            runValidators: true
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
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
exports.updateUserLocation = updateUserLocation;
//# sourceMappingURL=user.controller.js.map