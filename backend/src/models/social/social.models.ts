import mongoose, { Document, Schema } from 'mongoose';

export enum InteractionType {
  VIEW = 'view',
  SHARE = 'share'
}

export interface ISocialInteraction extends Document {
  contentId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // Optional for anonymous users
  type: InteractionType;
  platform?: string; // e.g., 'facebook', 'twitter', 'direct_link'
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

const SocialInteractionSchema = new Schema<ISocialInteraction>(
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
      index: true
    },
    type: {
      type: String,
      enum: Object.values(InteractionType),
      required: true,
      index: true
    },
    platform: {
      type: String,
      trim: true
    },
    userAgent: String,
    ipAddress: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

// Compound index for tracking unique views per user/content
SocialInteractionSchema.index(
  { contentId: 1, userId: 1, type: 1 },
  { unique: true, partialFilterExpression: { userId: { $exists: true } } }
);

// Index for counting interactions by content
export const SocialInteraction = mongoose.model<ISocialInteraction>('SocialInteraction', SocialInteractionSchema);

// Content Stats Schema (for denormalized data)
const ContentStatsSchema = new Schema({
  contentId: {
    type: Schema.Types.ObjectId,
    ref: 'Content',
    required: true,
    unique: true
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  shareCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Index for fast lookups
ContentStatsSchema.index({ contentId: 1 });

export const ContentStats = mongoose.model('ContentStats', ContentStatsSchema);
