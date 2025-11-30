import mongoose, { Document } from 'mongoose';
export interface IPoolRequest extends Document {
    createdBy: mongoose.Types.ObjectId;
    pickupLocation: {
        address: string;
        coordinates: [number, number];
    };
    dropLocation: {
        address: string;
        coordinates: [number, number];
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
declare const PoolRequest: mongoose.Model<IPoolRequest, {}, {}, {}, mongoose.Document<unknown, {}, IPoolRequest, {}, mongoose.DefaultSchemaOptions> & IPoolRequest & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IPoolRequest>;
export default PoolRequest;
//# sourceMappingURL=PoolRequest.model.d.ts.map