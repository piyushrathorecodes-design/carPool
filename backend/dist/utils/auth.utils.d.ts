import { Response } from 'express';
import { IUser } from '../models/User.model';
export declare const generateToken: (user: IUser) => string;
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const sendTokenResponse: (user: IUser, statusCode: number, res: Response) => void;
//# sourceMappingURL=auth.utils.d.ts.map