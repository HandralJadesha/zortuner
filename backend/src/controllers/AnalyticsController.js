import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { CustomOrder } from '../models/CustomOrder.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const paidOrders = await Order.find({ isPaid: true, orderStatus: { $ne: 'Cancelled' } });
    
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.priceDetails.totalPrice, 0);
    const totalOrdersCount = await Order.countDocuments();
    const totalCustomersCount = await User.countDocuments({ role: 'customer' });
    
    const activeCustomPrintsCount = await CustomOrder.countDocuments({
      status: { $in: ['Pending Quote', 'Quoted', 'Approved', 'Printing'] }
    });

    const period = req.query.period || 'month';
    let groupId = {};
    let sortObj = {};

    if (period === 'day') {
      groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
      sortObj = { '_id.year': 1, '_id.month': 1, '_id.day': 1 };
    } else if (period === 'year') {
      groupId = { year: { $year: '$createdAt' } };
      sortObj = { '_id.year': 1 };
    } else {
      groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
      sortObj = { '_id.year': 1, '_id.month': 1 };
    }

    const salesTrend = await Order.aggregate([
      { $match: { isPaid: true, orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: groupId,
          revenue: { $sum: '$priceDetails.totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: sortObj }
    ]);

    const categoryDistribution = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetails.category',
          foreignField: '_id',
          as: 'catDetails'
        }
      },
      { $unwind: '$catDetails' },
      {
        $group: {
          _id: '$catDetails.name',
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          quantitySold: { $sum: '$orderItems.quantity' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const lowStockAlerts = await Product.find({ inventory: { $lt: 5 } }).select('title inventory basePrice');

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrdersCount,
        totalCustomersCount,
        activeCustomPrintsCount
      },
      salesTrend,
      categoryDistribution,
      lowStockAlerts,
      recentOrders
    });
  } catch (error) {
    next(error);
  }
};
