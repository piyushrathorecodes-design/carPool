import { Request, Response } from 'express';
import ChatMessage from '../models/ChatMessage.model';
import Group from '../models/Group.model';

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private
export const sendMessage = async (req: any, res: Response): Promise<void> => {
  try {
    const { groupId, content, messageType } = req.body;
    
    // Check if user is member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Group not found'
      });
      return;
    }
    
    const isMember = group.members.some(member => 
      member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to send messages to this group'
      });
      return;
    }
    
    const message = await ChatMessage.create({
      sender: req.user.id,
      groupId,
      content,
      messageType: messageType || 'text'
    });
    
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/history/:groupId
// @access  Private
export const getChatHistory = async (req: any, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    
    // Check if user is member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Group not found'
      });
      return;
    }
    
    const isMember = group.members.some(member => 
      member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to access this group chat'
      });
      return;
    }
    
    const messages = await ChatMessage.find({ groupId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });
    
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/read/:messageId
// @access  Private
export const markAsRead = async (req: any, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Message not found'
      });
      return;
    }
    
    // Check if user is member of the group
    const group = await Group.findById(message.groupId);
    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Group not found'
      });
      return;
    }
    
    const isMember = group.members.some(member => 
      member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to mark messages in this group'
      });
      return;
    }
    
    // Add user to readBy array if not already there
    if (!message.readBy.includes(req.user.id)) {
      message.readBy.push(req.user.id);
      await message.save();
    }
    
    res.status(200).json({
      success: true,
      data: message
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};