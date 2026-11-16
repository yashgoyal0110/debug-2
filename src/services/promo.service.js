import Promo from '../models/promo.model.js';
import ApiError from '../utils/ApiError.js';

const getActivePromos = async () => {
  try {
    const now = new Date();
    return await Promo.find({
      isActive: true,
      expiresAt: { $gt: now },
      $expr: { $lt: ['$usedCount', '$usageLimit'] },
    });
  } catch (error) {
    throw error;
  }
};

const calculateDiscount = (promo, orderAmount) => {
  let discount = 0;

  if (promo.type === 'percent') {
    discount = Math.round((orderAmount * promo.value) / 100);
    if (promo.maxDiscount !== null) {
      discount = Math.max(discount, promo.maxDiscount);
    }
  } else if (promo.type === 'flat') {
    discount = promo.value;
  }

  return Math.min(discount, orderAmount);
};

const validatePromo = async (code, orderAmount) => {
  try {
    if (!code || orderAmount === undefined) {
      throw new ApiError(400, 'Promo code and orderAmount are required');
    }

    const amount = Number(orderAmount);
    const promo = await Promo.findOne({ code: code.toUpperCase().trim() });

    if (!promo || !promo.isActive) {
      throw new ApiError(404, 'Invalid promo code');
    }

    if (new Date(promo.expiresAt) < new Date()) {
      throw new ApiError(400, 'This promo code has expired');
    }

    if (promo.usedCount >= promo.usageLimit) {
      throw new ApiError(400, 'This promo code has reached its usage limit');
    }

    if (amount < promo.minOrderAmount) {
      throw new ApiError(
        400,
        `Minimum booking amount of ₹${promo.minOrderAmount} required for this promo`
      );
    }

    const discount = calculateDiscount(promo, amount);

    return {
      code: promo.code,
      discount,
      finalAmount: amount - discount,
    };
  } catch (error) {
    throw error;
  }
};

const redeemPromo = async (code, orderAmount) => {
  try {
    const result = await validatePromo(code, orderAmount);
    await Promo.findOneAndUpdate({ code: result.code }, { $inc: { usedCount: 1 } });

    return result;
  } catch (error) {
    throw error;
  }
};

export default {
  getActivePromos,
  validatePromo,
  redeemPromo,
};

