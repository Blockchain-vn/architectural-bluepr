import { Request, Response } from 'express';
import { Types } from 'mongoose';
const { v4: uuidv4 } = require('uuid');
import User, { IUser } from './user.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../services/auth.service';
import { generateOTP, saveOTP, verifyOTP } from '../../services/auth.service';
import { sendOtpEmail } from '../../services/email.service';
import { OTP_EXPIRES_IN } from '../../config/jwt.config';
import {
    createResponse,
    invalidCredentialsError,
    accountNotActiveError,
    duplicateEntryError,
    invalidOtpError,
    IApiResponse
} from '../../common/response.helper';

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        // Kiểm tra người dùng đã tồn tại chưa
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return duplicateEntryError(res, field);
        }

        // Tạo mã OTP
        const otp = generateOTP();

        // Tạo người dùng mới với trạng thái chưa kích hoạt
        const newUser = await User.create({
            username,
            email,
            password,
            isActive: false
        });

        // Lưu OTP vào database
        await saveOTP(email, otp);

        // Gửi email chứa mã OTP
        const emailSent = await sendOtpEmail(email, otp);

        if (!emailSent) {
            // Nếu gửi email thất bại, xóa người dùng vừa tạo
            await User.findByIdAndDelete(newUser._id);
            return createResponse(res, 500, {
                message: 'Không thể gửi mã xác thực. Vui lòng thử lại sau.',
                message_en: 'Failed to send verification code. Please try again later.',
                status: 'error'
            });
        }

        // Tạo đối tượng người dùng để trả về (không bao gồm mật khẩu)
        const userResponse = {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            isActive: newUser.isActive,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt
        };

        // Trả về thông báo yêu cầu xác thực email cùng thông tin người dùng
        return createResponse(res, 200, {
            message: `Mã xác thực đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư của bạn.`,
            message_en: `Verification code has been sent to ${email}. Please check your inbox.`,
            status: 'success',
            data: {
                user: userResponse,
                email: email
            }
        });
    } catch (error: any) {
        console.error('Lỗi khi đăng ký tài khoản:', error);
        return createResponse(res, 500, {
            message: 'Lỗi khi đăng ký tài khoản',
            message_en: 'Error during registration',
            status: 'error'
        });
    }
};

// Xác thực OTP và kích hoạt tài khoản
export const verifyRegistration = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        // Kiểm tra thông tin bắt buộc
        if (!email || !otp) {
            return createResponse(res, 400, {
                message: 'Vui lòng cung cấp email và mã OTP',
                message_en: 'Please provide email and OTP',
                status: 'fail',
                violations: [{
                    message: {
                        en: 'Email and OTP are required',
                        vi: 'Yêu cầu cung cấp email và mã OTP'
                    },
                    type: 'MissingFields',
                    code: 400,
                    field: !email ? 'email' : 'otp'
                }]
            });
        }

        // Tìm người dùng chưa kích hoạt với email đã cung cấp
        const user = await User.findOne({ email, isActive: false });
        
        if (!user) {
            return createResponse(res, 404, {
                message: 'Không tìm thấy tài khoản chờ xác thực với email này',
                message_en: 'No pending account found with this email',
                status: 'fail',
                violations: [{
                    message: {
                        en: 'Invalid or expired verification request',
                        vi: 'Yêu cầu xác thực không hợp lệ hoặc đã hết hạn'
                    },
                    type: 'InvalidVerification',
                    code: 404
                }]
            });
        }

        // Xác thực OTP
        const isOtpValid = await verifyOTP(email, otp);
        if (!isOtpValid) {
            return invalidOtpError(res);
        }

        // Kích hoạt tài khoản
        user.isActive = true;
        await user.save();

        // Tạo tokens
        const userId = (user._id as Types.ObjectId).toString();
        const accessToken = generateAccessToken(userId, user.role);
        const refreshToken = await generateRefreshToken(userId);
        const ssid = uuidv4();

        // Tạo đối tượng người dùng để trả về (không bao gồm mật khẩu)
        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        return createResponse(res, 200, {
            message: 'Xác thực tài khoản thành công',
            message_en: 'Account verification successful',
            status: 'success',
            data: {
                user: userResponse,
                accessToken,
                refreshToken,
                expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '3600',
                ssid
            }
        });
    } catch (error: any) {
        console.error('Lỗi khi xác thực đăng ký:', error);
        return createResponse(res, 500, {
            message: 'Lỗi hệ thống',
            message_en: 'System error',
            status: 'error'
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        console.log('Bắt đầu xử lý đăng nhập với dữ liệu:', req.body);
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Thiếu email hoặc mật khẩu');
            return createResponse(res, 400, {
                message: 'Vui lòng cung cấp đầy đủ email và mật khẩu',
                message_en: 'Please provide both email and password',
                status: 'fail'
            });
        }

        // Tìm người dùng
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('Không tìm thấy người dùng với email:', email);
            return invalidCredentialsError(res);
        }

        console.log('Đã tìm thấy người dùng:', user.email);

        // Kiểm tra mật khẩu
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Mật khẩu không đúng cho người dùng:', user.email);
            return invalidCredentialsError(res);
        }

        // Kiểm tra tài khoản đã kích hoạt chưa
        if (!user.isActive) {
            console.log('Tài khoản chưa được kích hoạt:', user.email);
            return accountNotActiveError(res);
        }

        // Tạo tokens
        const userId = (user._id as Types.ObjectId).toString();
        const userRole = user.role || 'user';
        const accessToken = generateAccessToken(userId, userRole);
        const refreshToken = await generateRefreshToken(userId);
        const ssid = uuidv4();

        return createResponse(res, 200, {
            message: 'Đăng nhập thành công',
            message_en: 'Success',
            status: 'success',
            data: {
                accessToken,
                expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '3600',
                refreshToken,
                ssid: ssid
            }
        });
    } catch (error: any) {
        console.error('Lỗi khi đăng nhập:', error);
        return createResponse(res, 500, {
            message: 'Lỗi hệ thống',
            message_en: 'System error',
            status: 'error'
        });
    }
};

