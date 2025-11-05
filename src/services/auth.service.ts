import { Schema, model, Document, Types } from 'mongoose';
import * as otpGenerator from 'otp-generator';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from 'dotenv';
import { 
    ACCESS_TOKEN_EXPIRES_IN, 
    REFRESH_TOKEN_EXPIRES_IN, 
    OTP_EXPIRES_IN,
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    OTP_CONFIG
} from '../config/jwt.config';

config();

// Interface cho OTP
export interface IOTP extends Document {
    email: string;
    otp: string;
    expiresAt: Date;
}

// Schema cho OTP
const otpSchema = new Schema<IOTP>({
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 0 } // Tự động xóa sau khi hết hạn
}, { timestamps: true });

export const OTP = model<IOTP>('OTP', otpSchema);

// Interface cho Refresh Token
export interface IRefreshToken extends Document {
    userId: Schema.Types.ObjectId;
    token: string;
    expiresAt: Date;
}

// Schema cho Refresh Token
const refreshTokenSchema = new Schema<IRefreshToken>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 0 } // Tự động xóa sau khi hết hạn
}, { timestamps: true });

export const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema);

// Tạo OTP

export const generateOTP = (): string => {
    return otpGenerator.generate(OTP_CONFIG.length, OTP_CONFIG);
};

// Lưu OTP vào database
export const saveOTP = async (email: string, otp: string): Promise<IOTP> => {
    // Xóa tất cả OTP cũ của email này
    await OTP.deleteMany({ email });
    
    // Tạo OTP mới
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + OTP_EXPIRES_IN);
    
    const otpDoc = new OTP({
        email,
        otp,
        expiresAt
    });
    
    return await otpDoc.save();
};

// Xác thực OTP
export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    const otpDoc = await OTP.findOne({ email, otp });
    if (!otpDoc) return false;
    
    // Xóa OTP sau khi đã sử dụng
    await OTP.deleteOne({ _id: otpDoc._id });
    
    return true;
};

// Tạo access token
export const generateAccessToken = (userId: string, role: string): string => {
    const payload = { userId, role };
    const options: SignOptions = { 
        expiresIn: ACCESS_TOKEN_EXPIRES_IN
    };
    
    return jwt.sign(payload, JWT_SECRET, options);
};

// Tạo refresh token
export const generateRefreshToken = async (userId: string): Promise<string> => {
    // Tạo token
    const payload = { userId };
    const options: SignOptions = {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN
    };
    
    const token = jwt.sign(payload, JWT_SECRET, options);

    // Lưu refresh token vào database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Hết hạn sau 7 ngày

    await RefreshToken.create({
        userId,
        token,
        expiresAt
    });

    return token;
};

// Xác thực refresh token
export const verifyRefreshToken = async (token: string): Promise<{ userId: Types.ObjectId } | null> => {
    try {
        // Kiểm tra xem token có tồn tại trong database không
        const tokenDoc = await RefreshToken.findOne({ token });
        if (!tokenDoc) return null;

        // Xác thực token
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
        
        // Xóa token cũ sau khi sử dụng (one-time use)
        await RefreshToken.deleteOne({ token });
        
        return { userId: new Types.ObjectId(decoded.userId) };
    } catch (error) {
        console.error('Lỗi xác thực refresh token:', error);
        return null;
    }
};
