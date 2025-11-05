import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  recordView,
  recordShare,
  getContentStats,
  getPopularContents,
} from './social.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SocialInteraction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         contentId:
 *           type: string
 *         userId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [view, share]
 *         platform:
 *           type: string
 *           description: Nền tảng chia sẻ (facebook, twitter, etc.)
 *         userAgent:
 *           type: string
 *         ipAddress:
 *           type: string
 *         metadata:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     ContentStats:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         contentId:
 *           type: string
 *         viewCount:
 *           type: number
 *         shareCount:
 *           type: number
 *         lastUpdated:
 *           type: string
 *           format: date-time
 * 
 *     PopularContent:
 *       type: object
 *       properties:
 *         contentId:
 *           type: string
 *         title:
 *           type: string
 *         viewCount:
 *           type: number
 *         shareCount:
 *           type: number
 *         popularityScore:
 *           type: number
 *         lastUpdated:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/social/content/{contentId}/view:
 *   post:
 *     tags: [Social]
 *     summary: Ghi nhận lượt xem nội dung
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Thông tin bổ sung (tùy chọn)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metadata:
 *                 type: object
 *                 description: Thông tin bổ sung tùy chỉnh
 *     responses:
 *       201:
 *         description: Đã ghi nhận lượt xem
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/content/:contentId/view', recordView);

/**
 * @swagger
 * /api/social/content/{contentId}/share:
 *   post:
 *     tags: [Social]
 *     summary: Ghi nhận lượt chia sẻ nội dung
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - platform
 *             properties:
 *               platform:
 *                 type: string
 *                 description: Nền tảng chia sẻ (facebook, twitter, etc.)
 *               metadata:
 *                 type: object
 *                 description: Thông tin bổ sung tùy chỉnh
 *     responses:
 *       201:
 *         description: Đã ghi nhận lượt chia sẻ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/content/:contentId/share', authenticate, recordShare);

/**
 * @swagger
 * /api/social/content/{contentId}/stats:
 *   get:
 *     tags: [Social]
 *     summary: Lấy thống kê tương tác của nội dung
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thống kê tương tác
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ContentStats'
 */
router.get('/content/:contentId/stats', getContentStats);

/**
 * @swagger
 * /api/social/popular:
 *   get:
 *     tags: [Social]
 *     summary: Lấy danh sách nội dung phổ biến
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng kết quả trả về
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Số ngày gần đây để thống kê
 *     responses:
 *       200:
 *         description: Danh sách nội dung phổ biến
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
 *                     $ref: '#/components/schemas/PopularContent'
 */
router.get('/popular', getPopularContents);

export default router;
