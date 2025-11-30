"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroup = exports.getUserGroups = exports.lockGroup = exports.leaveGroup = exports.joinGroup = exports.createGroup = void 0;
const Group_model_1 = __importDefault(require("../models/Group.model"));
const uuid_1 = require("uuid");
const createGroup = async (req, res) => {
    try {
        const { groupName, route, seatCount } = req.body;
        const chatRoomId = (0, uuid_1.v4)();
        const group = await Group_model_1.default.create({
            groupName,
            members: [{
                    user: req.user.id,
                    role: 'admin',
                    joinedAt: new Date()
                }],
            route,
            seatCount,
            chatRoomId
        });
        res.status(201).json({
            success: true,
            data: group
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.createGroup = createGroup;
const joinGroup = async (req, res) => {
    try {
        const group = await Group_model_1.default.findById(req.params.groupId);
        if (!group) {
            res.status(404).json({
                success: false,
                message: 'Group not found'
            });
            return;
        }
        if (group.status !== 'Open') {
            res.status(400).json({
                success: false,
                message: 'Group is not open for new members'
            });
            return;
        }
        const isMember = group.members.some(member => member.user.toString() === req.user.id);
        if (isMember) {
            res.status(400).json({
                success: false,
                message: 'You are already a member of this group'
            });
            return;
        }
        if (group.members.length >= group.seatCount) {
            res.status(400).json({
                success: false,
                message: 'Group is full'
            });
            return;
        }
        group.members.push({
            user: req.user.id,
            role: 'member',
            joinedAt: new Date()
        });
        await group.save();
        res.status(200).json({
            success: true,
            data: group
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.joinGroup = joinGroup;
const leaveGroup = async (req, res) => {
    try {
        const group = await Group_model_1.default.findById(req.params.groupId);
        if (!group) {
            res.status(404).json({
                success: false,
                message: 'Group not found'
            });
            return;
        }
        const memberIndex = group.members.findIndex(member => member.user.toString() === req.user.id);
        if (memberIndex === -1) {
            res.status(400).json({
                success: false,
                message: 'You are not a member of this group'
            });
            return;
        }
        group.members.splice(memberIndex, 1);
        if (group.members.length === 0) {
            await group.remove();
        }
        else {
            const adminIndex = group.members.findIndex(member => member.role === 'admin');
            if (adminIndex === -1 && group.members.length > 0) {
                group.members[0].role = 'admin';
            }
            await group.save();
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
exports.leaveGroup = leaveGroup;
const lockGroup = async (req, res) => {
    try {
        const group = await Group_model_1.default.findById(req.params.groupId);
        if (!group) {
            res.status(404).json({
                success: false,
                message: 'Group not found'
            });
            return;
        }
        const isAdmin = group.members.some(member => member.user.toString() === req.user.id && member.role === 'admin');
        if (!isAdmin) {
            res.status(403).json({
                success: false,
                message: 'Only group admin can lock the group'
            });
            return;
        }
        group.status = 'Locked';
        await group.save();
        res.status(200).json({
            success: true,
            data: group
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.lockGroup = lockGroup;
const getUserGroups = async (req, res) => {
    try {
        const groups = await Group_model_1.default.find({
            'members.user': req.user.id
        }).populate('members.user', 'name email');
        res.status(200).json({
            success: true,
            count: groups.length,
            data: groups
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.getUserGroups = getUserGroups;
const getGroup = async (req, res) => {
    try {
        const group = await Group_model_1.default.findById(req.params.groupId)
            .populate('members.user', 'name email');
        if (!group) {
            res.status(404).json({
                success: false,
                message: 'Group not found'
            });
            return;
        }
        const isMember = group.members.some(member => member.user.toString() === req.user.id);
        if (!isMember) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to access this group'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: group
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.getGroup = getGroup;
//# sourceMappingURL=group.controller.js.map