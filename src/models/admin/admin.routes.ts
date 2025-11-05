import { Router } from 'express';
import { getDashboardStats, reviewContent, getPendingContents, isAdmin } from './admin.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Áp dụng middleware xác thực và kiểm tra quyền admin cho tất cả các route
router.use(authenticate, isAdmin);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Lấy thống kê tổng quan
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Stats'
 */
router.get('/stats', getDashboardStats);

/**
 * @swagger
 * /api/admin/contents/pending:
 *   get:
 *     tags: [Admin]
 *     summary: Lấy danh sách nội dung chờ duyệt
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng mỗi trang
 *     responses:
 *       200:
 *         description: Thành công
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
 *                     $ref: '#/components/schemas/Content'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/contents/pending', getPendingContents);

/**
 * @swagger
 * /api/admin/contents/{contentId}/review:
 *   put:
 *     tags: [Admin]
 *     summary: Duyệt hoặc từ chối nội dung
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của nội dung
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: Trạng thái duyệt
 *               reason:
 *                 type: string
 *                 description: Lý do từ chối (nếu có)
 *     responses:
 *       200:
 *         description: Thành công
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
 *                   $ref: '#/components/schemas/Content'
 */
router.put('/contents/:contentId/review', reviewContent);

export default router;
