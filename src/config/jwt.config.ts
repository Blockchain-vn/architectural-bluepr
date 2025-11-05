// Thời gian sống của access token (tính bằng giây)
export const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '900');

// Thời gian sống của refresh token (tính bằng giây)
export const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60; // 7 ngày

// Thời gian sống của OTP (tính bằng giây)
export const OTP_EXPIRES_IN = 10 * 60; // 10 phút

// Secret key cho JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export const JWT_ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '900';

// Cấu hình cho OTP
export const OTP_CONFIG = {
    length: 6,
    numbers: true,
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false
};

// Cấu hình email
export const EMAIL_CONFIG = {
    service: 'gmail',
    from: `"Kiến Trúc Sư AI" <${process.env.EMAIL_USER}>`,
    subject: 'Mã xác thực OTP',
};

// Đường dẫn API
// export const API_PREFIX = '/api/v1';
