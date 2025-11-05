import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  createPayment,
  getPaymentDetails,
  getPaymentHistory,
} from './payment.controller';
import { PaymentMethod } from './payment.models';

const router = Router();

// Apply authentication middleware to all payment routes
router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         contentId:
 *           type: string
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *         paymentMethod:
 *           type: string
 *           enum: [momo, bank_transfer, credit_card, qr_code]
 *         transactionId:
 *           type: string
 *         paymentDetails:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     CreatePaymentInput:
 *       type: object
 *       required:
 *         - contentId
 *         - amount
 *         - paymentMethod
 *       properties:
 *         contentId:
 *           type: string
 *           description: ID của nội dung cần thanh toán
 *         amount:
 *           type: number
 *           description: Số tiền thanh toán
 *         paymentMethod:
 *           type: string
 *           enum: [momo, bank_transfer, credit_card, qr_code]
 *           description: Phương thức thanh toán
 *         cardDetails:
 *           type: object
 *           description: Thông tin thẻ (chỉ cần khi chọn phương thức credit_card)
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Tạo yêu cầu thanh toán mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentInput'
 *     responses:
 *       201:
 *         description: Tạo yêu cầu thanh toán thành công
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
 *                   $ref: '#/components/schemas/Payment'
 */
router.post('/', createPayment);

/**
 * @swagger
 * /api/payments/{paymentId}:
 *   get:
 *     tags: [Payments]
 *     summary: Lấy thông tin chi tiết thanh toán
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin thanh toán
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 */
/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     tags: [Payments]
 *     summary: Lấy lịch sử thanh toán của người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng bản ghi mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách lịch sử thanh toán
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
// Đặt route /history trước /:paymentId để tránh xung đột
router.get('/history', getPaymentHistory);

// Lấy chi tiết thanh toán
router.get('/:paymentId', getPaymentDetails);

export default router;
