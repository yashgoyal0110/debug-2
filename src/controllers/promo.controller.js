import promoService from '../services/promo.service.js';

// GET /api/promos
const getActivePromos = async (req, res) => {
  try {
    const promos = await promoService.getActivePromos();
    res.status(200).json({ success: true, count: promos.length, data: promos });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) console.error(error);
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal server error' : error.message,
    });
  }
};

// POST /api/promos/validate
const validatePromo = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const result = await promoService.validatePromo(code, orderAmount);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) console.error(error);
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal server error' : error.message,
    });
  }
};

export default { getActivePromos, validatePromo };

