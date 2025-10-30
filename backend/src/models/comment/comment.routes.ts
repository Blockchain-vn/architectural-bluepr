import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
    createComment,
    getCommentsByContent,
    updateComment,
    deleteComment
} from './comment.controller';

const router = Router();

/**
 * @swagger
 * /api/contents/{contentId}/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Tạo bình luận mới
 *     description: Cho phép người dùng đăng nhập hoặc khách để lại bình luận
 *     security: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của nội dung cần bình luận
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nội dung bình luận
 *               guestName:
 *                 type: string
 *                 description: Tên người dùng (bắt buộc nếu là khách)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email (bắt buộc nếu là khách)
 *     responses:
 *       201:
 *         description: Bình luận đã được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/contents/:contentId/comments', createComment);

/**
 * @swagger
 * /api/contents/{contentId}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: Lấy danh sách bình luận của một nội dung
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của nội dung cần lấy bình luận
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
 *         description: Danh sách bình luận
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
 *                     $ref: '#/components/schemas/Comment'
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
router.get('/contents/:contentId/comments', getCommentsByContent);

// Protected routes (require authentication)
router.put('/comments/:id', authenticate, updateComment);
router.delete('/comments/:id', authenticate, deleteComment);

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         contentId:
 *           type: string
 *         userId:
 *           $ref: '#/components/schemas/User'
 *         guestName:
 *           type: string
 *         email:
 *           type: string
 *         content:
 *           type: string
 *         isGuest:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     CreateCommentInput:
 *       type: object
 *       required:
 *         - contentId
 *         - content
 *       properties:
 *         contentId:
 *           type: string
 *           description: ID của nội dung
 *         content:
 *           type: string
 *           description: Nội dung bình luận
 *         guestName:
 *           type: string
 *           description: Tên người dùng (bắt buộc nếu là khách)
 *         email:
 *           type: string
 *           format: email
 *           description: Email người dùng (bắt buộc nếu là khách)
 * 
 *     UpdateCommentInput:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: Nội dung bình luận mới
 */

/**
 * @swagger
 * /api/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Tạo bình luận mới
 *     description: Cho phép người dùng đăng nhập hoặc khách để lại bình luận
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentInput'
 *     responses:
 *       201:
 *         description: Bình luận đã được tạo thành công
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
 *                   $ref: '#/components/schemas/Comment'
 */
router.post('/', createComment);

/**
 * @swagger
 * /api/contents/{contentId}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: Lấy danh sách bình luận của một nội dung
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của nội dung
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
 *           maximum: 50
 *         description: Số lượng bản ghi mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách bình luận
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 */
router.get('/content/:contentId', getCommentsByContent);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     tags: [Comments]
 *     summary: Cập nhật bình luận
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCommentInput'
 *     responses:
 *       200:
 *         description: Cập nhật bình luận thành công
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
 *                   $ref: '#/components/schemas/Comment'
 */
router.put('/:id', updateComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     tags: [Comments]
 *     summary: Xóa bình luận
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận
 *     responses:
 *       200:
 *         description: Xóa bình luận thành công
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
 *                   type: null
 */
router.delete('/:id', deleteComment);

export default router;
