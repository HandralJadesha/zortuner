import { Wishlist } from '../models/Wishlist.js';
import { AppError } from '../middleware/error.js';

export const getWishlist = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, products: [] });
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      wishlist
    });
  } catch (error) {
    next(error);
  }
};

export const toggleWishlistItem = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, products: [] });
    }

    const index = wishlist.products.indexOf(productId);
    if (index > -1) {
      wishlist.products.splice(index, 1);
    } else {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    const populatedWishlist = await wishlist.populate('products');

    res.status(200).json({
      success: true,
      wishlist: populatedWishlist
    });
  } catch (error) {
    next(error);
  }
};
