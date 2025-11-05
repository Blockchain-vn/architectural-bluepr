import { Request, Response } from 'express';
import File, { IFile } from './file.model';

// Tạo mới file
export const createFile = async (req: Request, res: Response) => {
    try {
        const { name, url, type, size } = req.body;

        const newFile = new File({
            name,
            url,
            type,
            size
        });

        const savedFile = await newFile.save();

        res.status(201).json({
            success: true,
            data: savedFile,
            message: 'Tạo file thành công'
        });
    } catch (error: unknown) {
        console.error('Lỗi khi tạo file:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo file',
            error: error instanceof Error ? error.message : 'Lỗi không xác định'
        });
    }
};

// Lấy tất cả file
export const getAllFiles = async (req: Request, res: Response) => {
    try {
        const files = await File.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: files.length,
            data: files
        });
    } catch (error: unknown) {
        console.error('Lỗi khi lấy danh sách file:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách file',
            error: error instanceof Error ? error.message : 'Lỗi không xác định'
        });
    }
};

// Lấy chi tiết file theo ID
export const getFileById = async (req: Request, res: Response) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy file'
            });
        }

        res.status(200).json({
            success: true,
            data: file
        });
    } catch (error: unknown) {
        console.error('Lỗi khi lấy thông tin file:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin file',
            error: error instanceof Error ? error.message : 'Lỗi không xác định'
        });
    }
};

// Xóa file
export const deleteFile = async (req: Request, res: Response) => {
    try {
        const file = await File.findByIdAndDelete(req.params.id);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy file để xóa'
            });
        }

        // TODO: Thêm logic xóa file vật lý ở đây nếu cần

        res.status(200).json({
            success: true,
            message: 'Đã xóa file thành công',
            data: file
        });
    } catch (error: unknown) {
        console.error('Lỗi khi xóa file:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa file',
            error: error instanceof Error ? error.message : 'Lỗi không xác định'
        });
    }
};
