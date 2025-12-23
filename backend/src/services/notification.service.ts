import { prisma } from '../config/database.js';
import { NotificationType, Role } from '@prisma/client';
import { env } from '../config/env.js';

interface NotificationData {
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    recipientId?: string;
    recipientRole?: Role;
}

class NotificationService {
    /**
     * Create a notification in the database
     */
    async create(input: NotificationData): Promise<void> {
        await prisma.notification.create({
            data: {
                type: input.type,
                title: input.title,
                message: input.message,
                data: input.data,
                recipientId: input.recipientId,
                recipientRole: input.recipientRole,
            }
        });
    }

    /**
     * Notify admin on new order
     */
    async notifyNewOrder(order: { orderNumber: string; totalAmount: number; userId: string }): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: order.userId },
            select: { name: true, companyName: true }
        });

        await this.create({
            type: NotificationType.NEW_ORDER,
            title: 'New Order Received',
            message: `Order ${order.orderNumber} placed by ${user?.companyName || user?.name || 'Customer'} for ₹${order.totalAmount.toLocaleString('en-IN')}`,
            data: { orderNumber: order.orderNumber, amount: order.totalAmount },
            recipientRole: Role.ADMIN,
        });

        // TODO: Queue email notification to admin
        console.log(`📧 [EMAIL] New order notification: ${order.orderNumber}`);
    }

    /**
     * Notify admin on new RFQ
     */
    async notifyNewQuote(quote: { quoteNumber: string; userId: string; itemCount: number }): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: quote.userId },
            select: { name: true, companyName: true }
        });

        await this.create({
            type: NotificationType.NEW_QUOTE,
            title: 'New Quote Request',
            message: `RFQ ${quote.quoteNumber} submitted by ${user?.companyName || user?.name || 'Customer'} with ${quote.itemCount} products`,
            data: { quoteNumber: quote.quoteNumber },
            recipientRole: Role.ADMIN,
        });

        console.log(`📧 [EMAIL] New RFQ notification: ${quote.quoteNumber}`);
    }

    /**
     * Notify admin on payment received
     */
    async notifyPaymentReceived(payment: { orderNumber: string; amount: number; paymentMethod: string }): Promise<void> {
        await this.create({
            type: NotificationType.PAYMENT_RECEIVED,
            title: 'Payment Received',
            message: `Payment of ₹${payment.amount.toLocaleString('en-IN')} received for order ${payment.orderNumber} via ${payment.paymentMethod}`,
            data: payment,
            recipientRole: Role.ADMIN,
        });

        console.log(`📧 [EMAIL] Payment received notification: ${payment.orderNumber}`);
    }

    /**
     * Notify admin on sample request
     */
    async notifySampleRequest(sample: { requestNumber: string; name: string; totalSamples: number }): Promise<void> {
        await this.create({
            type: NotificationType.SAMPLE_REQUEST,
            title: 'New Sample Request',
            message: `Sample request ${sample.requestNumber} from ${sample.name} for ${sample.totalSamples} samples`,
            data: sample,
            recipientRole: Role.ADMIN,
        });

        console.log(`📧 [EMAIL] Sample request notification: ${sample.requestNumber}`);
    }

    /**
     * Notify user on order status update
     */
    async notifyOrderStatusUpdate(userId: string, order: { orderNumber: string; status: string }): Promise<void> {
        const statusMessages: Record<string, string> = {
            CONFIRMED: 'Your order has been confirmed',
            PROCESSING: 'Your order is being processed',
            INVOICED: 'Invoice for your order is ready',
            SHIPPED: 'Your order has been shipped',
            DELIVERED: 'Your order has been delivered',
            CANCELLED: 'Your order has been cancelled',
        };

        await this.create({
            type: NotificationType.ORDER_STATUS_UPDATE,
            title: 'Order Update',
            message: `${statusMessages[order.status] || order.status}: ${order.orderNumber}`,
            data: order,
            recipientId: userId,
        });
    }

    /**
     * Notify user on quote status update
     */
    async notifyQuoteStatusUpdate(userId: string, quote: { quoteNumber: string; status: string }): Promise<void> {
        const statusMessages: Record<string, string> = {
            UNDER_REVIEW: 'Your quote is under review',
            QUOTED: 'Your quote is ready for review',
            APPROVED: 'Your quote has been approved',
            REJECTED: 'Your quote has been rejected',
        };

        await this.create({
            type: NotificationType.QUOTE_STATUS_UPDATE,
            title: 'Quote Update',
            message: `${statusMessages[quote.status] || quote.status}: ${quote.quoteNumber}`,
            data: quote,
            recipientId: userId,
        });
    }

    /**
     * Notify admin on new user registration
     */
    async notifyNewUser(user: { id: string; name: string; email: string; role: Role }): Promise<void> {
        await this.create({
            type: NotificationType.USER_REGISTERED,
            title: 'New User Registration',
            message: `New ${user.role.toLowerCase().replace('_', ' ')} registered: ${user.name} (${user.email})`,
            data: { userId: user.id, name: user.name, email: user.email, role: user.role },
            recipientRole: Role.ADMIN,
        });
    }

    /**
     * Get notifications for a user
     */
    async getForUser(userId: string, limit: number = 20): Promise<unknown[]> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        return prisma.notification.findMany({
            where: {
                OR: [
                    { recipientId: userId },
                    { recipientRole: user?.role },
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Get unread count for user
     */
    async getUnreadCount(userId: string): Promise<number> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        return prisma.notification.count({
            where: {
                isRead: false,
                OR: [
                    { recipientId: userId },
                    { recipientRole: user?.role },
                ]
            }
        });
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true, readAt: new Date() }
        });
    }

    /**
     * Mark all notifications as read for user
     */
    async markAllAsRead(userId: string): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        await prisma.notification.updateMany({
            where: {
                isRead: false,
                OR: [
                    { recipientId: userId },
                    { recipientRole: user?.role },
                ]
            },
            data: { isRead: true, readAt: new Date() }
        });
    }
}

export const notificationService = new NotificationService();
