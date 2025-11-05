import express from 'express';
import { 
    register, 
    login, 
    getCurrentUser, 
    verifyRegistration, 
    refreshToken, 
    resendOtp 
} from './user.controller';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Xác thực người dùng
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Bắt đầu quá trình đăng ký tài khoản mới (gửi OTP)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mã OTP đã được gửi đến email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *       400:
 *         description: Email hoặc tên đăng nhập đã được sử dụng
 *       500:
 *         description: Lỗi khi gửi mã xác thực
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/verify-registration:
 *   post:
 *     summary: Xác thực OTP để kích hoạt tài khoản
 *     description: Sử dụng mã OTP đã gửi đến email để kích hoạt tài khoản
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email đã đăng ký
 *               otp:
 *                 type: string
 *                 description: Mã OTP 6 chữ số đã gửi đến email
 *     responses:
 *       200:
 *         description: Xác thực thành công, tài khoản đã được kích hoạt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Xác thực tài khoản thành công
 *                 message_en:
 *                   type: string
 *                   example: Account verification successful
 *                 status:
 *                   type: string
 *                   example: success
 *                 responseData:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                       description: Access token để xác thực các request tiếp theo
 *                     refreshToken:
 *                       type: string
 *                       description: Refresh token để lấy access token mới
 *                     expiresIn:
 *                       type: string
 *                       description: Thời gian hết hạn của access token (giây)
 *                     ssid:
 *                       type: string
 *                       description: Session ID
 *       400:
 *         description: Thông tin không hợp lệ hoặc thiếu thông tin bắt buộc
 *       404:
 *         description: Không tìm thấy tài khoản chờ xác thực với email này
 *       401:
 *         description: Mã OTP không hợp lệ hoặc đã hết hạn
 *       500:
 *         description: Lỗi khi xác thực đăng ký
 */
router.post('/verify-registration', verifyRegistration);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Gửi lại mã OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mã OTP mới đã được gửi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *       400:
 *         description: Email đã được đăng ký
 *       500:
 *         description: Lỗi khi gửi lại mã OTP
 */
router.post('/resend-otp', resendOtp);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Thông tin đăng nhập không chính xác
 *       500:
 *         description: Lỗi khi đăng nhập
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Làm mới access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Làm mới token thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Thiếu refresh token
 *       401:
 *         description: Refresh token không hợp lệ hoặc đã hết hạn
 *       404:
 *         description: Người dùng không tồn tại
 *       500:
 *         description: Lỗi khi làm mới token
 */
router.post('/refresh-token', refreshToken);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi khi lấy thông tin người dùng
 */
router.get('/me', authenticate, getCurrentUser);

export default router;