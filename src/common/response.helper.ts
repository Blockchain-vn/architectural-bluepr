import { Response } from 'express';

interface IViolation {
    message: {
        en: string;
        vi: string;
    };
    type: string;
    code: number;
    field?: string;
}

export interface IApiResponse<T> {
    message: string;
    message_en: string;
    responseData: T | null;
    status: 'success' | 'fail' | 'error';
    timeStamp: string;
    violations?: IViolation[];
}

export const createResponse = <T>(
    res: Response,
    status: number,
    options: {
        message: string;
        message_en: string;
        data?: T | null;
        status: 'success' | 'fail' | 'error';
        violations?: IViolation[];
    }
) => {
    const response: IApiResponse<T> = {
        message: options.message,
        message_en: options.message_en,
        responseData: options.data || null,
        status: options.status,
        timeStamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        violations: options.violations,
    };

    return res.status(status).json(response);
};

// Common error responses
export const invalidCredentialsError = (res: Response) => {
    return createResponse(res, 401, {
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác',
        message_en: 'Username or password is incorrect',
        status: 'fail',
        violations: [{
            message: {
                en: 'Username or password is incorrect',
                vi: 'Tên đăng nhập hoặc mật khẩu không chính xác'
            },
            type: 'InvalidCredentials',
            code: 401
        }]
    });
};

export const accountNotActiveError = (res: Response) => {
    return createResponse(res, 403, {
        message: 'Tài khoản chưa được kích hoạt',
        message_en: 'Account is not activated',
        status: 'fail',
        violations: [{
            message: {
                en: 'Account is not activated',
                vi: 'Tài khoản chưa được kích hoạt'
            },
            type: 'AccountNotActive',
            code: 403
        }]
    });
};

export const duplicateEntryError = (res: Response, field: string) => {
    const message = field === 'email' 
        ? 'Email đã được sử dụng' 
        : 'Tên đăng nhập đã được sử dụng';
    const message_en = field === 'email'
        ? 'Email is already in use'
        : 'Username is already taken';
    
    const violation: IViolation = {
        message: {
            en: message_en,
            vi: message
        },
        type: 'DuplicateEntry',
        code: 400,
        field
    };
    
    return createResponse(res, 400, {
        message,
        message_en,
        status: 'fail',
        violations: [violation]
    });
};

export const invalidOtpError = (res: Response) => {
    return createResponse(res, 400, {
        message: 'Mã OTP không hợp lệ hoặc đã hết hạn',
        message_en: 'Invalid or expired OTP',
        status: 'fail',
        violations: [{
            message: {
                en: 'Invalid or expired OTP',
                vi: 'Mã OTP không hợp lệ hoặc đã hết hạn'
            },
            type: 'InvalidOtp',
            code: 400
        }]
    });
};
