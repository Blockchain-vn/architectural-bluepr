import { Request, Response } from 'express';
import User, { IUser } from './user.model';
import jwt from 'jsonwebtoken';

const generateToken = (user: IUser): string => {
    return jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );
};

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        // Kiểm tra người dùng đã tồn tại chưa
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email hoặc tên đăng nhập đã được sử dụng',
                data: null
            });
        }

        // Tạo người dùng mới
        const user = await User.create({ username, email, password });

        // Tạo token
        const token = generateToken(user);

        // Prepare user data for response
        const userData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        res.status(201).json({
            success: true,
            message: 'Đăng ký tài khoản thành công',
            data: userData
        });
    } catch (error: any) {
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi đăng ký tài khoản',
            error: error?.message || 'Lỗi không xác định'
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Tìm người dùng theo email
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email hoặc mật khẩu không đúng',
                data: null
            });
        }

        // Kiểm tra mật khẩu
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email hoặc mật khẩu không đúng',
                data: null
            });
        }

        // Tạo token
        const token = generateToken(user);

        // Prepare user data for response
        const userData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: userData,
                token: token
            }
        });
    } catch (error: any) {
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi đăng nhập',
            error: error?.message || 'Lỗi không xác định'
        });
    }
};

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng', error });
    }
};