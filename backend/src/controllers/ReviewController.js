import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { AppError } from '../middleware/error.js';

export const addReview = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const { product: productId, rating, comment, images } = req.body;

    const existingReview = await Review.findOne({ user: req.user.id, product: productId });
    if (existingReview) {
      return next(new AppError('You have already reviewed this product', 400));
    }

    const review = new Review({
      user: req.user.id,
      product: productId,
      rating,
      comment,
      images
    });

    await review.save();

    const reviews = await Review.find({ product: productId });
    const numReviews = reviews.length;
    const averageRating = reviews.reduce((sum, item) => sum + item.rating, 0) / numReviews;

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10,
      numReviews
    });

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    next(error);
  }
};
