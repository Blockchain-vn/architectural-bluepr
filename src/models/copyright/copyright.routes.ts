import { Router } from 'express';
import { authenticate, isAdmin } from '../../middleware/auth';
import {
  createReport,
  getReports,
  updateReportStatus,
  getReportDetails,
} from './copyright.controller';
import { ReportStatus } from './copyright.models';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CopyrightReport:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         reporterId:
 *           $ref: '#/components/schemas/User'
 *         contentId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             title:
 *               type: string
 *         reportedContentId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             title:
 *               type: string
 *         violationType:
 *           type: string
 *           enum: [copyright, trademark, privacy, other]
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, reviewing, resolved, rejected]
 *         evidence:
 *           type: array
 *           items:
 *             type: string
 *         adminNotes:
 *           type: string
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *         resolvedBy:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     CreateReportInput:
 *       type: object
 *       required:
 *         - contentId
 *         - violationType
 *         - description
 *         - evidence
 *       properties:
 *         contentId:
 *           type: string
 *           description: ID của nội dung bị báo cáo
 *         reportedContentId:
 *           type: string
 *           description: ID của nội dung gốc (nếu có)
 *         violationType:
 *           type: string
 *           enum: [copyright, trademark, privacy, other]
 *           description: Loại vi phạm
 *         description:
 *           type: string
 *           description: Mô tả chi tiết
 *         evidence:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách URL bằng chứng
 * 
 *     UpdateReportStatusInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, reviewing, resolved, rejected]
 *         adminNotes:
 *           type: string
 */

/**
 * @swagger
 * /api/reports:
 *   post:
 *     tags: [Copyright]
 *     summary: Gửi báo cáo vi phạm bản quyền
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReportInput'
 *     responses:
 *       201:
 *         description: Gửi báo cáo thành công
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
 *                   $ref: '#/components/schemas/CopyrightReport'
 */
router.post('/', authenticate, createReport);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     tags: [Copyright]
 *     summary: Lấy danh sách báo cáo (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, reviewing, resolved, rejected]
 *         description: Lọc theo trạng thái
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
 *         description: Danh sách báo cáo
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
 *                     $ref: '#/components/schemas/CopyrightReport'
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
router.get('/', authenticate, isAdmin, getReports);

/**
 * @swagger
 * /api/reports/{reportId}:
 *   get:
 *     tags: [Copyright]
 *     summary: Lấy chi tiết báo cáo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết báo cáo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CopyrightReport'
 */
router.get('/:reportId', authenticate, getReportDetails);

/**
 * @swagger
 * /api/reports/{reportId}/status:
 *   put:
 *     tags: [Copyright]
 *     summary: Cập nhật trạng thái báo cáo (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReportStatusInput'
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
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
 *                   $ref: '#/components/schemas/CopyrightReport'
 */
router.put('/:reportId/status', authenticate, isAdmin, updateReportStatus);

export default router;
