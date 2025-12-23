import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { Role } from '@prisma/client';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { notificationService } from './notification.service.js';

interface RegisterInput {
    email: string;
    phone: string;
    password: string;
    name: string;
    companyName?: string;
    gstNumber?: string;
    role?: Role;
}

interface LoginInput {
    email: string;
    password: string;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

interface UserResponse {
    id: string;
    email: string;
    phone: string;
    name: string;
    role: Role;
    companyName: string | null;
    gstNumber: string | null;
    isVerified: boolean;
}

class AuthService {
    private readonly SALT_ROUNDS = 12;

    async register(input: RegisterInput): Promise<{ user: UserResponse; tokens: AuthTokens }> {
        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: input.email.toLowerCase() },
                    { phone: input.phone }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === input.email.toLowerCase()) {
                throw ApiError.conflict('Email already registered');
            }
            throw ApiError.conflict('Phone number already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, this.SALT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: input.email.toLowerCase(),
                phone: input.phone,
                passwordHash,
                name: input.name,
                companyName: input.companyName,
                gstNumber: input.gstNumber,
                role: input.role || Role.RETAIL_CUSTOMER,
            },
            select: {
                id: true,
                email: true,
                phone: true,
                name: true,
                role: true,
                companyName: true,
                gstNumber: true,
                isVerified: true,
            }
        });

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);

        // Store refresh token
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken }
        });

        // Notify admin of new user registration
        await notificationService.notifyNewUser(user);

        return {
            user,
            tokens: { accessToken, refreshToken }
        };
    }

    async login(input: LoginInput): Promise<{ user: UserResponse; tokens: AuthTokens }> {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: input.email.toLowerCase() }
        });

        if (!user) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        if (!user.isActive) {
            throw ApiError.forbidden('Account is deactivated');
        }

        // Verify password
        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);

        // Store refresh token
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken }
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                role: user.role,
                companyName: user.companyName,
                gstNumber: user.gstNumber,
                isVerified: user.isVerified,
            },
            tokens: { accessToken, refreshToken }
        };
    }

    async refreshTokens(refreshToken: string): Promise<AuthTokens> {
        const payload = verifyRefreshToken(refreshToken);
        if (!payload) {
            throw ApiError.unauthorized('Invalid refresh token');
        }

        // Verify token matches stored token
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, role: true, refreshToken: true, isActive: true }
        });

        if (!user || !user.isActive || user.refreshToken !== refreshToken) {
            throw ApiError.unauthorized('Invalid refresh token');
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken(user.id, user.role);
        const newRefreshToken = generateRefreshToken(user.id);

        // Update stored refresh token
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken }
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }

    async logout(userId: string): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null }
        });
    }

    async getProfile(userId: string): Promise<UserResponse & { billingAddress: unknown; shippingAddress: unknown }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                phone: true,
                name: true,
                role: true,
                companyName: true,
                gstNumber: true,
                isVerified: true,
                billingAddress: true,
                shippingAddress: true,
            }
        });

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        return user;
    }

    async updateProfile(
        userId: string,
        data: {
            name?: string;
            phone?: string;
            companyName?: string;
            gstNumber?: string;
            billingAddress?: unknown;
            shippingAddress?: unknown;
        }
    ): Promise<UserResponse> {
        // If phone is being updated, check it's not taken
        if (data.phone) {
            const existing = await prisma.user.findFirst({
                where: { phone: data.phone, id: { not: userId } }
            });
            if (existing) {
                throw ApiError.conflict('Phone number already in use');
            }
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...data,
                billingAddress: data.billingAddress as object,
                shippingAddress: data.shippingAddress as object,
            },
            select: {
                id: true,
                email: true,
                phone: true,
                name: true,
                role: true,
                companyName: true,
                gstNumber: true,
                isVerified: true,
            }
        });

        return user;
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { passwordHash: true }
        });

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            throw ApiError.badRequest('Current password is incorrect');
        }

        const newHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHash }
        });
    }
}

export const authService = new AuthService();
