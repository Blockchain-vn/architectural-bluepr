import { Router } from 'express';
import * as categoryController from './category.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { body } from 'express-validator';

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Quản lý danh mục bản vẽ
 */

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Tạo mới danh mục
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên danh mục (phải là duy nhất)
 *               description:
 *                 type: string
 *                 description: Mô tả chi tiết về danh mục
 *     responses:
 *       201:
 *         description: Danh mục đã được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Lỗi validate dữ liệu hoặc tên danh mục đã tồn tại
 */
const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên danh mục là bắt buộc')
    .isLength({ max: 100 }).withMessage('Tên danh mục không được vượt quá 100 ký tự'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự'),
];

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lấy danh sách tất cả danh mục
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Danh sách các danh mục
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */

const updateCategoryValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Tên danh mục không được để trống')
    .isLength({ max: 100 }).withMessage('Tên danh mục không được vượt quá 100 ký tự'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự'),
];

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết một danh mục
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của danh mục
 *     responses:
 *       200:
 *         description: Thông tin chi tiết danh mục
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Không tìm thấy danh mục
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Cập nhật thông tin danh mục
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của danh mục cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên mới của danh mục
 *               description:
 *                 type: string
 *                 description: Mô tả mới của danh mục
 *     responses:
 *       200:
 *         description: Danh mục đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Lỗi validate dữ liệu hoặc tên danh mục đã tồn tại
 *       404:
 *         description: Không tìm thấy danh mục
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Xóa một danh mục
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của danh mục cần xóa
 *     responses:
 *       200:
 *         description: Đã xóa danh mục thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đã xóa danh mục thành công"
 *       404:
 *         description: Không tìm thấy danh mục
 */

// Routes
router.post('/', [...createCategoryValidation, validateRequest], categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', [...updateCategoryValidation, validateRequest], categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
