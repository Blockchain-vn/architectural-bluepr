import { Router } from 'express';
import { searchContent, semanticSearch } from './search.controller';

const router = Router();

/**
 * @swagger
 * /api/search:
 *   get:
 *     tags: [Search]
 *     summary: Tìm kiếm nội dung theo từ khóa
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Từ khóa tìm kiếm
 *     responses:
 *       200:
 *         description: Danh sách nội dung phù hợp
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
 *                     $ref: '#/components/schemas/Content'
 */
router.get('/', searchContent);

/**
 * @swagger
 * /api/search/semantic:
 *   post:
 *     tags: [Search]
 *     summary: Tìm kiếm nội dung bằng mô tả (AI sau này)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: Mô tả tìm kiếm
 *     responses:
 *       200:
 *         description: Danh sách nội dung phù hợp
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
 *                     $ref: '#/components/schemas/Content'
 */
router.post('/semantic', semanticSearch);

export default router;
