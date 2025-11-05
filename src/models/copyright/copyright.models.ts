import mongoose, { Document, Schema } from 'mongoose';

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

export enum ViolationType {
  COPYRIGHT = 'copyright',
  TRADEMARK = 'trademark',
  PRIVACY = 'privacy',
  OTHER = 'other'
}

export interface ICopyrightReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  reportedContentId?: mongoose.Types.ObjectId;
  violationType: ViolationType;
  description: string;
  status: ReportStatus;
  evidence: string[];
  adminNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
}

const CopyrightReportSchema = new Schema<ICopyrightReport>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      ref: 'Content',
      required: true,
    },
    reportedContentId: {
      type: Schema.Types.ObjectId,
      ref: 'Content',
    },
    violationType: {
      type: String,
      enum: Object.values(ViolationType),
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ReportStatus),
      default: ReportStatus.PENDING,
    },
    evidence: [{
      type: String, // URLs to evidence files
      required: true,
    }],
    adminNotes: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
CopyrightReportSchema.index({ contentId: 1 });
CopyrightReportSchema.index({ reporterId: 1 });
CopyrightReportSchema.index({ status: 1 });
CopyrightReportSchema.index({ createdAt: -1 });

export default mongoose.model<ICopyrightReport>('CopyrightReport', CopyrightReportSchema);
