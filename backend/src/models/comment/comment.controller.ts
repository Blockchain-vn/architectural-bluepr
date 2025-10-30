import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Comment, { IComment } from './comment.models';
import { IUser } from '../user/user.model';

interface AuthenticatedRequest extends Request {
    user?: IUser;
}

interface CreateCommentRequest extends Request {
    body: {
        contentId: string;
        content: string;
        guestName?: string;
        email?: string;
    };
    user?: IUser;
}

// Create a new comment
export const createComment = async (req: CreateCommentRequest, res: Response) => {
    try {
        const { contentId } = req.params;
        const { content, guestName, email } = req.body;
        const isGuest = !req.user;

        // Validate required fields
        if (!contentId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc',
                data: null
            });
        }

        if (isGuest && (!guestName || !email)) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp tên và email',
                data: null
            });
        }

        if (!contentId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc',
                data: null
            });
        }

        if (isGuest && (!guestName || !email)) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp tên và email',
                data: null
            });
        }

        const commentData: Partial<IComment> = {
            contentId: new mongoose.Types.ObjectId(contentId),
            content,
            isGuest
        };

        if (isGuest) {
            commentData.guestName = guestName;
            commentData.email = email;
        } else if (req.user?._id) {
            commentData.userId = typeof req.user._id === 'string' 
                ? new mongoose.Types.ObjectId(req.user._id)
                : req.user._id as mongoose.Types.ObjectId;
        }

        try {
            const comment = await Comment.create(commentData);
            const savedComment = await Comment.findById(comment._id)
                .populate('userId', 'username email')
                .lean();

            res.status(201).json({
                success: true,
                message: 'Bình luận đã được thêm',
                data: savedComment
            });
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ',
                    error: error.message
                });
            }
            throw error;
        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm bình luận',
            error: error?.message || 'Lỗi không xác định'
        });
    }
};

// Get all comments for a content
export const getCommentsByContent = async (req: Request, res: Response) => {
    try {
        const { contentId } = req.params;
        const { page = '1', limit = '10' } = req.query;

        const pageNum = parseInt(page as string, 10) || 1;
        const limitNum = parseInt(limit as string, 10) || 10;
        const skip = (pageNum - 1) * limitNum;

        const [comments, total] = await Promise.all([
            Comment.find({ contentId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate('userId', 'username email')
                .lean(),
            Comment.countDocuments({ contentId })
        ]);

        const totalPages = Math.ceil(total / limitNum);

        res.json({
            success: true,
            message: 'Lấy danh sách bình luận thành công',
            data: comments,
            pagination: {
                total,
                totalPages,
                currentPage: pageNum,
                itemsPerPage: limitNum,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách bình luận',
            error: error?.message || 'Lỗi không xác định'
        });
    }
};

// Update a comment
export const updateComment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user?._id;
        const isAdmin = req.user?.role === 'admin';

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Nội dung bình luận không được để trống',
                data: null
            });
        }

        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bình luận',
                data: null
            });
        }

        // Check permission
        if (!isAdmin && (comment.isGuest || comment.userId?.toString() !== userId?.toString())) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền chỉnh sửa bình luận này',
                data: null
            });
        }

        comment.content = content;
        const updatedComment = await comment.save();

        res.json({
            success: true,
            message: 'Cập nhật bình luận thành công',
            data: updatedComment
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật bình luận',
            error: error?.message || 'Lỗi không xác định'
        });
    }
};

// Delete a comment
export const deleteComment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        const isAdmin = req.user?.role === 'admin';

        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bình luận',
                data: null
            });
        }

        // Check permission
        if (!isAdmin && (comment.isGuest || comment.userId?.toString() !== userId?.toString())) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xóa bình luận này',
                data: null
            });
        }

        await comment.deleteOne();

        res.json({
            success: true,
            message: 'Xóa bình luận thành công',
            data: null
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa bình luận',
            error: error?.message || 'Lỗi không xác định'
        });
    }
};
