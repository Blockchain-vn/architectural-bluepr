import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
    contentId: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    guestName?: string;
    email?: string;
    content: string;
    isGuest: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
    {
        contentId: {
            type: Schema.Types.ObjectId,
            ref: 'Content',
            required: true,
            index: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: function () {
                return !this.isGuest;
            },
        },
        guestName: {
            type: String,
            required: function () {
                return this.isGuest;
            },
        },
        email: {
            type: String,
            required: function () {
                return this.isGuest;
            },
        },
        content: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 1000,
        },
        isGuest: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Add compound index for better query performance
commentSchema.index({ contentId: 1, createdAt: -1 });

export default mongoose.model<IComment>('Comment', commentSchema);
