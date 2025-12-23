import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface EnvConfig {
    // Server
    port: number;
    nodeEnv: string;

    // Database
    databaseUrl: string;

    // Redis
    redisUrl: string;

    // JWT
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtRefreshSecret: string;
    jwtRefreshExpiresIn: string;

    // Seller Details
    sellerName: string;
    sellerGstin: string;
    sellerStateCode: string;
    sellerState: string;
    sellerAddress: string;
    sellerPhone: string;
    sellerEmail: string;

    // Razorpay
    razorpayKeyId: string;
    razorpayKeySecret: string;

    // Email
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser: string;
    smtpPass: string;
    emailFrom: string;

    // Admin
    adminEmail: string;
    adminPhone: string;

    // Storage
    uploadDir: string;
    maxFileSize: number;

    // Frontend
    frontendUrl: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
}

function getEnvVarOptional(key: string, defaultValue: string = ''): string {
    return process.env[key] || defaultValue;
}

export const env: EnvConfig = {
    // Server
    port: parseInt(getEnvVar('PORT', '3001'), 10),
    nodeEnv: getEnvVar('NODE_ENV', 'development'),

    // Database
    databaseUrl: getEnvVar('DATABASE_URL'),

    // Redis
    redisUrl: getEnvVar('REDIS_URL', 'redis://localhost:6379'),

    // JWT
    jwtSecret: getEnvVar('JWT_SECRET'),
    jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),
    jwtRefreshSecret: getEnvVar('JWT_REFRESH_SECRET'),
    jwtRefreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', '30d'),

    // Seller Details
    sellerName: getEnvVar('SELLER_NAME', 'Homelia Laminates'),
    sellerGstin: getEnvVar('SELLER_GSTIN'),
    sellerStateCode: getEnvVar('SELLER_STATE_CODE', '27'),
    sellerState: getEnvVar('SELLER_STATE', 'Maharashtra'),
    sellerAddress: getEnvVar('SELLER_ADDRESS'),
    sellerPhone: getEnvVar('SELLER_PHONE'),
    sellerEmail: getEnvVar('SELLER_EMAIL'),

    // Razorpay
    razorpayKeyId: getEnvVarOptional('RAZORPAY_KEY_ID'),
    razorpayKeySecret: getEnvVarOptional('RAZORPAY_KEY_SECRET'),

    // Email
    smtpHost: getEnvVarOptional('SMTP_HOST', 'smtp.gmail.com'),
    smtpPort: parseInt(getEnvVarOptional('SMTP_PORT', '587'), 10),
    smtpSecure: getEnvVarOptional('SMTP_SECURE', 'false') === 'true',
    smtpUser: getEnvVarOptional('SMTP_USER'),
    smtpPass: getEnvVarOptional('SMTP_PASS'),
    emailFrom: getEnvVarOptional('EMAIL_FROM', 'Homelia <noreply@homelia.in>'),

    // Admin
    adminEmail: getEnvVar('ADMIN_EMAIL', 'admin@homelia.in'),
    adminPhone: getEnvVarOptional('ADMIN_PHONE'),

    // Storage
    uploadDir: getEnvVar('UPLOAD_DIR', './uploads'),
    maxFileSize: parseInt(getEnvVar('MAX_FILE_SIZE', '10485760'), 10),

    // Frontend
    frontendUrl: getEnvVar('FRONTEND_URL', 'http://localhost:5173'),
};

export const isProduction = env.nodeEnv === 'production';
export const isDevelopment = env.nodeEnv === 'development';
