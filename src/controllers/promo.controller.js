import asyncHandler from '../utils/asyncHandler.js';
import promoService from '../services/promo.service.js';

// GET /api/promos
const getActivePromos = asyncHandler(async (req, res) => {
  const promos = await promoService.getActivePromos();
  res.status(200).json({ success: true, count: promos.length, data: promos });
});

// POST /api/promos/validate
const validatePromo = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const result = await promoService.validatePromo(code, orderAmount);
  res.status(200).json({ success: true, data: result });
});

export default { getActivePromos, validatePromo };
