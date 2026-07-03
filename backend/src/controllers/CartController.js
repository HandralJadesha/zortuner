import { Cart } from '../models/Cart.js';
import { AppError } from '../middleware/error.js';

export const getCart = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const { product, quantity, selectedMaterial, selectedColor } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === product &&
        item.selectedMaterial === selectedMaterial &&
        item.selectedColor === selectedColor
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      cart.items.push({ product, quantity, selectedMaterial, selectedColor });
    }

    await cart.save();
    const populatedCart = await cart.populate('items.product');

    res.status(200).json({
      success: true,
      cart: populatedCart
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItemQuantity = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    const item = cart.items.find((item) => item._id.toString() === itemId);
    if (!item) {
      return next(new AppError('Item not found in cart', 404));
    }

    item.quantity = Number(quantity);
    await cart.save();
    
    const populatedCart = await cart.populate('items.product');

    res.status(200).json({
      success: true,
      cart: populatedCart
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();
    
    const populatedCart = await cart.populate('items.product');

    res.status(200).json({
      success: true,
      cart: populatedCart
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    next(error);
  }
};
