import { Router } from 'express';

// Middleware imports
import { protect, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

// Schema validation imports
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  productSchema,
  customOrderSchema,
  orderSchema,
  ticketSchema
} from '../validations/schemas.js';

// Controller imports
import * as AuthController from '../controllers/AuthController.js';
import * as CategoryController from '../controllers/CategoryController.js';
import * as ProductController from '../controllers/ProductController.js';
import * as CartController from '../controllers/CartController.js';
import * as WishlistController from '../controllers/WishlistController.js';
import * as CustomOrderController from '../controllers/CustomOrderController.js';
import * as OrderController from '../controllers/OrderController.js';
import * as ReviewController from '../controllers/ReviewController.js';
import * as CouponController from '../controllers/CouponController.js';
import * as SupportController from '../controllers/SupportController.js';
import * as AnalyticsController from '../controllers/AnalyticsController.js';
import * as UploadController from '../controllers/UploadController.js';
import invoiceRoutes from './invoiceRoutes.js';

const router = Router();

// --- Upload Route ---
router.post('/upload', protect, authorize('admin'), UploadController.uploadImage);

// --- Auth Routes ---
router.post('/auth/signup', validateRequest(registerSchema), AuthController.signUp);
router.post('/auth/login', validateRequest(loginSchema), AuthController.signIn);
router.post('/auth/verify-otp', validateRequest(verifyOtpSchema), AuthController.verifyOtp);
router.post('/auth/google', AuthController.googleLogin);
router.get('/auth/profile', protect, AuthController.getProfile);
router.get('/auth/users', protect, authorize('admin'), AuthController.getAllUsers);
router.delete('/auth/users/:id', protect, authorize('admin'), AuthController.deleteUser);
router.post('/auth/address', protect, AuthController.updateProfileAddress);
router.put('/auth/address/:addressId', protect, AuthController.editProfileAddress);
router.delete('/auth/address/:addressId', protect, AuthController.deleteProfileAddress);

// --- Category Routes ---
router.get('/categories', CategoryController.getCategories);
router.post('/categories', protect, authorize('admin'), CategoryController.createCategory);
router.delete('/categories/:id', protect, authorize('admin'), CategoryController.deleteCategory);

// --- Product Routes ---
router.get('/products', ProductController.getProducts);
router.get('/products/:key', ProductController.getProductByIdOrSlug);
router.post('/products', protect, authorize('admin'), validateRequest(productSchema), ProductController.createProduct);
router.put('/products/:id', protect, authorize('admin'), ProductController.updateProduct);
router.delete('/products/:id', protect, authorize('admin'), ProductController.deleteProduct);

// --- Cart Routes ---
router.get('/cart', protect, CartController.getCart);
router.post('/cart', protect, CartController.addToCart);
router.put('/cart/:itemId', protect, CartController.updateCartItemQuantity);
router.delete('/cart/clear', protect, CartController.clearCart);
router.delete('/cart/:itemId', protect, CartController.removeFromCart);

// --- Wishlist Routes ---
router.get('/wishlist', protect, WishlistController.getWishlist);
router.post('/wishlist', protect, WishlistController.toggleWishlistItem);

// --- Custom 3D Order Routes ---
router.post('/custom-orders/estimate', parseStlFallbackHelper, CustomOrderController.parseStlAndEstimate);
router.post('/custom-orders', protect, validateRequest(customOrderSchema), CustomOrderController.createCustomOrder);
router.get('/custom-orders/my', protect, CustomOrderController.getMyCustomOrders);
router.get('/custom-orders/admin', protect, authorize('admin'), CustomOrderController.adminGetCustomOrders);
router.get('/custom-orders/:id', protect, CustomOrderController.getCustomOrderDetails);
router.put('/custom-orders/:id/quote', protect, authorize('admin'), CustomOrderController.adminUpdateQuote);
router.post('/custom-orders/:id/chat', protect, CustomOrderController.sendMessage);

// --- Order Routes ---
router.post('/orders', protect, validateRequest(orderSchema), OrderController.createOrder);
router.post('/orders/verify', protect, OrderController.verifyPayment);
router.get('/orders/my', protect, OrderController.getMyOrders);
router.get('/orders/admin', protect, authorize('admin'), OrderController.adminGetOrders);
router.get('/orders/:id', protect, OrderController.getOrderDetails);
router.get('/orders/:id/receipt', protect, OrderController.downloadReceipt);
router.get('/orders/:id/invoice', protect, OrderController.downloadOrderInvoice);
router.put('/orders/:id/status', protect, authorize('admin'), OrderController.adminUpdateOrderStatus);

// --- Review Routes ---
router.post('/reviews', protect, ReviewController.addReview);
router.get('/reviews/:productId', ReviewController.getProductReviews);

// --- Coupon Routes ---
router.get('/coupons', protect, authorize('admin'), CouponController.getCoupons);
router.post('/coupons', protect, authorize('admin'), CouponController.createCoupon);
router.put('/coupons/:id', protect, authorize('admin'), CouponController.updateCoupon);
router.post('/coupons/validate', protect, CouponController.validateCoupon);
router.delete('/coupons/:id', protect, authorize('admin'), CouponController.deleteCoupon);

// --- Support Routes ---
router.post('/support/guest-ticket', SupportController.createGuestTicket);
router.post('/support/tickets', protect, validateRequest(ticketSchema), SupportController.createTicket);
router.get('/support/tickets/my', protect, SupportController.getMyTickets);
router.get('/support/tickets/admin', protect, authorize('admin'), SupportController.adminGetTickets);
router.get('/support/tickets/:id', protect, SupportController.getTicketDetails);
router.post('/support/tickets/:id/reply', protect, SupportController.replyToTicket);

// --- Notification Routes ---
router.get('/notifications', protect, SupportController.getMyNotifications);
router.put('/notifications/read', protect, SupportController.markNotificationsRead);

// --- Invoice Routes ---
router.use('/invoices', invoiceRoutes);

// --- Analytics Routes ---
router.get('/analytics/dashboard', protect, authorize('admin'), AnalyticsController.getDashboardStats);

function parseStlFallbackHelper(req, res, next) {
  if (req.headers['content-type'] === 'application/octet-stream') {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      req.body = Buffer.concat(chunks);
      next();
    });
  } else {
    next();
  }
}

export default router;
