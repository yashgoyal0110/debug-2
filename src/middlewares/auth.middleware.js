import User from '../models/user.model.js';

/**
 * Reads "Authorization: Bearer <token>" and attaches the user document to req.user
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token missing',
      });
    }

    const token = authHeader.split(' ')[1];
    const user = await User.findOne({ token }).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid token',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Allows only the given roles. Usage: authorize('admin')
 */
const authorize = (...roles) => (req, res, next) => {
  try {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export { protect, authorize };

