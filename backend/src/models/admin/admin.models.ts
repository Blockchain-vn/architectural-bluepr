import mongoose from 'mongoose';

// Interface cho thống kê
export interface IStats {
  totalContents: number;
  totalUsers: number;
  totalTransactions: number;
  totalReports: number;
  pendingContents: number;
  approvedContents: number;
  rejectedContents: number;
  lastUpdated: Date;
}

// Schema cho thống kê
const statsSchema = new mongoose.Schema<IStats>({
  totalContents: { type: Number, default: 0 },
  totalUsers: { type: Number, default: 0 },
  totalTransactions: { type: Number, default: 0 },
  totalReports: { type: Number, default: 0 },
  pendingContents: { type: Number, default: 0 },
  approvedContents: { type: Number, default: 0 },
  rejectedContents: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

// Model cho thống kê
export const Stats = mongoose.model<IStats>('Stats', statsSchema);
