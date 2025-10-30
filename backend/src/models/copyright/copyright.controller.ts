import { Request, Response } from 'express';
import mongoose from 'mongoose';
import CopyrightReport, { ICopyrightReport, ReportStatus, ViolationType } from './copyright.models';
import { IUser } from '../user/user.model';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

/**
 * Tạo báo cáo vi phạm bản quyền mới
 */
export const createReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contentId, reportedContentId, violationType, description, evidence } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để gửi báo cáo',
      });
    }

    // Validate required fields
    if (!contentId || !violationType || !description || !evidence?.length) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc',
      });
    }

    // Validate violation type
    if (!Object.values(ViolationType).includes(violationType)) {
      return res.status(400).json({
        success: false,
        message: 'Loại vi phạm không hợp lệ',
      });
    }

    const report = new CopyrightReport({
      reporterId: new mongoose.Types.ObjectId(userId as string),
      contentId: new mongoose.Types.ObjectId(contentId as string),
      reportedContentId: reportedContentId ? new mongoose.Types.ObjectId(reportedContentId as string) : undefined,
      violationType,
      description,
      evidence,
      status: ReportStatus.PENDING,
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Đã gửi báo cáo thành công',
      data: report,
    });
  } catch (error: any) {
    console.error('Lỗi khi tạo báo cáo:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi báo cáo',
      error: error.message,
    });
  }
};

/**
 * Lấy danh sách báo cáo (cho admin)
 */
export const getReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const query: any = {};
    
    // Lọc theo trạng thái nếu có
    if (status && Object.values(ReportStatus).includes(status as ReportStatus)) {
      query.status = status;
    }

    const [reports, total] = await Promise.all([
      CopyrightReport.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string))
        .populate('reporterId', 'username email')
        .populate('contentId', 'title')
        .populate('reportedContentId', 'title')
        .lean(),
      CopyrightReport.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: reports,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách báo cáo',
      error: error.message,
    });
  }
};

/**
 * Cập nhật trạng thái báo cáo (cho admin)
 */
export const updateReportStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user?._id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền thực hiện hành động này',
      });
    }

    // Validate status
    if (!Object.values(ReportStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ',
      });
    }

    const updateData: any = {
      status,
      adminNotes,
    };

    // Nếu đánh dấu là đã xử lý, thêm thông tin người xử lý và thời gian
    if (status === ReportStatus.RESOLVED || status === ReportStatus.REJECTED) {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = new mongoose.Types.ObjectId(adminId as string);
    }

    const updatedReport = await CopyrightReport.findByIdAndUpdate(
      reportId,
      updateData,
      { new: true }
    )
      .populate('reporterId', 'username email')
      .populate('contentId', 'title')
      .populate('reportedContentId', 'title');

    if (!updatedReport) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy báo cáo',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái báo cáo thành công',
      data: updatedReport,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật báo cáo',
      error: error.message,
    });
  }
};

/**
 * Lấy chi tiết báo cáo
 */
export const getReportDetails = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;

    const report = await CopyrightReport.findById(reportId)
      .populate('reporterId', 'username email')
      .populate('contentId', 'title')
      .populate('reportedContentId', 'title')
      .populate('resolvedBy', 'username');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy báo cáo',
      });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin báo cáo',
      error: error.message,
    });
  }
};
