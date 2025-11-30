import mongoose, { Document } from 'mongoose';
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
            coordinates: [number, number];
        };
        drop: {
            address: string;
            coordinates: [number, number];
        };
    };
    seatCount: number;
    status: 'Open' | 'Locked' | 'Completed';
    chatRoomId: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const Group: mongoose.Model<IGroup, {}, {}, {}, mongoose.Document<unknown, {}, IGroup, {}, mongoose.DefaultSchemaOptions> & IGroup & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IGroup>;
export default Group;
//# sourceMappingURL=Group.model.d.ts.map