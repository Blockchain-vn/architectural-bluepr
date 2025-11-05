import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, Result, ValidationError } from 'express-validator';

interface FieldError {
  field: string;
  message: string;
}

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages: FieldError[] = [];
    
    errors.array().forEach((error: ValidationError) => {
      const typedError = error as any;
      if (typedError.param) {
        errorMessages.push({
          field: typedError.param,
          message: typedError.msg
        });
      }
    });

    return res.status(400).json({ 
      success: false,
      message: 'Lỗi xác thực dữ liệu',
      errors: errorMessages
    });
  }
  next();
};

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    validateRequest(req, res, next);
  };
};
