import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from '../user/user.model';

export interface IContentDetails {
    dimensions?: string;
    bedrooms?: number;
    bathrooms?: number;
    [key: string]: any; // Cho phép thêm các trường tùy chỉnh khác
}

export interface IContent extends Document {
    title: string;
    description: string;
    category_id: Types.ObjectId;
    file_id: Types.ObjectId;
    price?: number;
    details: IContentDetails;
    status: 'pending' | 'approved';
    createdBy: IUser['_id'];
}

const contentSchema = new Schema<IContent>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        category_id: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        file_id: {
            type: Schema.Types.ObjectId,
            ref: 'File',
            required: true,
        },
        price: {
            type: Number,
            min: 0,
        },
        details: {
            dimensions: {
                type: String,
                trim: true,
            },
            bedrooms: {
                type: Number,
                min: 0,
            },
            bathrooms: {
                type: Number,
                min: 0,
            },
        },
        status: {
            type: String,
            enum: ['pending', 'approved'],
            default: 'pending',
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IContent>('Content', contentSchema);