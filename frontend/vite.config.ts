import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        allowedHosts: true,
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split vendor libraries
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-icons': ['lucide-react'],
                    // Split large page components
                    'admin': [
                        './src/pages/admin/AdminDashboard.tsx',
                    ],
                    'dealer': [
                        './src/pages/dealer/DealerDashboard.tsx',
                    ],
                },
            },
        },
    },
})
