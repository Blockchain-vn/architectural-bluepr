import { Request, Response } from "express";
import Content, { IContent } from "./content.models";
import mongoose from 'mongoose';

interface QueryParams {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    field?: string;
    file_type?: string;
    status?: string;
    search?: string;
}

export const getContents = async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc', field, file_type, status, search } = req.query as unknown as QueryParams;

        const filter: any = { status: 'approved' }; // Mặc định chỉ lấy nội dung đã duyệt
        if (field) filter.field = field;
        if (file_type) filter.file_type = file_type;
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const [contents, total] = await Promise.all([
            Content.find(filter)
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limitNum)
                .populate('createdBy', 'username email')
                .populate('approvedBy', 'username'),
            Content.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limitNum);

        res.json({
            data: contents,
            pagination: {
                total,
                totalPages,
                currentPage: pageNum,
                itemsPerPage: limitNum,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy dữ liệu", error });
    }
};

export const getContentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        const content = await Content.findById(id)
            .populate('createdBy', 'username email')
            .populate('approvedBy', 'username');

        if (!content) {
            return res.status(404).json({ message: "Không tìm thấy nội dung" });
        }

        res.json(content);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy thông tin nội dung", error });
    }
};

export const uploadContent = async (req: Request, res: Response) => {
    try {
        const { title, description, field, file_type, file_url } = req.body;
        const userId = (req as any).user?._id; // Giả sử đã có middleware xác thực

        if (!userId) {
            return res.status(401).json({ message: "Chưa đăng nhập" });
        }

        const content = await Content.create({
            title,
            description,
            field,
            file_type,
            file_url,
            status: "pending",
            createdBy: userId
        });

        res.status(201).json(content);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tải lên nội dung", error });
    }
};

export const approveContent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        const content = await Content.findByIdAndUpdate(
            id,
            {
                status: 'approved',
                approvedBy: userId,
                approvedAt: new Date()
            },
            { new: true }
        ).populate('createdBy', 'username email');

        if (!content) {
            return res.status(404).json({ message: "Không tìm thấy nội dung" });
        }

        res.json({ message: "Đã duyệt nội dung thành công", content });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi duyệt nội dung", error });
    }
};

export const deleteContent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        const content = await Content.findByIdAndDelete(id);

        if (!content) {
            return res.status(404).json({ message: "Không tìm thấy nội dung" });
        }

        res.json({ message: "Đã xóa nội dung thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa nội dung", error });
    }
};