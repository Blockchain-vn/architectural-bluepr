import express from 'express';
import { createFile, getAllFiles, getFileById, deleteFile } from './file.controller';

const router = express.Router();

/**
 * @swagger
 * /api/file:
 *   post:
 *     tags: [Files]
 *     summary: Tạo mới file
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/File'
 *     responses:
 *       201:
 *         description: Tạo file thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 */
router.post('/', createFile);

/**
 * @swagger
 * /api/file:
 *   get:
 *     tags: [Files]
 *     summary: Lấy danh sách tất cả file
 *     responses:
 *       200:
 *         description: Danh sách file
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/File'
 */
router.get('/', getAllFiles);

/**
 * @swagger
 * /api/file/{id}:
 *   get:
 *     tags: [Files]
 *     summary: Lấy thông tin chi tiết file
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của file
 *     responses:
 *       200:
 *         description: Thông tin chi tiết file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       404:
 *         description: Không tìm thấy file
 */
router.get('/:id', getFileById);

/**
 * @swagger
 * /api/file/{id}:
 *   delete:
 *     tags: [Files]
 *     summary: Xóa file
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của file cần xóa
 *     responses:
 *       200:
 *         description: Đã xóa file thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       404:
 *         description: Không tìm thấy file để xóa
 */
router.delete('/:id', deleteFile);

export default router;