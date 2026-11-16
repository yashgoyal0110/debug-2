import authService from '../services/auth.service.js';

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const data = await authService.login(req.body.email, req.body.password);
    res.status(200).json({ success: true, data });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) console.error(error);
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal server error' : error.message,
    });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user._id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) console.error(error);
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal server error' : error.message,
    });
  }
};

export default { login, getMe };

