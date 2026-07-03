import { Coupon } from '../models/Coupon.js';
import { AppError } from '../middleware/error.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return next(new AppError('Coupon code is required', 400));
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) {
      return next(new AppError('Invalid or inactive coupon code', 404));
    }

    if (new Date() > coupon.expiryDate) {
      return next(new AppError('Coupon has expired', 400));
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      return next(new AppError('Coupon usage limit reached', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Coupon is valid!',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, expiryDate, usageLimit } = req.body;
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return next(new AppError('Coupon code already exists', 400));
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expiryDate: new Date(expiryDate),
      usageLimit
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      coupon
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return next(new AppError('Coupon not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json({
      success: true,
      coupons
    });
  } catch (error) {
    next(error);
  }
};


export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, discountType, discountValue, expiryDate, usageLimit, active } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return next(new AppError('Coupon not found', 404));
    }

    if (code && code.toUpperCase() !== coupon.code) {
      const existing = await Coupon.findOne({ code: code.toUpperCase() });
      if (existing) {
        return next(new AppError('Coupon code already exists', 400));
      }
      coupon.code = code.toUpperCase();
    }

    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (expiryDate) coupon.expiryDate = new Date(expiryDate);
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (active !== undefined) coupon.active = active;

    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      coupon
    });
  } catch (error) {
    next(error);
  }
};
