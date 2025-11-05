import { Router } from 'express';
import { authenticate, isAdmin } from '../../middleware/auth';
import {
  getAllResources,
  suggestSoftware,
  createResource,
  updateResource,
  deleteResource,
} from './resource.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Resource:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           enum: [design, document, 3d_model, cad, image, video, archive]
 *         fileExtensions:
 *           type: array
 *           items:
 *             type: string
 *         software:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               downloadUrl:
 *                 type: string
 *               isFree:
 *                 type: boolean
 *               os:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [windows, mac, linux, web]
 *               imageUrl:
 *                 type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     CreateResourceInput:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - category
 *         - fileExtensions
 *         - software
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           enum: [design, document, 3d_model, cad, image, video, archive]
 *         fileExtensions:
 *           type: array
 *           items:
 *             type: string
 *         software:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               downloadUrl:
 *                 type: string
 *               isFree:
 *                 type: boolean
 *               os:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [windows, mac, linux, web]
 *               imageUrl:
 *                 type: string
 */

/**
 * @swagger
 * /api/resources:
 *   get:
 *     tags: [Resources]
 *     summary: Lấy danh sách tất cả tài nguyên phần mềm
 *     responses:
 *       200:
 *         description: Danh sách tài nguyên
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
 *                     $ref: '#/components/schemas/Resource'
 */
router.get('/', getAllResources);

/**
 * @swagger
 * /api/resources/suggest:
 *   get:
 *     tags: [Resources]
 *     summary: Gợi ý phần mềm dựa trên phần mở rộng file
 *     parameters:
 *       - in: query
 *         name: filename
 *         schema:
 *           type: string
 *         required: true
 *         description: Tên file cần gợi ý phần mềm
 *       - in: query
 *         name: os
 *         schema:
 *           type: string
 *           enum: [windows, mac, linux, web]
 *         description: Lọc theo hệ điều hành
 *     responses:
 *       200:
 *         description: Danh sách phần mềm gợi ý
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
 *                     $ref: '#/components/schemas/Resource'
 */
router.get('/suggest', suggestSoftware);

/**
 * @swagger
 * /api/resources:
 *   post:
 *     tags: [Resources]
 *     summary: Thêm mới tài nguyên phần mềm (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResourceInput'
 *     responses:
 *       201:
 *         description: Đã thêm tài nguyên mới
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
 *                   $ref: '#/components/schemas/Resource'
 */
router.post('/', authenticate, isAdmin, createResource);

/**
 * @swagger
 * /api/resources/{id}:
 *   put:
 *     tags: [Resources]
 *     summary: Cập nhật tài nguyên (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResourceInput'
 *     responses:
 *       200:
 *         description: Đã cập nhật tài nguyên
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
 *                   $ref: '#/components/schemas/Resource'
 */
router.put('/:id', authenticate, isAdmin, updateResource);

/**
 * @swagger
 * /api/resources/{id}:
 *   delete:
 *     tags: [Resources]
 *     summary: Xóa tài nguyên (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đã xóa tài nguyên
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
router.delete('/:id', authenticate, isAdmin, deleteResource);

export default router;
