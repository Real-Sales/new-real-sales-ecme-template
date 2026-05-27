import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dynamicImport from 'vite-plugin-dynamic-import'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const razorpayKeyId =
        env.RAZORPAY_KEY_ID?.trim() || env.VITE_RAZORPAY_KEY_ID?.trim() || ''

    return {
        define: {
            'import.meta.env.RAZORPAY_KEY_ID': JSON.stringify(razorpayKeyId),
        },
        plugins: [react(), dynamicImport()],
        assetsInclude: ['**/*.md'],
        resolve: {
            alias: {
                '@': path.join(__dirname, 'src'),
            },
        },
        server: {
            allowedHosts: [
                'spinach-moonscape-supply.ngrok-free.dev',
                '.ngrok-free.dev',
            ],
            // Browser calls /api/* on the Vite origin; forward to local FastAPI (default :8000).
            proxy: {
                '/api': {
                    target:
                        env.VITE_DEV_PROXY_TARGET?.trim() ||
                        'http://127.0.0.1:8000',
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        optimizeDeps: {
            include: ['gsap', 'gsap/ScrollTrigger', '@gsap/react'],
        },
        build: {
            outDir: 'build',
        },
    }
})
