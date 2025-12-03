import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender?: 'Male' | 'Female' | 'Other';
  year?: string;
  branch?: string;
  frequentRoute?: {
    home: {
      address: string;
      coordinates: [number, number]; // [longitude, latitude]
    };
    college: {
      address: string;
      coordinates: [number, number]; // [longitude, latitude]
    };
  };
  preferredTime?: 'Morning' | 'Evening';
  liveLocation?: {
    coordinates: [number, number]; // [longitude, latitude]
  };
  studentIdUrl?: string;
  role: 'student' | 'admin';
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true,
    default: 'N/A'
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Other'
  },
  year: {
    type: String,
    trim: true
  },
  branch: {
    type: String,
    trim: true
  },
  frequentRoute: {
    home: {
      address: String,
      coordinates: {
        type: [Number]
      }
    },
    college: {
      address: String,
      coordinates: {
        type: [Number]
      }
    }
  },
  preferredTime: {
    type: String,
    enum: ['Morning', 'Evening']
  },
  liveLocation: {
    coordinates: {
      type: [Number]
    }
  },
  studentIdUrl: {
    type: String
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for geospatial queries
UserSchema.index({ 'frequentRoute.home.coordinates': '2dsphere' });
UserSchema.index({ 'frequentRoute.college.coordinates': '2dsphere' });
UserSchema.index({ 'liveLocation.coordinates': '2dsphere' });

const User = mongoose.model<IUser>('User', UserSchema);
export default User;