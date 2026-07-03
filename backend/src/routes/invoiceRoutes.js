import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as InvoiceController from '../controllers/InvoiceController.js';

const router = Router();

router.get('/my', protect, InvoiceController.getMyInvoices);
router.get('/admin', protect, authorize('admin'), InvoiceController.adminGetInvoices);
router.get('/:id/download', protect, InvoiceController.downloadInvoice);
router.post('/:id/resend', protect, authorize('admin'), InvoiceController.resendInvoiceEmail);

export default router;
