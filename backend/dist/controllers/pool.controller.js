"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchPoolRequests = exports.deletePoolRequest = exports.getPoolRequest = exports.getPoolRequests = exports.createPoolRequest = void 0;
const PoolRequest_model_1 = __importDefault(require("../models/PoolRequest.model"));
const createPoolRequest = async (req, res) => {
    try {
        const { pickupLocation, dropLocation, dateTime, preferredGender, seatsNeeded, mode } = req.body;
        const poolRequest = await PoolRequest_model_1.default.create({
            createdBy: req.user.id,
            pickupLocation,
            dropLocation,
            dateTime,
            preferredGender,
            seatsNeeded,
            mode
        });
        res.status(201).json({
            success: true,
            data: poolRequest
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.createPoolRequest = createPoolRequest;
const getPoolRequests = async (req, res) => {
    try {
        const poolRequests = await PoolRequest_model_1.default.find({ createdBy: req.user.id })
            .populate('createdBy', 'name email')
            .populate('matchedUsers', 'name email');
        res.status(200).json({
            success: true,
            count: poolRequests.length,
            data: poolRequests
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.getPoolRequests = getPoolRequests;
const getPoolRequest = async (req, res) => {
    try {
        const poolRequest = await PoolRequest_model_1.default.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('matchedUsers', 'name email');
        if (!poolRequest) {
            res.status(404).json({
                success: false,
                message: 'Pool request not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: poolRequest
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.getPoolRequest = getPoolRequest;
const deletePoolRequest = async (req, res) => {
    try {
        const poolRequest = await PoolRequest_model_1.default.findById(req.params.id);
        if (!poolRequest) {
            res.status(404).json({
                success: false,
                message: 'Pool request not found'
            });
            return;
        }
        if (poolRequest.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Not authorized to delete this pool request'
            });
            return;
        }
        await poolRequest.remove();
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
exports.deletePoolRequest = deletePoolRequest;
const matchPoolRequests = async (req, res) => {
    try {
        const { pickupLocation, dropLocation, dateTime, preferredGender } = req.body;
        const timeRange = 25 * 60 * 1000;
        const startTime = new Date(dateTime.getTime() - timeRange);
        const endTime = new Date(dateTime.getTime() + timeRange);
        const matchingRequests = await PoolRequest_model_1.default.find({
            status: 'Open',
            createdBy: { $ne: req.user.id },
            dateTime: {
                $gte: startTime,
                $lte: endTime
            },
            $or: [
                { preferredGender: 'Any' },
                { preferredGender: preferredGender },
                { preferredGender: { $exists: false } }
            ]
        }).populate('createdBy', 'name email liveLocation');
        const matches = [];
        const maxPickupDistance = 3000;
        const maxDropDistance = 5000;
        for (const request of matchingRequests) {
            const pickupDistance = calculateDistance(pickupLocation.coordinates[1], pickupLocation.coordinates[0], request.pickupLocation.coordinates[1], request.pickupLocation.coordinates[0]);
            const dropDistance = calculateDistance(dropLocation.coordinates[1], dropLocation.coordinates[0], request.dropLocation.coordinates[1], request.dropLocation.coordinates[0]);
            if (pickupDistance <= maxPickupDistance && dropDistance <= maxDropDistance) {
                const timeDifference = Math.abs(request.dateTime.getTime() - dateTime.getTime());
                const timeScore = 1 - (timeDifference / (2 * timeRange));
                const pickupScore = 1 - (pickupDistance / maxPickupDistance);
                const dropScore = 1 - (dropDistance / maxDropDistance);
                const matchScore = (timeScore + pickupScore + dropScore) / 3;
                matches.push({
                    request,
                    matchScore: Math.round(matchScore * 100),
                    distanceSimilarity: {
                        pickup: pickupDistance,
                        drop: dropDistance
                    },
                    timeSimilarity: timeDifference / (60 * 1000)
                });
            }
        }
        matches.sort((a, b) => b.matchScore - a.matchScore);
        res.status(200).json({
            success: true,
            count: matches.length,
            data: matches
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
};
exports.matchPoolRequests = matchPoolRequests;
const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
//# sourceMappingURL=pool.controller.js.map