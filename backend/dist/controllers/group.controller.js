"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchGroups = exports.getGroup = exports.getUserGroups = exports.getAllGroups = exports.lockGroup = exports.leaveGroup = exports.joinGroup = exports.createGroup = void 0;
const Group_model_1 = __importDefault(require("../models/Group.model"));
const uuid_1 = require("uuid");
const createGroup = async (req, res) => {
    try {
        console.log('Creating group with data:', req.body);
        console.log('User ID:', req.user._id);
        const { groupName, route, seatCount, description, dateTime } = req.body;
        if (!groupName || !route || !route.pickup || !route.drop || !seatCount || !dateTime) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
            return;
        }
        const chatRoomId = (0, uuid_1.v4)();
        const group = await Group_model_1.default.create({
            groupName,
            members: [{
                    user: req.user._id,
                    role: 'admin',
                    joinedAt: new Date()
                }],
            route,
            dateTime: new Date(dateTime),
            seatCount,
            chatRoomId,
            description
        });
        console.log('Group created successfully:', group._id);
        res.status(201).json({
            success: true,
            data: group
        });
    }
    catch (err) {
        console.error('Error creating group:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.createGroup = createGroup;
const joinGroup = async (req, res) => {
    try {
        console.log('Joining group:', req.params.groupId, 'User ID:', req.user._id);
        const group = await Group_model_1.default.findById(req.params.groupId);
        if (!group) {
            console.log('Group not found:', req.params.groupId);
            res.status(404).json({
                success: false,
                message: 'Group not found'
            });
            return;
        }
        console.log('Found group:', group._id, 'Status:', group.status, 'Members:', group.members.length, 'Seat count:', group.seatCount);
        if (group.status !== 'Open') {
            console.log('Group is not open:', group.status);
            res.status(400).json({
                success: false,
                message: 'Group is not open for new members'
            });
            return;
        }
        const isMember = group.members.some(member => member.user._id.toString() === req.user._id.toString());
        console.log('User is already member:', isMember);
        if (isMember) {
            res.status(400).json({
                success: false,
                message: 'You are already a member of this group'
            });
            return;
        }
        if (group.members.length >= group.seatCount) {
            console.log('Group is full:', group.members.length, '>=', group.seatCount);
            res.status(400).json({
                success: false,
                message: 'Group is full'
            });
            return;
        }
        group.members.push({
            user: req.user._id,
            role: 'member',
            joinedAt: new Date()
        });
        await group.save();
        console.log('User added to group successfully');
        res.status(200).json({
            success: true,
            data: group
        });
    }
    catch (err) {
        console.error('Error joining group:', err);
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
        const memberIndex = group.members.findIndex(member => member.user._id.toString() === req.user._id.toString());
        if (memberIndex === -1) {
            res.status(400).json({
                success: false,
                message: 'You are not a member of this group'
            });
            return;
        }
        group.members.splice(memberIndex, 1);
        if (group.members.length === 0) {
            await group.deleteOne();
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
        const isAdmin = group.members.some(member => member.user._id.toString() === req.user._id.toString() && member.role === 'admin');
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
const getAllGroups = async (req, res) => {
    try {
        const groups = await Group_model_1.default.find()
            .populate('members.user', 'name email phone year branch');
        const groupsWithAccess = groups.map(group => {
            const isMember = group.members.some(member => member.user._id.toString() === req.user._id.toString());
            const canJoin = group.status === 'Open' &&
                !isMember &&
                group.members.length < group.seatCount;
            return {
                ...group.toObject(),
                isMember,
                canJoin
            };
        });
        res.status(200).json({
            success: true,
            count: groupsWithAccess.length,
            data: groupsWithAccess
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.getAllGroups = getAllGroups;
const getUserGroups = async (req, res) => {
    try {
        const groups = await Group_model_1.default.find({
            'members.user': req.user._id
        }).populate('members.user', 'name email phone year branch');
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
        console.log('Getting group details:', req.params.groupId, 'User ID:', req.user._id, 'User ID type:', typeof req.user._id);
        const group = await Group_model_1.default.findById(req.params.groupId)
            .populate('members.user', 'name email phone year branch');
        if (!group) {
            console.log('Group not found:', req.params.groupId);
            res.status(404).json({
                success: false,
                message: 'Group not found'
            });
            return;
        }
        console.log('Found group:', group._id, 'Members:', group.members.map(m => ({
            userId: m.user._id.toString(),
            userType: typeof m.user._id,
            comparison: m.user._id.toString() === req.user._id.toString()
        })));
        const isMember = group.members.some(member => member.user._id.toString() === req.user._id.toString());
        console.log('User is member:', isMember);
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
        console.error('Error getting group:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.getGroup = getGroup;
const matchGroups = async (req, res) => {
    try {
        const { pickupLocation, dropLocation, dateTime, preferredGender } = req.body;
        if (!pickupLocation || !dropLocation || !dateTime) {
            res.status(400).json({
                success: false,
                message: 'Pickup location, drop location, and date time are required'
            });
            return;
        }
        const requestDateTime = new Date(dateTime);
        const timeRange = 25 * 60 * 1000;
        const startTime = new Date(requestDateTime.getTime() - timeRange);
        const endTime = new Date(requestDateTime.getTime() + timeRange);
        const matchingGroups = await Group_model_1.default.find({
            status: 'Open',
            'members.0': { $exists: true },
            $expr: { $lt: [{ $size: '$members' }, '$seatCount'] },
            dateTime: {
                $gte: startTime,
                $lte: endTime
            }
        }).populate({
            path: 'members.user',
            select: 'name email gender year branch phone',
            model: 'User'
        });
        const scoredMatches = matchingGroups.map(group => {
            if (!group.route.pickup.coordinates || !group.route.drop.coordinates ||
                !pickupLocation.coordinates || !dropLocation.coordinates) {
                return {
                    ...group.toObject(),
                    matchScore: 0,
                    distanceSimilarity: {
                        pickup: 0,
                        drop: 0
                    }
                };
            }
            const pickupDistance = calculateDistanceHaversine(pickupLocation.coordinates[1], pickupLocation.coordinates[0], group.route.pickup.coordinates[1], group.route.pickup.coordinates[0]);
            const dropDistance = calculateDistanceHaversine(dropLocation.coordinates[1], dropLocation.coordinates[0], group.route.drop.coordinates[1], group.route.drop.coordinates[0]);
            const timeDiff = Math.abs(group.dateTime.getTime() - requestDateTime.getTime()) / (1000 * 60);
            const distanceScore = Math.max(0, 40 - (pickupDistance + dropDistance) / 1000);
            const timeScore = Math.max(0, 40 - timeDiff / 2);
            let genderScore = 0;
            if (preferredGender && preferredGender !== 'Any') {
                const membersWithGender = group.members.filter(member => {
                    return member.user &&
                        typeof member.user === 'object' &&
                        'gender' in member.user &&
                        member.user.gender === preferredGender;
                });
                genderScore = group.members.length > 0 ? (membersWithGender.length / group.members.length) * 20 : 0;
            }
            else {
                genderScore = 20;
            }
            const matchScore = Math.min(100, distanceScore + timeScore + genderScore);
            return {
                ...group.toObject(),
                matchScore,
                distanceSimilarity: {
                    pickup: pickupDistance,
                    drop: dropDistance
                },
                timeDifference: timeDiff
            };
        });
        const filteredMatches = scoredMatches
            .filter(match => match.matchScore >= 30)
            .sort((a, b) => b.matchScore - a.matchScore);
        res.status(200).json({
            success: true,
            count: filteredMatches.length,
            data: filteredMatches
        });
    }
    catch (err) {
        console.error('Match groups error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.matchGroups = matchGroups;
const calculateDistanceHaversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
//# sourceMappingURL=group.controller.js.map