// Làm mới access token
export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return createResponse(res, 400, {
                message: 'Vui lòng cung cấp refresh token',
                message_en: 'Please provide refresh token',
                status: 'fail',
                violations: [{
                    message: {
                        en: 'Refresh token is required',
                        vi: 'Yêu cầu cung cấp refresh token'
                    },
                    type: 'MissingRefreshToken',
                    code: 400
                }]
            });
        }

        // Xác thực refresh token
        const tokenData = await verifyRefreshToken(refreshToken);

        if (!tokenData) {
            return createResponse(res, 401, {
                message: 'Refresh token không hợp lệ hoặc đã hết hạn',
                message_en: 'Invalid or expired refresh token',
                status: 'fail',
                violations: [{
                    message: {
                        en: 'Invalid or expired refresh token',
                        vi: 'Refresh token không hợp lệ hoặc đã hết hạn'
                    },
                    type: 'InvalidRefreshToken',
                    code: 401
                }]
            });
        }

        // Lấy thông tin người dùng
        const user = await User.findById(tokenData.userId);

        if (!user) {
            return createResponse(res, 404, {
                message: 'Người dùng không tồn tại',
                message_en: 'User not found',
                status: 'fail',
                violations: [{
                    message: {
                        en: 'User not found',
                        vi: 'Người dùng không tồn tại'
                    },
                    type: 'UserNotFound',
                    code: 404
                }]
            });
        }

        // Kiểm tra tài khoản đã kích hoạt chưa
        if (!user.isActive) {
            return accountNotActiveError(res);
        }

        // Tạo access token mới
        const userId = (user._id as Types.ObjectId).toString();
        const newAccessToken = generateAccessToken(userId, user.role);
        const newRefreshToken = await generateRefreshToken(userId);
        const ssid = uuidv4();

        return createResponse(res, 200, {
            message: 'Làm mới token thành công',
            message_en: 'Success',
            status: 'success',
            data: {
                accessToken: newAccessToken,
                expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '3600',
                refreshToken: newRefreshToken,
                ssid: ssid
            }
        });
    } catch (error: any) {
        console.error('Lỗi khi làm mới token:', error);
        return createResponse(res, 500, {
            message: 'Lỗi hệ thống',
            message_en: 'System error',
            status: 'error'
        });
    }
};

// Gửi lại mã OTP
export const resendOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return createResponse(res, 400, {
                message: 'Vui lòng cung cấp địa chỉ email',
                message_en: 'Please provide email address',
                status: 'fail',
                violations: [{
                    message: {
                        en: 'Email is required',
                        vi: 'Yêu cầu cung cấp địa chỉ email'
                    },
                    type: 'MissingEmail',
                    code: 400
                }]
            });
        }

        // Kiểm tra email đã được đăng ký chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return duplicateEntryError(res, 'email');
        }

        // Tạo mã OTP mới
        const otp = generateOTP();

        // Lưu OTP vào database
        await saveOTP(email, otp);

        // Gửi email chứa mã OTP
        const emailSent = await sendOtpEmail(email, otp);

        if (!emailSent) {
            return createResponse(res, 500, {
                message: 'Không thể gửi mã xác thực. Vui lòng thử lại sau.',
                message_en: 'Failed to send verification code. Please try again later.',
                status: 'error'
            });
        }

        return createResponse(res, 200, {
            message: `Mã xác thực mới đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư của bạn.`,
            message_en: `New verification code has been sent to ${email}. Please check your inbox.`,
            status: 'success',
            data: { email }
        });
    } catch (error: any) {
        console.error('Lỗi khi gửi lại mã OTP:', error);
        return createResponse(res, 500, {
            message: 'Lỗi hệ thống',
            message_en: 'System error',
            status: 'error'
        });
    }
};

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?._id).select('-password');
        if (!user) {
            return createResponse(res, 404, {
                message: 'Không tìm thấy người dùng',
                message_en: 'User not found',
                status: 'fail',
                violations: [{
                    message: {
                        en: 'User not found',
                        vi: 'Không tìm thấy người dùng'
                    },
                    type: 'UserNotFound',
                    code: 404
                }]
            });
        }

        return createResponse(res, 200, {
            message: 'Lấy thông tin người dùng thành công',
            message_en: 'Get user info successfully',
            status: 'success',
            data: user
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        return createResponse(res, 500, {
            message: 'Lỗi hệ thống',
            message_en: 'System error',
            status: 'error'
        });
    }
};