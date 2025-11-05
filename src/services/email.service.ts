import nodemailer from 'nodemailer';
import { config } from 'dotenv';
import { EMAIL_CONFIG, OTP_EXPIRES_IN } from '../config/jwt.config';

config();

const transporter = nodemailer.createTransport({
    service: EMAIL_CONFIG.service,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const sendOtpEmail = async (email: string, otp: string): Promise<boolean> => {
    try {
        const mailOptions = {
            from: EMAIL_CONFIG.from,
            to: email,
            subject: EMAIL_CONFIG.subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Xin chào,</h2>
                    <p>Cảm ơn bạn đã đăng ký tài khoản tại Kiến Trúc Sư AI. Dưới đây là mã xác thực của bạn:</p>
                    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p>Mã xác thực có hiệu lực trong vòng ${Math.floor(OTP_EXPIRES_IN / 60)} phút.</p>
                    <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
                    <p>Trân trọng,<br>Đội ngũ Kiến Trúc Sư AI</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Lỗi khi gửi email OTP:', error);
        return false;
    }
};
