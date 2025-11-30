"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getChatHistory = exports.sendMessage = void 0;
const ChatMessage_model_1 = __importDefault(require("../models/ChatMessage.model"));
const Group_model_1 = __importDefault(require("../models/Group.model"));
const sendMessage = async (req, res) => {
    try {
        const { groupId, content, messageType } = req.body;
        const group = await Group_model_1.default.findById(groupId);
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
                message: 'Not authorized to send messages to this group'
            });
            return;
        }
        const message = await ChatMessage_model_1.default.create({
            sender: req.user.id,
            groupId,
            content,
            messageType: messageType || 'text'
        });
        res.status(201).json({
            success: true,
            data: message
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.sendMessage = sendMessage;
const getChatHistory = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group_model_1.default.findById(groupId);
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
                message: 'Not authorized to access this group chat'
            });
            return;
        }
        const messages = await ChatMessage_model_1.default.find({ groupId })
            .populate('sender', 'name email')
            .sort({ createdAt: 1 });
        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.getChatHistory = getChatHistory;
const markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await ChatMessage_model_1.default.findById(messageId);
        if (!message) {
            res.status(404).json({
                success: false,
                message: 'Message not found'
            });
            return;
        }
        const group = await Group_model_1.default.findById(message.groupId);
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
                message: 'Not authorized to mark messages in this group'
            });
            return;
        }
        if (!message.readBy.includes(req.user.id)) {
            message.readBy.push(req.user.id);
            await message.save();
        }
        res.status(200).json({
            success: true,
            data: message
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.markAsRead = markAsRead;
//# sourceMappingURL=chat.controller.js.map