"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const GroupSchema = new mongoose_1.Schema({
    groupName: {
        type: String,
        required: true,
        trim: true
    },
    members: [{
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            role: {
                type: String,
                enum: ['member', 'admin'],
                default: 'member'
            },
            joinedAt: {
                type: Date,
                default: Date.now
            }
        }],
    route: {
        pickup: {
            address: String,
            coordinates: {
                type: [Number],
                index: '2dsphere'
            }
        },
        drop: {
            address: String,
            coordinates: {
                type: [Number],
                index: '2dsphere'
            }
        }
    },
    seatCount: {
        type: Number,
        required: true,
        min: 2,
        max: 4
    },
    status: {
        type: String,
        enum: ['Open', 'Locked', 'Completed'],
        default: 'Open'
    },
    chatRoomId: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});
GroupSchema.index({ 'route.pickup.coordinates': '2dsphere' });
GroupSchema.index({ 'route.drop.coordinates': '2dsphere' });
const Group = mongoose_1.default.model('Group', GroupSchema);
exports.default = Group;
//# sourceMappingURL=Group.model.js.map