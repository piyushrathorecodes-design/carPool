import mongoose, { Document, Schema } from 'mongoose';

export interface IPoolRequest extends Document {
  createdBy: mongoose.Types.ObjectId;
  pickupLocation: {
    address: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  dropLocation: {
    address: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  dateTime: Date;
  preferredGender?: 'Male' | 'Female' | 'Any';
  seatsNeeded: number;
  mode: 'Instant' | 'Scheduled';
  status: 'Open' | 'Matched' | 'Completed' | 'Cancelled';
  matchedUsers: mongoose.Types.ObjectId[];
  groupId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PoolRequestSchema: Schema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickupLocation: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
      required: true
    }
  },
  dropLocation: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
      required: true
    }
  },
  dateTime: {
    type: Date,
    required: true
  },
  preferredGender: {
    type: String,
    enum: ['Male', 'Female', 'Any'],
    default: 'Any'
  },
  seatsNeeded: {
    type: Number,
    default: 1,
    min: 1,
    max: 4
  },
  mode: {
    type: String,
    enum: ['Instant', 'Scheduled'],
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Matched', 'Completed', 'Cancelled'],
    default: 'Open'
  },
  matchedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  }
}, {
  timestamps: true
});

// Index for geospatial queries
PoolRequestSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
PoolRequestSchema.index({ 'dropLocation.coordinates': '2dsphere' });

const PoolRequest = mongoose.model<IPoolRequest>('PoolRequest', PoolRequestSchema);
export default PoolRequest;