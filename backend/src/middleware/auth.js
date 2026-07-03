import jwt from 'jsonwebtoken';
import { AppError } from './error.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized, no token provided', 401));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'layerly_jwt_secret_key_change_me_in_prod'
    );

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    };

    next();
  } catch (error) {
    return next(new AppError('Not authorized, token validation failed', 401));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(`User role '${req.user?.role}' is not authorized to access this resource`, 403));
    }
    next();
  };
};
