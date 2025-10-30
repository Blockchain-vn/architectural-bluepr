import mongoose, { Schema, Document } from 'mongoose';

export interface IContent extends Document {
    title: string;
    description?: string;
    field: string;
    file_type: string;
    file_url: string;
    status: 'pending' | 'approved' | 'rejected';
    createdBy?: mongoose.Types.ObjectId;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    rejectionReason?: string;
}

const ContentSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    field: { type: String, required: true },
    file_type: { type: String, required: true },
    file_url: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: { type: Date },
    rejectionReason: { type: String }
}, { timestamps: true });

export default mongoose.model<IContent>('Content', ContentSchema);