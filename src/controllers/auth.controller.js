import asyncHandler from '../utils/asyncHandler.js';
import authService from '../services/auth.service.js';

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body.email, req.body.password);
  res.status(200).json({ success: true, data });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  res.status(200).json({ success: true, data: user });
});

export default { login, getMe };
