import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  sender: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'location';
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema: Schema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'location'],
    default: 'text'
  },
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for efficient querying
ChatMessageSchema.index({ groupId: 1, createdAt: 1 });

const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
export default ChatMessage;