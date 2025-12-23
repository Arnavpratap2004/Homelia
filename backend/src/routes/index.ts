import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productsRoutes from './products.routes.js';
import ordersRoutes from './orders.routes.js';
import quotesRoutes from './quotes.routes.js';
import invoicesRoutes from './invoices.routes.js';
import notificationsRoutes from './notifications.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/quotes', quotesRoutes);
router.use('/invoices', invoicesRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/admin', adminRoutes);

// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

export default router;
