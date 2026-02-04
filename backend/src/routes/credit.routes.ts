import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create a credit limit increase request (DEALER only)
router.post('/request', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        // Check role
        if (req.user?.role !== 'DEALER') {
            return res.status(403).json({ success: false, message: 'Access denied. Dealers only.' });
        }

        const { amount, notes } = req.body;
        const userId = req.user!.userId;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const currentLimit = user.creditLimit;
        const requestedIncrease = Number(amount) - Number(currentLimit);

        if (requestedIncrease <= 0) {
            return res.status(400).json({ success: false, message: 'Requested amount must be higher than current limit' });
        }

        const request = await prisma.creditRequest.create({
            data: {
                userId,
                amount: Number(amount),
                currentLimit: Number(currentLimit),
                requestedIncrease: Number(requestedIncrease),
                notes,
                status: 'PENDING'
            }
        });

        res.json({ success: true, data: request });
    } catch (error) {
        console.error('Error creating credit request:', error);
        res.status(500).json({ success: false, message: 'Failed to create request' });
    }
});

// Get requests for logged-in dealer
router.get('/my-requests', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        if (req.user?.role !== 'DEALER') {
            return res.status(403).json({ success: false, message: 'Access denied. Dealers only.' });
        }

        const requests = await prisma.creditRequest.findMany({
            where: { userId: req.user!.userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: requests });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch requests' });
    }
});

// Admin: Get all requests (optionally filter by status)
router.get('/admin/requests', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
        }

        const { status } = req.query;
        const whereClause: any = {};
        if (status) whereClause.status = status;

        const requests = await prisma.creditRequest.findMany({
            where: whereClause,
            include: { user: { select: { name: true, companyName: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: requests });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch requests' });
    }
});

// Admin: Approve or Reject request
router.patch('/admin/requests/:id/respond', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
        }

        const { id } = req.params;
        const { status, adminNotes } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const request = await prisma.creditRequest.findUnique({ where: { id } });
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'Request is already processed' });
        }

        // Transaction to update request and user limit if approved
        const result = await prisma.$transaction(async (tx) => {
            const updatedRequest = await tx.creditRequest.update({
                where: { id },
                data: { status, adminNotes }
            });

            if (status === 'APPROVED') {
                // Get current user credit limit and ADD the approved amount
                const currentUser = await tx.user.findUnique({
                    where: { id: request.userId },
                    select: { creditLimit: true }
                });

                const currentLimit = currentUser?.creditLimit ? Number(currentUser.creditLimit) : 0;
                const newLimit = currentLimit + Number(request.amount);

                await tx.user.update({
                    where: { id: request.userId },
                    data: { creditLimit: newLimit }
                });
            }

            return updatedRequest;
        });

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error responding to request:', error);
        res.status(500).json({ success: false, message: 'Failed to update request' });
    }
});

export default router;
