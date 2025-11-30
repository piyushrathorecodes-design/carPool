import mongoose, { Document } from 'mongoose';
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
            coordinates: [number, number];
        };
        college: {
            address: string;
            coordinates: [number, number];
        };
    };
    preferredTime?: 'Morning' | 'Evening';
    liveLocation?: {
        coordinates: [number, number];
    };
    studentIdUrl?: string;
    role: 'student' | 'admin';
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IUser>;
export default User;
//# sourceMappingURL=User.model.d.ts.map