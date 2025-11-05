import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ISocialInteraction, InteractionType, ContentStats, SocialInteraction } from './social.models';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

/**
 * Ghi nhận lượt xem
 */
export const recordView = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contentId } = req.params;
    const userId = req.user?._id;
    
    // Tạo bản ghi tương tác mới
    const interaction = new SocialInteraction({
      contentId: new mongoose.Types.ObjectId(contentId),
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      type: InteractionType.VIEW,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      metadata: {
        referrer: req.headers.referer,
        ...req.body.metadata
      }
    });

    try {
      // Lưu tương tác
      await interaction.save();
      
      // Cập nhật thống kê (không dùng transaction)
      await ContentStats.updateOne(
        { contentId },
        { 
          $inc: { viewCount: 1 },
          $set: { lastUpdated: new Date() }
        },
        { upsert: true }
      );
      
      res.status(201).json({
        success: true,
        message: 'Đã ghi nhận lượt xem',
      });
    } catch (error) {
      throw error;
    }
  } catch (error: any) {
    // Bỏ qua lỗi trùng lặp (người dùng đã xem)
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Đã ghi nhận lượt xem trước đó',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi khi ghi nhận lượt xem',
      error: error.message,
    });
  }
};

/**
 * Ghi nhận lượt chia sẻ
 */
export const recordShare = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contentId } = req.params;
    const { platform = 'direct_link' } = req.body;
    const userId = req.user?._id;

    // Tạo bản ghi chia sẻ mới
    const share = new SocialInteraction({
      contentId: new mongoose.Types.ObjectId(contentId),
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      type: InteractionType.SHARE,
      platform,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      metadata: {
        ...req.body.metadata
      }
    });

    try {
      // Lưu tương tác
      await share.save();
      
      // Cập nhật thống kê (không dùng transaction)
      await ContentStats.updateOne(
        { contentId },
        { 
          $inc: { shareCount: 1 },
          $set: { lastUpdated: new Date() }
        },
        { upsert: true }
      );
      
      res.status(201).json({
        success: true,
        message: 'Đã ghi nhận lượt chia sẻ',
      });
    } catch (error) {
      throw error;
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi ghi nhận lượt chia sẻ',
      error: error.message,
    });
  }
};

/**
 * Lấy thống kê tương tác của nội dung
 */
export const getContentStats = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;

    const stats = await ContentStats.findOne({ contentId });
    
    // Nếu chưa có thống kê, trả về mặc định
    if (!stats) {
      return res.json({
        success: true,
        data: {
          contentId,
          viewCount: 0,
          shareCount: 0,
          lastUpdated: null
        }
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message,
    });
  }
};

/**
 * Lấy danh sách nội dung phổ biến
 */
export const getPopularContents = async (req: Request, res: Response) => {
  try {
    const { limit = 10, days = 30 } = req.query;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - Number(days));

    const popularContents = await ContentStats.aggregate([
      {
        $match: {
          lastUpdated: { $gte: dateThreshold },
          $or: [
            { viewCount: { $gt: 0 } },
            { shareCount: { $gt: 0 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'contents',
          localField: 'contentId',
          foreignField: '_id',
          as: 'content'
        }
      },
      { $unwind: '$content' },
      {
        $project: {
          _id: 0,
          contentId: 1,
          title: '$content.title',
          viewCount: 1,
          shareCount: 1,
          popularityScore: {
            $add: [
              { $multiply: ['$viewCount', 1] },
              { $multiply: ['$shareCount', 5] } // Chia sẻ có trọng số cao hơn
            ]
          },
          lastUpdated: 1
        }
      },
      { $sort: { popularityScore: -1 } },
      { $limit: Number(limit) }
    ]);

    res.json({
      success: true,
      data: popularContents
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách nội dung phổ biến',
      error: error.message,
    });
  }
};
