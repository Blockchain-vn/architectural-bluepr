import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user/user.model';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Vui lòng đăng nhập để tiếp tục' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Lỗi xác thực:', error);
        res.status(401).json({ message: 'Token không hợp lệ' });
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }
    next();
};