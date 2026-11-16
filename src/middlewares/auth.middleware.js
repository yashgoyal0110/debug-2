import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Reads "Authorization: Bearer <token>" and attaches the user document to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorized, token missing');
  }

  const token = authHeader.split(' ')[1];
  const user = await User.findOne({ token }).select('-password');

  if (!user) {
    throw new ApiError(401, 'Not authorized, invalid token');
  }

  req.user = user;
  next();
});

/**
 * Allows only the given roles. Usage: authorize('admin')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  }
  next();
};

export { protect, authorize };
