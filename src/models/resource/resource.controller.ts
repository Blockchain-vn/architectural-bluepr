import { Request, Response } from 'express';
import Resource, { FileCategory, IResource } from './resource.models';
import path from 'path';

/**
 * Lấy danh sách tất cả tài nguyên phần mềm
 */
export const getAllResources = async (req: Request, res: Response) => {
  try {
    const resources = await Resource.find({}).sort({ category: 1, name: 1 });
    
    res.json({
      success: true,
      data: resources,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách tài nguyên',
      error: error.message,
    });
  }
};

/**
 * Gợi ý phần mềm dựa trên phần mở rộng file
 */
export const suggestSoftware = async (req: Request, res: Response) => {
  try {
    const { filename, os } = req.query;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tên file',
      });
    }

    // Lấy phần mở rộng file (không bao gồm dấu chấm)
    const fileExt = path.extname(filename.toString()).toLowerCase().substring(1);
    
    if (!fileExt) {
      return res.status(400).json({
        success: false,
        message: 'Không xác định được định dạng file',
      });
    }

    // Tìm tài nguyên phù hợp với phần mở rộng file
    const query: any = { fileExtensions: fileExt };
    
    // Lọc theo hệ điều hành nếu có
    if (os && ['windows', 'mac', 'linux', 'web'].includes(os.toString())) {
      query['software.os'] = os.toString();
    }

    const resources = await Resource.find(query);
    
    if (resources.length === 0) {
      return res.json({
        success: true,
        message: 'Không tìm thấy phần mềm phù hợp cho định dạng file này',
        data: [],
      });
    }

    // Lọc và sắp xếp phần mềm
    const result = resources.map(resource => {
      const matchedSoftware = resource.software.filter(sw => 
        !os || sw.os.includes(os.toString())
      );
      
      return {
        category: resource.category,
        fileExtensions: resource.fileExtensions,
        software: matchedSoftware,
      };
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gợi ý phần mềm',
      error: error.message,
    });
  }
};

/**
 * Thêm mới tài nguyên phần mềm (Admin)
 */
export const createResource = async (req: Request, res: Response) => {
  try {
    const { name, description, category, fileExtensions, software } = req.body;

    // Validate category
    if (!Object.values(FileCategory).includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Danh mục không hợp lệ',
      });
    }

    const resource = new Resource({
      name,
      description,
      category,
      fileExtensions: fileExtensions.map((ext: string) => ext.toLowerCase().replace(/^\./, '')),
      software,
    });

    await resource.save();

    res.status(201).json({
      success: true,
      message: 'Đã thêm tài nguyên mới',
      data: resource,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        error: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm tài nguyên',
      error: error.message,
    });
  }
};

/**
 * Cập nhật tài nguyên (Admin)
 */
export const updateResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Nếu có cập nhật fileExtensions, đảm bảo không có dấu chấm
    if (updates.fileExtensions) {
      updates.fileExtensions = updates.fileExtensions.map((ext: string) => 
        ext.toLowerCase().replace(/^\./, '')
      );
    }

    const resource = await Resource.findByIdAndUpdate(id, updates, { new: true });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài nguyên',
      });
    }

    res.json({
      success: true,
      message: 'Đã cập nhật tài nguyên',
      data: resource,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật tài nguyên',
      error: error.message,
    });
  }
};

/**
 * Xóa tài nguyên (Admin)
 */
export const deleteResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findByIdAndDelete(id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài nguyên',
      });
    }
    
    res.json({
      success: true,
      message: 'Đã xóa tài nguyên',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa tài nguyên',
      error: error.message,
    });
  }
};
