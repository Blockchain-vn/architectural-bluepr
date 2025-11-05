import { Request, Response } from 'express';
import Content from '../content/content.models';

export const searchContent = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        
        if (!q || typeof q !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập từ khóa tìm kiếm',
                data: null
            });
        }

        const searchRegex = new RegExp(q, 'i');
        
        const results = await Content.find({
            $or: [
                { title: { $regex: searchRegex } },
                { description: { $regex: searchRegex } }
            ],
            status: 'approved' // Chỉ tìm kiếm nội dung đã được duyệt
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            message: 'Tìm kiếm thành công',
            data: results
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm kiếm nội dung',
            error: error?.message || 'Lỗi không xác định'
        });
    }
};

export const semanticSearch = async (req: Request, res: Response) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập mô tả tìm kiếm',
                data: null
            });
        }

        // TODO: Thêm logic tìm kiếm ngữ nghĩa sau này
        // Tạm thời tìm kiếm đơn giản như endpoint /search
        const searchRegex = new RegExp(query, 'i');
        
        const results = await Content.find({
            $or: [
                { title: { $regex: searchRegex } },
                { description: { $regex: searchRegex } }
            ],
            status: 'approved'
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            message: 'Tìm kiếm ngữ nghĩa thành công',
            data: results
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thực hiện tìm kiếm ngữ nghĩa',
            error: error?.message || 'Lỗi không xác định'
        });
    }
};
