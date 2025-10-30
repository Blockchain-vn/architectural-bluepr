import { Request, Response } from 'express';
import { Stats } from './admin.models';
import mongoose from 'mongoose';
// Import các interface
import { IContent } from '../content/content.models';
import { IUser } from '../user/user.model';
import { IPayment } from '../payment/payment.models';
import { ICopyrightReport } from '../copyright/copyright.models';

// Import các model
const ContentModel = mongoose.model<IContent>('Content');
const UserModel = mongoose.model<IUser>('User');
const PaymentModel = mongoose.model<IPayment>('Payment');
const CopyrightReportModel = mongoose.model<ICopyrightReport>('CopyrightReport');

// Middleware kiểm tra quyền admin
export const isAdmin = (req: any, res: Response, next: Function) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Truy cập bị từ chối' });
};

// Lấy thống kê tổng quan
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Lấy số lượng từ các collection
    const [
      totalContents,
      totalUsers,
      totalTransactions,
      totalReports,
      pendingContents,
      approvedContents,
      rejectedContents
    ] = await Promise.all([
      ContentModel.countDocuments(),
      UserModel.countDocuments(),
      PaymentModel.countDocuments(),
      CopyrightReportModel.countDocuments(),
      ContentModel.countDocuments({ status: 'pending' }),
      ContentModel.countDocuments({ status: 'approved' }),
      ContentModel.countDocuments({ status: 'rejected' })
    ]);

    // Tạo hoặc cập nhật thống kê
    const stats = await Stats.findOneAndUpdate(
      {},
      {
        $set: {
          totalContents,
          totalUsers,
          totalTransactions,
          totalReports,
          pendingContents,
          approvedContents,
          rejectedContents,
          lastUpdated: new Date()
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    });
  }
};

// Duyệt hoặc từ chối nội dung
export const reviewContent = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Phải là "approved" hoặc "rejected"'
      });
    }

    const content = await ContentModel.findByIdAndUpdate(
      contentId,
      { 
        status,
        ...(status === 'rejected' && { rejectionReason: reason }),
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nội dung'
      });
    }

    // Cập nhật lại thống kê
    await getDashboardStats(req, res);

    res.json({
      success: true,
      message: `Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} nội dung thành công`,
      data: content
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái nội dung',
      error: error.message
    });
  }
};

// Lấy danh sách nội dung chờ duyệt
export const getPendingContents = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [contents, total] = await Promise.all([
      ContentModel.find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ContentModel.countDocuments({ status: 'pending' })
    ]);

    res.json({
      success: true,
      data: contents,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách nội dung chờ duyệt',
      error: error.message
    });
  }
};
