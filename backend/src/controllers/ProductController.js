import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { AppError } from '../middleware/error.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      priceMin,
      priceMax,
      materials,
      colors,
      rating,
      sort,
      page = 1,
      limit = 12,
      featured,
      bestseller,
      newArrival
    } = req.query;

    const query = {};

    if (search) {
      const matchingCategories = await Category.find({
        name: { $regex: search, $options: 'i' }
      });
      const catIds = matchingCategories.map(c => c._id);

      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $in: catIds } }
      ];
    }

    if (category) {
      const catObj = await Category.findOne({
        $or: [
          { _id: category.toString().match(/^[0-9a-fA-F]{24}$/) ? category.toString() : null },
          { slug: category.toString() }
        ].filter(Boolean)
      });
      if (catObj) {
        query.category = catObj._id;
      } else {
        query.category = null;
      }
    }

    if (priceMin || priceMax) {
      query.basePrice = {};
      if (priceMin) query.basePrice.$gte = Number(priceMin);
      if (priceMax) query.basePrice.$lte = Number(priceMax);
    }

    if (materials) {
      const materialList = materials.split(',');
      query.materials = { $in: materialList };
    }

    if (colors) {
      const colorList = colors.split(',');
      query.colors = { $in: colorList };
    }

    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }

    if (featured === 'true') query.isFeatured = true;
    if (bestseller === 'true') query.isBestseller = true;
    if (newArrival === 'true') query.isNewArrival = true;

    if (req.query.includeHidden !== 'true') {
      query.isHidden = { $ne: true };
    }

    let sortQuery = { createdAt: -1 };
    if (sort) {
      switch (sort) {
        case 'priceAsc':
          sortQuery = { basePrice: 1 };
          break;
        case 'priceDesc':
          sortQuery = { basePrice: -1 };
          break;
        case 'rating':
          sortQuery = { averageRating: -1 };
          break;
        case 'popularity':
          sortQuery = { numReviews: -1 };
          break;
        case 'newest':
        default:
          sortQuery = { createdAt: -1 };
          break;
      }
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skipNum = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortQuery)
      .skip(skipNum)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      products
    });
  } catch (error) {
    next(error);
  }
};

export const getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { key } = req.params;
    
    const isId = /^[0-9a-fA-F]{24}$/.test(key);
    const query = isId ? { _id: key } : { slug: key };

    const product = await Product.findOne(query).populate('category', 'name slug');
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { title, description, category, basePrice, discountPrice, images, materials, colors, dimensions, weight, inventory, printDuration, isFeatured, isBestseller, isNewArrival, isHidden } = req.body;
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return next(new AppError('Product slug (title) already exists', 400));
    }

    const product = new Product({
      title,
      slug,
      description,
      category,
      basePrice,
      discountPrice,
      images,
      materials,
      colors,
      dimensions,
      weight,
      inventory,
      printDuration,
      isFeatured,
      isBestseller,
      isNewArrival,
      isHidden
    });

    await product.save();

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
