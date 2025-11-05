import { Request, Response } from "express";
import Content, { IContent } from "./content.models";
import mongoose from 'mongoose';
import File from "../file/file.model";
import Category from "../category/category.model";
import User from "../user/user.model";

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

        // Tạo điều kiện lọc cơ bản
        const filter: any = { status: 'approved' };
        
        // Nếu có lọc theo danh mục (field)
        if (field) {
            const category = await Category.findOne({ slug: field });
            if (category) {
                filter.category_id = category._id;
            } else {
                // Nếu không tìm thấy danh mục, trả về mảng rỗng
                return res.json({
                    data: [],
                    pagination: {
                        total: 0,
                        totalPages: 0,
                        currentPage: parseInt(page, 10) || 1,
                        itemsPerPage: parseInt(limit, 10) || 10,
                        hasNext: false,
                        hasPrev: false
                    }
                });
            }
        }

        // Nếu có lọc theo loại file
        if (file_type) {
            filter['file_id.type'] = file_type;
        }

        // Nếu có tìm kiếm
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Sửa lại query để xử lý trường hợp approvedBy là null
        const [contents, total] = await Promise.all([
            Content.aggregate([
                { $match: filter },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdBy',
                        pipeline: [
                            { $project: { username: 1, email: 1, avatar: 1 } }
                        ]
                    }
                },
                { $unwind: '$createdBy' },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'approvedBy',
                        foreignField: '_id',
                        as: 'approvedBy',
                        pipeline: [
                            { $project: { username: 1 } }
                        ]
                    }
                },
                { $unwind: { path: '$approvedBy', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: 'category_id',
                        pipeline: [
                            { $project: { name: 1, slug: 1, description: 1 } }
                        ]
                    }
                },
                { $unwind: '$category_id' },
                {
                    $lookup: {
                        from: 'files',
                        localField: 'file_id',
                        foreignField: '_id',
                        as: 'file_id',
                        pipeline: [
                            { $project: { name: 1, url: 1, type: 1, size: 1 } }
                        ]
                    }
                },
                { $unwind: '$file_id' },
                { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } },
                { $skip: skip },
                { $limit: limitNum }
            ]),
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

        // Sử dụng aggregate để xử lý trường hợp approvedBy là null
        const [content] = await Content.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy',
                    pipeline: [
                        { $project: { username: 1, email: 1, avatar: 1 } }
                    ]
                }
            },
            { $unwind: '$createdBy' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'approvedBy',
                    foreignField: '_id',
                    as: 'approvedBy',
                    pipeline: [
                        { $project: { username: 1 } }
                    ]
                }
            },
            { $unwind: { path: '$approvedBy', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category_id',
                    pipeline: [
                        { $project: { name: 1, slug: 1, description: 1 } }
                    ]
                }
            },
            { $unwind: '$category_id' },
            {
                $lookup: {
                    from: 'files',
                    localField: 'file_id',
                    foreignField: '_id',
                    as: 'file_id',
                    pipeline: [
                        { $project: { name: 1, url: 1, type: 1, size: 1 } }
                    ]
                }
            },
            { $unwind: '$file_id' }
        ]);

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
        const { title, description, category_id, file_id, price, details } = req.body;
        const userId = (req as any).user?._id; // Giả sử đã có middleware xác thực

        if (!userId) {
            return res.status(401).json({ message: "Chưa đăng nhập" });
        }

        // Kiểm tra xem category_id và file_id có tồn tại không
        if (!mongoose.Types.ObjectId.isValid(category_id)) {
            return res.status(400).json({ message: "ID danh mục không hợp lệ" });
        }

        if (!mongoose.Types.ObjectId.isValid(file_id)) {
            return res.status(400).json({ message: "ID file không hợp lệ" });
        }

        const content = await Content.create({
            title,
            description,
            category_id: new mongoose.Types.ObjectId(category_id),
            file_id: new mongoose.Types.ObjectId(file_id),
            price: price || 0,
            details: details || {},
            status: "pending",
            createdBy: userId
        });

        // Populate thông tin liên quan trước khi trả về
        const populatedContent = await Content.findById(content._id)
            .populate('createdBy', 'username email')
            .populate('category_id', 'name slug')
            .populate('file_id', 'name url type size');

        res.status(201).json(populatedContent);
    } catch (error) {
        console.error('Error uploading content:', error);
        res.status(500).json({ 
            message: "Lỗi khi tải lên nội dung", 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
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