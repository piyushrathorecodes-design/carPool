import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: 'match_found' | 'group_joined' | 'group_left' | 'message' | 'system';
  title: string;
  content: string;
  relatedId?: mongoose.Types.ObjectId; // Reference to related entity (pool request, group, etc.)
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['match_found', 'group_joined', 'group_left', 'message', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  relatedId: {
    type: Schema.Types.ObjectId
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
NotificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;