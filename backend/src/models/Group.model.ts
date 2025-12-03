import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  groupName: string;
  members: {
    user: mongoose.Types.ObjectId;
    role: 'member' | 'admin';
    joinedAt: Date;
  }[];
  route: {
    pickup: {
      address: string;
      coordinates: [number, number]; // [longitude, latitude]
    };
    drop: {
      address: string;
      coordinates: [number, number]; // [longitude, latitude]
    };
  };
  uberLocations?: {
    pickup?: {
      coordinates: [number, number]; // [latitude, longitude]
    };
    drop?: {
      coordinates: [number, number]; // [latitude, longitude]
    };
  };
  dateTime: Date;
  seatCount: number;
  status: 'Open' | 'Locked' | 'Completed';
  chatRoomId: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema: Schema = new Schema({
  groupName: {
    type: String,
    required: true,
    trim: true
  },
  members: [{
    user: {
      type: Schema.Types.ObjectId,
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
      address: {
        type: String,
        required: true
      },
      coordinates: {
        type: [Number]
      }
    },
    drop: {
      address: {
        type: String,
        required: true
      },
      coordinates: {
        type: [Number]
      }
    }
  },
  dateTime: {
    type: Date,
    required: true
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
  },
  description: {
    type: String,
    trim: true
  },
  uberLocations: {
    pickup: {
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    },
    drop: {
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    }
  }
}, {
  timestamps: true
});

// Index for geospatial queries
GroupSchema.index({ 'route.pickup.coordinates': '2dsphere' });
GroupSchema.index({ 'route.drop.coordinates': '2dsphere' });

const Group = mongoose.model<IGroup>('Group', GroupSchema);
export default Group;