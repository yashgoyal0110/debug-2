import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';

const login = async (email, password) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user || user.password !== password) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: user.token,
  };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

export default { login, getProfile };
