import { prisma } from '../config/database.js';
import { Brand, Category, Finish, Prisma } from '@prisma/client';
import { ApiError } from '../middleware/errorHandler.js';
import { getPaginationParams, createPaginatedResult, PaginatedResult } from '../utils/helpers.js';
import { cacheGet, cacheSet, cacheDeletePattern } from '../config/redis.js';

interface ProductFilters {
    brand?: Brand;
    category?: Category;
    finish?: Finish;
    collection?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    featured?: boolean;
    bestseller?: boolean;
}

interface ProductListParams extends ProductFilters {
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'price' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

interface CreateProductInput {
    name: string;
    productCode: string;
    brand: Brand;
    category: Category;
    collection?: string;
    finish: Finish;
    texture: string;
    thickness: string;
    sheetSize: string;
    applications: string[];
    price?: number;
    dealerPrice?: number;
    b2bPrice?: number;
    isPriceOnRequest?: boolean;
    hsnCode?: string;
    gstRate?: number;
    moq?: number;
    stockQuantity?: number;
    images?: string[];
    colors?: string[];
    description?: string;
    technicalSpecs?: Record<string, string>;
    isActive?: boolean;
    isFeatured?: boolean;
    isBestseller?: boolean;
}

class ProductService {
    private readonly CACHE_PREFIX = 'products:';
    private readonly CACHE_TTL = 3600; // 1 hour

    /**
     * Get paginated list of products with filters
     */
    async list(params: ProductListParams): Promise<PaginatedResult<unknown>> {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = params;
        const { skip, take } = getPaginationParams({ page, limit });

        // Build where clause
        const where: Prisma.ProductWhereInput = {
            isActive: true,
        };

        if (filters.brand) where.brand = filters.brand;
        if (filters.category) where.category = filters.category;
        if (filters.finish) where.finish = filters.finish;
        if (filters.collection) where.collection = filters.collection;
        if (filters.featured !== undefined) where.isFeatured = filters.featured;
        if (filters.bestseller !== undefined) where.isBestseller = filters.bestseller;
        if (filters.inStock) where.stockQuantity = { gt: 0 };

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { productCode: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        if (filters.minPrice || filters.maxPrice) {
            where.price = {};
            if (filters.minPrice) where.price.gte = filters.minPrice;
            if (filters.maxPrice) where.price.lte = filters.maxPrice;
        }

        // Get products and count
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take,
                orderBy: { [sortBy]: sortOrder },
                select: {
                    id: true,
                    name: true,
                    productCode: true,
                    brand: true,
                    category: true,
                    collection: true,
                    finish: true,
                    texture: true,
                    thickness: true,
                    sheetSize: true,
                    price: true,
                    isPriceOnRequest: true,
                    moq: true,
                    stockQuantity: true,
                    images: true,
                    colors: true,
                    isFeatured: true,
                    isBestseller: true,
                }
            }),
            prisma.product.count({ where })
        ]);

        return createPaginatedResult(products, total, page, limit);
    }

    /**
     * Get product by ID
     */
    async getById(id: string): Promise<unknown> {
        const cacheKey = `${this.CACHE_PREFIX}${id}`;

        // Try cache first
        const cached = await cacheGet(cacheKey);
        if (cached) return cached;

        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw ApiError.notFound('Product not found');
        }

        // Cache result
        await cacheSet(cacheKey, product, this.CACHE_TTL);

        return product;
    }

    /**
     * Get products by brand
     */
    async getByBrand(brand: Brand, limit: number = 20): Promise<unknown[]> {
        return prisma.product.findMany({
            where: { brand, isActive: true },
            take: limit,
            orderBy: [
                { isFeatured: 'desc' },
                { isBestseller: 'desc' },
                { name: 'asc' }
            ],
            select: {
                id: true,
                name: true,
                productCode: true,
                brand: true,
                category: true,
                finish: true,
                price: true,
                isPriceOnRequest: true,
                moq: true,
                images: true,
                colors: true,
            }
        });
    }

    /**
     * Get featured products
     */
    async getFeatured(limit: number = 10): Promise<unknown[]> {
        return prisma.product.findMany({
            where: { isFeatured: true, isActive: true },
            take: limit,
            select: {
                id: true,
                name: true,
                productCode: true,
                brand: true,
                category: true,
                price: true,
                images: true,
                colors: true,
            }
        });
    }

    /**
     * Get bestseller products
     */
    async getBestsellers(limit: number = 10): Promise<unknown[]> {
        return prisma.product.findMany({
            where: { isBestseller: true, isActive: true },
            take: limit,
            select: {
                id: true,
                name: true,
                productCode: true,
                brand: true,
                category: true,
                price: true,
                images: true,
                colors: true,
            }
        });
    }

    /**
     * Get unique collections
     */
    async getCollections(brand?: Brand): Promise<string[]> {
        const result = await prisma.product.findMany({
            where: {
                isActive: true,
                collection: { not: null },
                ...(brand && { brand })
            },
            distinct: ['collection'],
            select: { collection: true }
        });

        return result.map(r => r.collection).filter(Boolean) as string[];
    }

    /**
     * Create product (Admin)
     */
    async create(input: CreateProductInput): Promise<unknown> {
        const product = await prisma.product.create({
            data: {
                ...input,
                technicalSpecs: input.technicalSpecs as Prisma.InputJsonValue,
            }
        });

        // Invalidate cache
        await cacheDeletePattern(`${this.CACHE_PREFIX}*`);

        return product;
    }

    /**
     * Update product (Admin)
     */
    async update(id: string, input: Partial<CreateProductInput>): Promise<unknown> {
        const product = await prisma.product.update({
            where: { id },
            data: {
                ...input,
                technicalSpecs: input.technicalSpecs as Prisma.InputJsonValue,
            }
        });

        // Invalidate cache
        await cacheDeletePattern(`${this.CACHE_PREFIX}*`);

        return product;
    }

    /**
     * Update stock quantity (Admin)
     */
    async updateStock(id: string, quantity: number): Promise<void> {
        await prisma.product.update({
            where: { id },
            data: { stockQuantity: quantity }
        });

        await cacheDeletePattern(`${this.CACHE_PREFIX}${id}`);
    }

    /**
     * Soft delete product (Admin)
     */
    async delete(id: string): Promise<void> {
        await prisma.product.update({
            where: { id },
            data: { isActive: false }
        });

        await cacheDeletePattern(`${this.CACHE_PREFIX}*`);
    }
}

export const productService = new ProductService();
