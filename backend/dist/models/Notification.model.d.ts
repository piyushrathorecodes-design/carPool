import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    sender?: mongoose.Types.ObjectId;
    type: 'match_found' | 'group_joined' | 'group_left' | 'message' | 'system';
    title: string;
    content: string;
    relatedId?: mongoose.Types.ObjectId;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, mongoose.DefaultSchemaOptions> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, INotification>;
export default Notification;
//# sourceMappingURL=Notification.model.d.ts.map