import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Payment, { IPayment, PaymentMethod, PaymentStatus } from './payment.models';
import { IUser } from '../user/user.model';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Mock payment processors
const mockPaymentProcessors = {
  [PaymentMethod.MOMO]: async (amount: number) => {
    // Simulate API call to Momo
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      transactionId: `MOMO-${Date.now()}`,
      paymentUrl: 'https://momo.vn/mock-payment',
    };
  },
  [PaymentMethod.QR_CODE]: async (amount: number) => {
    // Simulate QR code generation
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      success: true,
      qrCode: `QR-${Date.now()}`,
      paymentUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PAYMENT',
    };
  },
  [PaymentMethod.CREDIT_CARD]: async (amount: number, cardDetails: any) => {
    // Simulate credit card processing
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
      success: true,
      transactionId: `CC-${Date.now()}`,
      last4: cardDetails.number.slice(-4),
    };
  },
  [PaymentMethod.BANK_TRANSFER]: async (amount: number) => {
    // Simulate bank transfer
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      success: true,
      bankAccount: '1234567890',
      bankName: 'Mock Bank',
      amount,
      content: `PAYMENT-${Date.now()}`,
    };
  },
};

/**
 * Create a new payment
 */
export const createPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contentId, amount, paymentMethod, cardDetails } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để thực hiện thanh toán',
      });
    }

    // Validate required fields
    if (!contentId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc',
      });
    }

    // Create payment record
    const payment = new Payment({
      userId: new mongoose.Types.ObjectId(userId as string),
      contentId: new mongoose.Types.ObjectId(contentId as string),
      amount,
      paymentMethod,
      status: PaymentStatus.PENDING,
    });

    // Process payment with mock processor
    const processor = mockPaymentProcessors[paymentMethod as PaymentMethod];
    if (!processor) {
      return res.status(400).json({
        success: false,
        message: 'Phương thức thanh toán không được hỗ trợ',
      });
    }

    // Process payment
    const paymentResult = await processor(amount, cardDetails);
    
    // Update payment status
    payment.status = paymentResult.success ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
    
    // Type-safe transaction ID assignment
    const transactionId = 'transactionId' in paymentResult 
      ? paymentResult.transactionId 
      : 'bankAccount' in paymentResult 
        ? `BANK-${paymentResult.bankAccount}` 
        : `TXN-${Date.now()}`;
        
    payment.transactionId = transactionId;
    payment.paymentDetails = paymentResult;

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Khởi tạo thanh toán thành công',
      data: {
        payment,
        paymentResult,
      },
    });
  } catch (error: any) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xử lý thanh toán',
      error: error.message,
    });
  }
};

/**
 * Get payment details
 */
export const getPaymentDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user?._id;

    const payment = await Payment.findOne({
      _id: paymentId,
      userId,
    }).populate('contentId', 'title price');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin thanh toán',
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin thanh toán',
      error: error.message,
    });
  }
};

/**
 * Get user's payment history
 */
export const getPaymentHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [payments, total] = await Promise.all([
      Payment.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string))
        .populate('contentId', 'title'),
      Payment.countDocuments({ userId }),
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử thanh toán',
      error: error.message,
    });
  }
};
